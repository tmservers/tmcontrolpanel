export interface DicoProps {
    translations: Record<string, Record<string, string>>;
}
export declare function Dico({ translations }: DicoProps): import("./vnode.js").VNode;
