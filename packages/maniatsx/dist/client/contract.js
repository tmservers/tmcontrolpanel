// Phase 2 contract between the build-time compiler (emits these) and the render-time runtime (consumes them).
export const CLIENT = Symbol.for("maniatsx.client");
// Reserved ManiaScript names: everything prefixed Mtx_. The compiler emits `Mtx_Dirty = True;` after
// every state write; the runtime declares Mtx_Dirty and re-evaluates bindings when it is set. Pages
// without bindings drop the flag and its writes entirely.
export const DIRTY_FLAG = "Mtx_Dirty";
