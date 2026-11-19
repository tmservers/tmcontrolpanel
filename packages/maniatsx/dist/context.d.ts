import type { Component, Node } from "./vnode.js";
export interface Context<T> {
    readonly id: symbol;
    readonly defaultValue: T;
    readonly Provider: Component<{
        value: T;
        children?: Node;
    }>;
}
export interface ContextEntry {
    readonly id: symbol;
    readonly value: unknown;
}
export declare const providers: WeakMap<Function, Context<any>>;
export declare const contextRuntime: {
    stack: ContextEntry[] | null;
};
export declare function createContext<T>(defaultValue: T): Context<T>;
export declare function useContext<T>(ctx: Context<T>): T;
