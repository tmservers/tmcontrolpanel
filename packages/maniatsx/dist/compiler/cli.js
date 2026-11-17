import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { compileProject } from "./index.js";
const usage = "Usage: maniatsx-compile --project <tsconfig.json> --out <dir> [--key-prefix <p>] [--check] [--all]";
export async function main(args) {
    let project;
    let out;
    let check = false;
    let all = false;
    let keyPrefix;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--help") {
            console.log(usage);
            return 0;
        }
        if (arg === "--check")
            check = true;
        else if (arg === "--all")
            all = true;
        else if (arg === "--project" || arg === "--out" || arg === "--key-prefix") {
            const value = args[++i];
            if (!value || value.startsWith("--"))
                throw new Error(`${arg} requires a value`);
            if (arg === "--project")
                project = value;
            else if (arg === "--out")
                out = value;
            else
                keyPrefix = value;
        }
        else
            throw new Error(`Unknown argument: ${arg}`);
    }
    if (!project || !out)
        throw new Error(usage);
    const root = path.dirname(path.resolve(project));
    const result = compileProject({ tsconfigPath: path.resolve(project), keyPrefix });
    for (const d of result.diagnostics)
        console.error(`${d.file}:${d.line}:${d.column} ${d.severity} ${d.message}`);
    if (result.diagnostics.some((d) => d.severity === "error"))
        return 1;
    if (!check) {
        for (const [file, code] of result.files) {
            if (!all && code === (await readFile(file, "utf8")))
                continue;
            const relative = path.relative(root, path.resolve(file));
            if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
                throw new Error(`Project file is outside the tsconfig directory: ${file}`);
            const target = path.join(path.resolve(out), relative);
            await mkdir(path.dirname(target), { recursive: true });
            await writeFile(target, code);
        }
    }
    return 0;
}
