var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { jsx } from "./jsx-runtime.js";
import { render } from "./render.js";
import { VNODE } from "./vnode.js";
const usage = "Usage: maniatsx <module.tsx> [--export <name>] [--props <json>] [--pretty] [--no-prolog-check] [--out <file>] [--warn-bytes <n>]";
async function main(args) {
    let modulePath;
    let exportName = "default";
    let props = {};
    let pretty = false;
    let prologCheck = true;
    let out;
    let warnBytes;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--help") {
            console.log(usage);
            return;
        }
        if (arg === "--pretty") {
            pretty = true;
            continue;
        }
        if (arg === "--no-prolog-check") {
            prologCheck = false;
            continue;
        }
        if (["--export", "--props", "--out", "--warn-bytes"].includes(arg)) {
            const value = args[++i];
            if (value === undefined || value.startsWith("--"))
                throw new Error(`${arg} requires a value`);
            if (arg === "--export")
                exportName = value;
            if (arg === "--out")
                out = value;
            if (arg === "--warn-bytes") {
                if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
                    throw new Error("--warn-bytes must be a non-negative integer");
                warnBytes = Number(value);
            }
            if (arg === "--props") {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                }
                catch {
                    throw new Error("--props must be a valid JSON object");
                }
                if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
                    throw new Error("--props must be a JSON object");
                props = parsed;
            }
            continue;
        }
        if (arg.startsWith("-"))
            throw new Error(`Unknown option: ${arg}`);
        if (modulePath)
            throw new Error(`Unexpected argument: ${arg}`);
        modulePath = arg;
    }
    if (!modulePath)
        throw new Error(`A module path is required. ${usage}`);
    const exports = await import(__rewriteRelativeImportExtension(pathToFileURL(resolve(modulePath)).href));
    const selected = exports[exportName];
    const available = Object.keys(exports).join(", ") || "(none)";
    let xml;
    let renderedString = false;
    if (typeof selected === "function") {
        let result;
        const component = () => {
            const value = selected(props);
            if (typeof value === "string") {
                result = value;
                return null;
            }
            return value;
        };
        xml = render(jsx(component, {}), {
            pretty,
            warnBytes,
            onWarning: (message) => console.error(message),
        });
        if (result !== undefined) {
            xml = result;
            renderedString = true;
        }
    }
    else if (typeof selected === "string") {
        xml = selected;
        renderedString = true;
    }
    else if (typeof selected === "object" &&
        selected !== null &&
        selected.$$typeof === VNODE) {
        xml = render(selected, {
            pretty,
            warnBytes,
            onWarning: (message) => console.error(message),
        });
    }
    else {
        throw new Error(`Export ${JSON.stringify(exportName)} is missing or unsupported. Available exports: ${available}`);
    }
    const bytes = new TextEncoder().encode(xml).length;
    if (renderedString && warnBytes !== undefined && bytes > warnBytes) {
        console.error(`Output is ${bytes} bytes, over the warnBytes limit of ${warnBytes}`);
    }
    if (prologCheck && !/^\s*<\?xml\s/.test(xml))
        console.error("Warning: XML prolog is missing");
    if (out)
        await Bun.write(resolve(out), xml);
    else
        process.stdout.write(xml.endsWith("\n") ? xml : xml + "\n");
    console.error(`Output: ${bytes} bytes`);
}
main(process.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(process.env.MANIATSX_DEBUG === "1" && error instanceof Error
        ? error.stack
        : message.replace(/[\r\n]+/g, " "));
    process.exitCode = 1;
});
