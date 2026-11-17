import type ts from "typescript6";
import type { MsPrimitive, MsType } from "../client/contract.js";
export interface FnSig {
    name: string;
    params: {
        name: string;
        ty: Ty;
    }[];
    ret: Ty;
    node?: ts.SignatureDeclaration;
}
export type Ty = MsPrimitive | "Void" | "Null" | "Num" | "Action" | {
    array: Ty;
} | {
    record: {
        key: Ty;
        value: Ty;
    };
} | {
    struct: string;
} | {
    class: string;
} | {
    enum: string;
} | {
    state: Ty;
} | {
    shared: Ty;
} | {
    ref: Ty;
} | {
    fn: FnSig;
};
export declare const isNum: (t: Ty) => t is "Integer" | "Real";
export declare const isVec: (t: Ty) => t is "Int2" | "Int3" | "Vec2" | "Vec3";
export declare const isClass: (t: Ty) => t is {
    class: string;
};
export declare function hasNum(t: Ty): boolean;
export declare function msName(t: Ty): string;
export declare function toMs(t: Ty): MsType | undefined;
export declare function compat(param: Ty, arg: Ty): boolean;
