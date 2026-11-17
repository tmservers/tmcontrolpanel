import type { ClientBinding, ClientHandler, ClientRef } from "./client/contract.js";
import type { GeneratedIntrinsicElements as Gen, LabelTextfont } from "./generated/intrinsics.js";
type Patch<Base, Fix> = Omit<Base, keyof Fix> & Fix;
type DropLegacy<T> = {
    [K in keyof T]: Omit<T[K], "posn" | "sizen">;
};
export type TextFont = LabelTextfont | (string & {});
type FontPatch<T> = Patch<T, {
    textfont?: TextFont;
}>;
type Base = DropLegacy<Gen>;
type Events = {
    onClick?: ClientHandler;
    onRightClick?: ClientHandler;
    onMouseOver?: ClientHandler;
    onMouseOut?: ClientHandler;
} & Refable;
type Refable = {
    ref?: ClientRef;
};
type Bound<T, K extends keyof T> = Omit<T, K> & {
    [P in K]: T[P] | ClientBinding<NonNullable<T[P]>>;
};
type Controls<T extends {
    hidden?: unknown;
    pos?: unknown;
}> = Omit<Bound<T, "hidden">, "pos"> & {
    pos?: T["pos"] | ClientBinding<{
        readonly X: number;
        readonly Y: number;
    }>;
} & Events;
type EventBase = {
    [K in keyof Base]: Base[K] extends {
        id?: string;
    } ? Base[K] & Events : Base[K] & Refable;
};
export type ManialinkLayer = "ScoresTable" | (string & {});
export interface IntrinsicElements extends Omit<EventBase, "label" | "quad" | "gauge" | "entry" | "textedit" | "fileentry" | "style" | "manialink"> {
    manialink: Patch<Base["manialink"], {
        layer?: ManialinkLayer;
    }>;
    include: {
        url: string;
        key?: string | number;
        children?: never;
    } & Refable;
    label: Controls<Bound<FontPatch<Patch<Base["label"], {
        linespacing?: number;
        text?: string | number;
        textprefix?: string | number;
    }>>, "text" | "opacity">>;
    quad: Controls<Bound<Base["quad"], "opacity" | "image" | "bgcolor">>;
    gauge: Controls<Bound<Base["gauge"], "ratio">>;
    entry: Controls<Bound<FontPatch<Base["entry"]>, "default">> & {
        onSubmit?: ClientHandler;
    };
    fileentry: FontPatch<Base["fileentry"]> & Refable;
    style: FontPatch<Base["style"]> & Refable;
    textedit: Events & {
        onSubmit?: ClientHandler;
    } & FontPatch<Patch<Base["textedit"], {
        /** Name of the textedit, used to identify it for the server */
        name?: string;
        children?: never;
    }>>;
}
export {};
