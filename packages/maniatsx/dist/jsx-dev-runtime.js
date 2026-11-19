import { jsx } from "./jsx-runtime.js";
export { Fragment, jsx, jsxs } from "./jsx-runtime.js";
// Dev-only args (isStatic, source, self) are ignored.
export function jsxDEV(type, props, key, _isStatic, _source, _self) {
    return jsx(type, props, key);
}
