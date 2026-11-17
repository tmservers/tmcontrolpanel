export type Integer = number;
export type Real = number;
export type Text = string;
export type Boolean = boolean;
export type Void = void;
export type Ident = string & {
    readonly __ident: unique symbol;
};
export interface Vec2 {
    readonly X: Real;
    readonly Y: Real;
}
export interface Vec3 extends Vec2 {
    readonly Z: Real;
}
export interface Int2 {
    readonly X: Integer;
    readonly Y: Integer;
}
export interface Int3 extends Int2 {
    readonly Z: Integer;
}
export declare const vec2: (x: Real, y: Real) => Vec2;
export declare const vec3: (x: Real, y: Real, z: Real) => Vec3;
export declare const int2: (x: Integer, y: Integer) => Int2;
export declare const int3: (x: Integer, y: Integer, z: Integer) => Int3;
export declare const NullId: Ident;
