import path from "node:path";
import { readFile } from "node:fs/promises";
import { compilePluginLoad } from "./plugin-shared.js";
export function maniatsxEsbuildPlugin(options = {}) {
    const rootDir = path.resolve(options.rootDir ?? (options.tsconfigPath ? path.dirname(options.tsconfigPath) : "."));
    return {
        name: "maniatsx",
        setup(build) {
            build.onLoad({ filter: /\.[cm]?tsx?$/ }, async ({ path: file }) => {
                const source = await readFile(file, "utf8");
                const loader = file.endsWith("x") ? "tsx" : "ts";
                const result = compilePluginLoad(file, source, rootDir, options.keyPrefix);
                if (!result)
                    return { contents: source, loader };
                const messages = (severity) => result.diagnostics
                    .filter((d) => d.severity === severity)
                    .map((d) => ({
                    text: d.message,
                    location: { file: d.file, line: d.line, column: Math.max(0, d.column - 1) },
                }));
                const errors = messages("error");
                if (errors.length)
                    return { errors, warnings: messages("warning") };
                return { contents: result.code, loader, warnings: messages("warning") };
            });
        },
    };
}
