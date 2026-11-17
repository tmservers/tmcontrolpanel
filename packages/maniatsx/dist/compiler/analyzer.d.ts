import ts from "typescript6";
import { type FnSig, type Ty } from "./ty.js";
export interface Sink {
    report(node: ts.Node, code: string, message: string, severity?: "error" | "warning"): void;
}
export type AuthoringKind = "state" | "shared" | "watch" | "ref" | "handler" | "bind" | "fn" | "onInit" | "onFrame";
export declare const LIBS: Set<string>;
export declare const VEC_CTORS: Set<string>;
export declare const inAuthoring: (n: ts.Node) => boolean;
export declare const inApi: (n: ts.Node) => boolean;
export declare const inTypes: (n: ts.Node) => boolean;
export declare const inContract: (n: ts.Node) => boolean;
export declare const inLibrary: (n: ts.Node) => boolean;
export declare function unparen(e: ts.Expression): ts.Expression;
export declare function resolveSymbol(checker: ts.TypeChecker, node: ts.Node): ts.Symbol | undefined;
export declare function authoringCallKind(checker: ts.TypeChecker, call: ts.CallExpression): AuthoringKind | undefined;
export declare function isActionFactoryCall(checker: ts.TypeChecker, call: ts.CallExpression): boolean;
export type RootKind = {
    k: "local";
} | {
    k: "ml" | "client" | "actionFn" | "nullId" | "apiValue" | "unknown";
} | {
    k: "lib" | "vecCtor" | "global";
    name: string;
} | {
    k: "function";
} | {
    k: "state" | "shared" | "ref" | "fn" | "action" | "capture";
    ty: Ty;
};
export declare class Analyzer {
    readonly program: ts.Program;
    readonly checker: ts.TypeChecker;
    readonly sink: Sink;
    private declCache;
    private structDecls;
    private structFieldMap;
    private structDeps;
    private building;
    private usedStructs;
    private libMembers;
    constructor(program: ts.Program, checker: ts.TypeChecker, sink: Sink);
    report(node: ts.Node, code: string, message: string, severity?: "error" | "warning"): void;
    trackStructs<T>(fn: () => T): {
        result: T;
        structs: string[];
    };
    noteStruct(name: string): void;
    trackNote(ty: Ty): void;
    structFields(name: string): {
        name: string;
        ty: Ty;
    }[] | undefined;
    tyFromTypeNode(node: ts.TypeNode | undefined, at: ts.Node): Ty;
    private fromTypeReference;
    private qualified;
    private fail;
    tyFromTsType(type: ts.Type, at: ts.Node): Ty;
    private hasHandleField;
    useStruct(sym: ts.Symbol, at: ts.Node): string;
    private depTarget;
    private withDeps;
    declTy(sym: ts.Symbol, at: ts.Node): Ty;
    private declTyOf;
    private numberGuard;
    private bindingTypeNode;
    refClassTy(call: ts.CallExpression, at: ts.Node): Ty;
    stateArgTy(call: ts.CallExpression, at: ts.Node, argIndex?: number): Ty;
    fnSig(call: ts.CallExpression, decl: ts.VariableDeclaration): FnSig;
    libMember(lib: string, name: string): ts.SignatureDeclaration[];
    private isFnHandle;
    classify(id: ts.Identifier, closure: ts.Node | null): RootKind;
}
export declare function baseNameOf(fileName: string): string;
