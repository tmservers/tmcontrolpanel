export declare const VNODE: unique symbol;
export declare const Fragment: unique symbol;
export declare const MS_CODE: unique symbol;
export declare const RAW_XML: unique symbol;
export type Key = string | number;
export type Component<P = any> = (props: P) => Node;
export interface VNode {
    readonly $$typeof: typeof VNODE;
    readonly type: string | Component | typeof Fragment;
    readonly props: Readonly<Record<string, unknown>>;
    readonly key: Key | null;
}
export interface RawXml {
    readonly $$typeof: typeof RAW_XML;
    readonly xml: string;
}
export interface MsCode {
    readonly $$typeof: typeof MS_CODE;
    readonly code: string;
}
export type Node = VNode | RawXml | string | number | boolean | null | undefined | readonly Node[];
export type Vec2 = readonly [number, number];
export type Color = string;
