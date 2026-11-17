import { Fragment, VNODE } from "./vnode.js";
export { Fragment };
export function jsx(type, props, key) {
    return Object.freeze({ $$typeof: VNODE, type, props, key: key ?? null });
}
export const jsxs = jsx;
