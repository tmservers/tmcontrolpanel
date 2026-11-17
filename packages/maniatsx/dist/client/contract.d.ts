export declare const CLIENT: unique symbol;
export type MsPrimitive = "Integer" | "Real" | "Boolean" | "Text" | "Vec2" | "Vec3" | "Int2" | "Int3" | "Ident";
export type MsType = MsPrimitive | {
    readonly array: MsType;
} | {
    readonly record: {
        readonly key: "Integer" | "Text" | "Ident";
        readonly value: MsType;
    };
} | {
    readonly struct: string;
    readonly fields?: readonly {
        readonly name: string;
        readonly type: MsType;
    }[];
};
export type SourceSite = string;
export type Hole = {
    readonly kind: "value";
    readonly type: MsType;
    readonly get: () => unknown;
} | {
    readonly kind: "state";
    readonly get: () => ClientState;
} | {
    readonly kind: "shared";
    readonly get: () => ClientShared;
} | {
    readonly kind: "fn";
    readonly get: () => ClientFn;
} | {
    readonly kind: "ref";
    readonly get: () => ClientRef;
} | {
    readonly kind: "action";
    readonly get: () => ClientAction;
} | {
    readonly kind: "lib";
    readonly lib: string;
};
export interface CompiledCode {
    readonly code: readonly string[];
    readonly holes: readonly Hole[];
    readonly structs: readonly string[];
    readonly site: SourceSite;
}
export interface ClientState<T = unknown> {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "state";
    readonly type: MsType;
    readonly initial: CompiledCode;
    readonly site: SourceSite;
    readonly persist?: {
        readonly key?: string;
        readonly keyPrefix?: string;
    };
    value: T;
}
export interface ClientShared<T = unknown> {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "shared";
    readonly key: string;
    readonly type: MsType;
    readonly initial: CompiledCode;
    readonly site: SourceSite;
    readonly value: T;
}
export interface ClientStateOptions {
    persist?: boolean;
    key?: string;
    /** @internal compiler-only namespace for persisted storage names */
    keyPrefix?: string;
}
export interface ClientRef<T = unknown> {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "ref";
    readonly cls: string;
    readonly site: SourceSite;
    readonly control: T;
}
export interface ClientHandler {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "handler";
    readonly body: CompiledCode;
}
export interface ClientBinding<T = unknown> {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "bind";
    readonly type: MsType;
    readonly expr: CompiledCode;
    readonly __value?: T;
}
export interface ClientFn {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "fn";
    readonly name: string;
    readonly declaration: CompiledCode;
}
export interface ClientAction {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "action";
    readonly name: string;
}
export interface ClientLifecycle {
    readonly $$typeof: typeof CLIENT;
    readonly kind: "init" | "frame";
    readonly body: CompiledCode;
}
export interface CompiledRuntime {
    state<T>(type: MsType, initial: CompiledCode, site: SourceSite, options?: ClientStateOptions): ClientState<T>;
    shared<T>(key: string, type: MsType, initial: CompiledCode, site: SourceSite): ClientShared<T>;
    watch(shared: ClientShared, body: CompiledCode): void;
    ref<T>(cls: string, site: SourceSite): ClientRef<T>;
    handler(body: CompiledCode): ClientHandler;
    bind<T>(type: MsType, expr: CompiledCode): ClientBinding<T>;
    fn(name: string, declaration: CompiledCode): ClientFn;
    onInit(body: CompiledCode): void;
    onFrame(body: CompiledCode): void;
}
export declare const DIRTY_FLAG = "Mtx_Dirty";
