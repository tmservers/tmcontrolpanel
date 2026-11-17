import { type ClientHost } from "../manialink.tsx";
import type { Node } from "../vnode.js";
import { CLIENT, type ClientFn, type ClientRef, type ClientShared, type ClientState, type CompiledCode, type CompiledRuntime } from "./contract.js";
export declare const CLIENT_SCOPE: unique symbol;
export type { ClientHost } from "../manialink.tsx";
export declare function checkSharedKey(key: string, site: string): void;
export declare class ClientScope {
    private host;
    private states;
    private persistedNames;
    private stateCount;
    private used;
    private shareds;
    private refs;
    private attached;
    private functions;
    private handlers;
    private elementCount;
    private controlCount;
    private dirty;
    constructor(host: ClientHost);
    private ensureDirty;
    private body;
    fill(code: CompiledCode): string;
    state(state: ClientState): string;
    private sharedInfo;
    read(shared: ClientShared): string;
    watch(shared: ClientShared, code: CompiledCode): void;
    publish(shared: ClientShared, value: unknown): void;
    private handler;
    private finishShared;
    private persisted;
    ref(ref: ClientRef): string;
    fn(fn: ClientFn): string;
    lifecycle(slot: "main" | "loop", code: CompiledCode): void;
    element(tag: string, props: Record<string, unknown>): Record<string, unknown>;
    finish(): void;
}
export declare function isClient(value: unknown): value is {
    $$typeof: typeof CLIENT;
    kind: string;
};
export interface PublishProps<T> {
    to: ClientShared<T>;
    value: T;
}
export declare function Publish<T>(props: PublishProps<T>): Node;
export declare const __mtx: CompiledRuntime;
