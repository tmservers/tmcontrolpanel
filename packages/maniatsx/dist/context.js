// Render-internal: the walker intercepts providers and keeps the active stack here.
export const providers = new WeakMap();
export const contextRuntime = { stack: null };
export function createContext(defaultValue) {
    const id = Symbol("maniatsx.context");
    const Provider = ({ children }) => children;
    const ctx = { id, defaultValue, Provider };
    providers.set(Provider, ctx);
    return ctx;
}
export function useContext(ctx) {
    const stack = contextRuntime.stack;
    if (!stack)
        throw new Error("useContext() can only be called while rendering");
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].id === ctx.id)
            return stack[i].value;
    }
    return ctx.defaultValue;
}
