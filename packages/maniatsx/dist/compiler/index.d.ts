import type { CompiledCode } from "../client/contract.js";
import { type CompileDiagnostic } from "./util.js";
export type { CompileDiagnostic } from "./util.js";
export declare function compileSource(fileName: string, sourceText: string, opts?: {
    rootDir?: string;
}): {
    code: string;
    diagnostics: CompileDiagnostic[];
};
export declare function compileProject({ tsconfigPath }: {
    tsconfigPath: string;
}): {
    files: Map<string, string>;
    diagnostics: CompileDiagnostic[];
};
export declare function debugEmit(code: CompiledCode, values?: unknown[]): string;
