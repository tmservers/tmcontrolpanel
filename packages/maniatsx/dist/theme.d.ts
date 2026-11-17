import type { Component, Node, Vec2 } from "./vnode.js";
export type DeepPartial<T> = T extends readonly unknown[] ? T : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
export type Anchor = "top-left" | "top" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom" | "bottom-right";
export interface Layout {
    anchor: Anchor;
    margin?: Vec2;
    size: Vec2;
    scale?: number;
    hidden?: boolean;
}
export interface Theme<Tokens = unknown> {
    readonly id: string;
    readonly name: string;
    readonly chain: readonly string[];
    readonly tokens: Tokens;
    readonly text: Readonly<Record<string, string>>;
    readonly layout: Readonly<Record<string, Readonly<Partial<Layout>>>>;
    readonly components: readonly OverrideEntry<any>[];
}
export interface ThemeData<Tokens> {
    id: string;
    name: string;
    chain: readonly string[];
    tokens: Tokens;
    text: Record<string, string>;
    layout: Record<string, Partial<Layout>>;
}
export interface ThemeDefinition<Tokens> {
    id: string;
    name: string;
    extends?: Theme<Tokens>;
    tokens?: DeepPartial<Tokens>;
    text?: Readonly<Record<string, string>>;
    layout?: Readonly<Record<string, Partial<Layout>>>;
    components?: readonly OverrideEntry<any>[];
}
export interface SlotComponent<P> extends Component<P> {
    readonly slotName: string;
    readonly slotId: symbol;
    readonly Default: Component<P>;
    readonly variants: Readonly<Record<string, Component<P>>>;
}
export interface OverrideEntry<P> {
    readonly slotId: symbol;
    readonly component: Component<P & {
        Default: Component<P>;
    }>;
}
export declare function override<P>(slot: SlotComponent<P>, component: Component<P & {
    Default: Component<P>;
}>): OverrideEntry<P>;
export declare function slot<P>(name: string, Default: Component<P>, variants?: Readonly<Record<string, Component<P>>>): SlotComponent<P>;
export interface ThemeKit<Tokens> {
    readonly base: Theme<Tokens>;
    defineTheme(definition: ThemeDefinition<Tokens>): Theme<Tokens>;
    toData(theme: Theme<Tokens>): ThemeData<Tokens>;
    themes(): readonly Theme<Tokens>[];
    useTokens(): Tokens;
    useText(key: string, fallback?: string): string;
    useTheme(): Theme<Tokens>;
    ThemeProvider: Component<{
        theme: Theme<Tokens> | ThemeData<Tokens>;
        children?: Node;
    }>;
}
export declare function createThemeKit<Tokens>(definition: ThemeDefinition<Tokens>): ThemeKit<Tokens>;
export declare function anchorPos(layout: Layout): [number, number];
export declare function useLayout(key: string, defaults: Layout): Required<Layout> & {
    pos: [number, number];
};
export interface AnchoredProps {
    name: string;
    layout: Layout;
    id?: string;
    "z-index"?: number;
    children?: Node;
}
export declare function Anchored({ name, layout, id, "z-index": zIndex, children }: AnchoredProps): Node;
