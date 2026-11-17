import { Fragment, type Key, type VNode } from "./vnode.js";
export { Fragment };
export type { JSX } from "./jsx-types.js";
export declare function jsx(type: VNode["type"], props: Record<string, unknown>, key?: Key): VNode;
export declare const jsxs: typeof jsx;
