import type { Key, VNode } from "./vnode.js";
export { Fragment, jsx, jsxs } from "./jsx-runtime.js";
export type { JSX } from "./jsx-runtime.js";
export declare function jsxDEV(type: VNode["type"], props: Record<string, unknown>, key?: Key, _isStatic?: boolean, _source?: unknown, _self?: unknown): VNode;
