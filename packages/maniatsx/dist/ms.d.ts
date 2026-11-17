import { type MsCode } from "./vnode.js";
export type MsValue = number | string | boolean | MsCode | readonly MsValue[];
export declare function dedentParts(parts: readonly string[]): string[];
export declare function dedent(text: string): string;
export interface Ms {
    (strings: TemplateStringsArray, ...values: MsValue[]): MsCode;
    /** Real literal that always has a dot: `1.`, `1.5`. */
    real(n: number): MsCode;
    /** Integer literal; throws for non-integers. */
    int(n: number): MsCode;
    /** Vec2 literal `<x, y>` of reals. */
    vec2(x: number, y: number): MsCode;
    /** Trusted ManiaScript inserted verbatim. */
    raw(text: string): MsCode;
}
export declare const ms: Ms;
