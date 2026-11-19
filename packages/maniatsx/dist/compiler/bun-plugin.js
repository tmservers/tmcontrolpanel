import path from "node:path";
import { compilePluginLoad, formatDiagnostic } from "./plugin-shared.js";
export function maniatsxPlugin(opts = {}) {
    const rootDir = path.resolve(opts.rootDir ?? (opts.tsconfigPath ? path.dirname(opts.tsconfigPath) : "."));
    return {
        name: "maniatsx",
        setup(build) {
            build.onLoad({ filter: /\.[cm]?tsx?$/ }, async ({ path: file }) => {
                const source = await Bun.file(file).text();
                const loader = file.endsWith("x") ? "tsx" : "ts";
                // Runtime plugins (Bun.plugin) must always return contents, so untouched files pass through as-is
                const untouched = { contents: source, loader };
                const result = compilePluginLoad(file, source, rootDir, opts.keyPrefix);
                if (!result)
                    return untouched;
                for (const warning of result.diagnostics.filter((d) => d.severity === "warning"))
                    console.warn(formatDiagnostic(warning));
                const errors = result.diagnostics.filter((d) => d.severity === "error");
                if (errors.length)
                    throw new Error(errors.map(formatDiagnostic).join("\n"));
                return { contents: result.code, loader };
            });
        },
    };
}
