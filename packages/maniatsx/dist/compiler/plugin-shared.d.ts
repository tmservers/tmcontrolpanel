export declare function compilePluginLoad(file: string, source: string, rootDir: string): {
    code: string;
    diagnostics: import("./util.js").CompileDiagnostic[];
} | null;
export declare function formatDiagnostic(d: {
    file: string;
    line: number;
    column: number;
    message: string;
}): string;
