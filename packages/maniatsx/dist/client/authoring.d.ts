import { type ClientAction, type ClientBinding, type ClientFn, type ClientHandler, type ClientRef, type ClientShared, type ClientState, type ClientStateOptions } from "./contract.js";
import type { CMlControl, CMlScriptEvent, CSmMlScriptIngame } from "../maniascript/api.generated.js";
export type { Integer, Real, Text, Ident, Vec2, Vec3, Int2, Int3 } from "../maniascript/types.js";
export declare const ml: CSmMlScriptIngame;
export declare const client: {
    state<T>(initial: T, options?: ClientStateOptions): ClientState<T>;
    shared<T>(key: string, initial: T): ClientShared<T>;
    watch<T>(shared: ClientShared<T>, body: () => void): void;
    ref<T extends CMlControl>(): ClientRef<T>;
    handler(body: (event: CMlScriptEvent) => void): ClientHandler;
    bind<T>(expr: () => T): ClientBinding<T>;
    fn<F extends (...args: never[]) => unknown>(fn: F): F & ClientFn;
    onInit(body: () => void): void;
    onFrame(body: () => void): void;
};
export interface Action extends ClientAction {
    trigger(...args: string[]): void;
}
export declare function action(name: string): Action;
