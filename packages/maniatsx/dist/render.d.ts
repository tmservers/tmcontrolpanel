import { type Context } from "./context.js";
import { type Node } from "./vnode.js";
export interface RenderOptions {
    /** Indent with two spaces, one element per line. Default: compact. */
    pretty?: boolean;
    /** Context values available to the whole tree. */
    contexts?: Array<[Context<any>, unknown]>;
    /** Receives soft problems; defaults to console.warn. */
    onWarning?: (message: string) => void;
    /** Warn when the output exceeds this many bytes. */
    warnBytes?: number;
}
export declare function render(node: Node, options?: RenderOptions): string;
export declare function renderChildren(node: Node, scope?: {
    key: symbol;
    value: unknown;
}): string;
export declare function renderTextElement(name: string, text: string): string;
export declare function useRenderScope<T>(key: symbol): T | undefined;
