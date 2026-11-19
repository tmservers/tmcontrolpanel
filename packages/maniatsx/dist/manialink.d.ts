import type { ManialinkLayer } from "./intrinsics-overrides.js";
import { type MsCode, type Node } from "./vnode.js";
type Slot = "structs" | "globals" | "functions" | "refInit" | "stateInit" | "main" | "events" | "sync" | "loop";
/** Script source: a string, `ms` code, or arrays of those. Nullish and `false` are skipped. */
export type ScriptCode = string | MsCode | false | null | undefined | readonly ScriptCode[];
export interface ManialinkProps {
    /** Manialink id (the game's page id). */
    id: string;
    name?: string;
    /** Display layer; "ScoresTable" shows the page with the scoreboard. */
    layer?: ManialinkLayer;
    /** Emit the XML prolog. Default: true. */
    prolog?: boolean;
    children?: Node;
}
export interface ScriptPartProps {
    children?: ScriptCode;
    /** Dedupes the part within its slot (first wins). Named `id` because the runtime consumes `key`. */
    id?: string;
}
export interface ScriptIncludeProps {
    /** Library name or path, e.g. "TextLib". */
    lib: string;
    /** Alias used in the script, e.g. "TL". */
    as: string;
}
export type ScriptSlot = Slot;
export interface ClientHost {
    part(slot: Slot, code: string, id?: string): void;
    lib(lib: string): string;
    dirty(): string;
    dirtyWrites(on: boolean): void;
}
export interface ClientExtension {
    element(tag: string, props: Record<string, unknown>): Record<string, unknown>;
    finish(): void;
}
export declare function installClientExtension(factory: (host: ClientHost) => ClientExtension): void;
declare function Include(props: ScriptIncludeProps): Node;
/** Script parts register into the nearest `<Manialink>`; they render no XML. */
export declare const Script: {
    Include: typeof Include;
    Globals: (props: ScriptPartProps) => Node;
    Functions: (props: ScriptPartProps) => Node;
    Main: (props: ScriptPartProps) => Node;
    Events: (props: ScriptPartProps) => Node;
    Loop: (props: ScriptPartProps) => Node;
};
export declare function Manialink(props: ManialinkProps): Node;
export {};
