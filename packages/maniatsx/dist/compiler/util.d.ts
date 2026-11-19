import type { MsType } from "../client/contract.js";
export interface CompileDiagnostic {
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
    severity: "error" | "warning";
}
export type HoleSpec = {
    kind: "value";
    type: MsType;
    expr: string;
} | {
    kind: "state" | "shared" | "fn" | "action" | "ref";
    expr: string;
} | {
    kind: "lib";
    lib: string;
};
export declare const libRef: (lib: string) => Item;
export type Item = string | HoleSpec;
export declare function joinItems(items: readonly Item[]): {
    code: string[];
    holes: HoleSpec[];
};
export declare const norm: (path: string) => string;
export declare function stringLiteral(s: string): string;
export declare function decimal(n: number): string;
export declare function realLiteral(n: number): string;
export declare const RESERVED: Set<string>;
export declare function safeLocalName(name: string): string;
