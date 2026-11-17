import ts from "typescript6";
import { compileSource } from "./index.js";
export function compilePluginLoad(file, source, rootDir) {
    if (file.split(/[\\/]/).includes("node_modules") || !/\.tsx?$/.test(file))
        return null;
    if (!ts.preProcessFile(source).importedFiles.some((item) => item.fileName === "maniatsx/client"))
        return null;
    return compileSource(file, source, { rootDir });
}
export function formatDiagnostic(d) {
    return `${d.file}:${d.line}:${d.column} ${d.message}`;
}
