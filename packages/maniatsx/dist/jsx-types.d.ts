import type { IntrinsicElements as ManialinkElements } from "./intrinsics-overrides.js";
import type { Component, Key, VNode } from "./vnode.js";
type WithKey<T> = {
    [K in keyof T]: T[K] & {
        key?: Key;
    };
};
export declare namespace JSX {
    type Element = VNode;
    type ElementType = keyof IntrinsicElements | Component;
    interface ElementChildrenAttribute {
        children: {};
    }
    interface IntrinsicAttributes {
        key?: Key;
    }
    interface IntrinsicElements extends WithKey<ManialinkElements> {
    }
}
export {};
