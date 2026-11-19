import ts from "typescript6";
import { msName } from "./ty.js";
import { norm } from "./util.js";
const AUTHORING_KINDS = new Set([
    "state",
    "shared",
    "watch",
    "ref",
    "handler",
    "bind",
    "fn",
    "onInit",
    "onFrame",
]);
export const LIBS = new Set(["MathLib", "TextLib", "TimeLib", "ColorLib", "AnimLib", "MapUnits"]);
export const VEC_CTORS = new Set(["vec2", "vec3", "int2", "int3"]);
// A maniatsx library file, from source (`src/<rel>.ts`) or the built typings (`dist/<rel>.d.ts`)
export const isLibraryFile = (fileName, rel) => {
    const f = norm(fileName);
    return f.endsWith(`/src/${rel}.ts`) || f.endsWith(`/dist/${rel}.d.ts`);
};
const fileIs = (node, rel) => isLibraryFile(node.getSourceFile().fileName, rel);
export const inAuthoring = (n) => fileIs(n, "client/authoring");
export const inApi = (n) => fileIs(n, "maniascript/api.generated");
export const inTypes = (n) => fileIs(n, "maniascript/types");
export const inContract = (n) => fileIs(n, "client/contract");
// Files that make up the maniatsx library itself; diagnostics inside them are never ours to report
export const inLibrary = (n) => inAuthoring(n) || inApi(n) || inTypes(n) || inContract(n) || fileIs(n, "maniascript/client-only");
export function unparen(e) {
    while (ts.isParenthesizedExpression(e))
        e = e.expression;
    return e;
}
export function resolveSymbol(checker, node) {
    let sym = checker.getSymbolAtLocation(node);
    if (sym && sym.flags & ts.SymbolFlags.Alias)
        sym = checker.getAliasedSymbol(sym);
    return sym;
}
export function authoringCallKind(checker, call) {
    const callee = unparen(call.expression);
    if (!ts.isPropertyAccessExpression(callee))
        return undefined;
    // Source has `const client = { ... }`; built typings have `declare const client: { ... }`
    const symbol = checker.getSymbolAtLocation(callee.name);
    const decl = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
    if (!decl || !inAuthoring(decl))
        return undefined;
    if (!ts.isObjectLiteralExpression(decl.parent) && !ts.isTypeLiteralNode(decl.parent))
        return undefined;
    const owner = decl.parent.parent;
    if (!ts.isVariableDeclaration(owner) || !ts.isIdentifier(owner.name))
        return undefined;
    if (owner.name.text !== "client" || !AUTHORING_KINDS.has(callee.name.text))
        return undefined;
    return callee.name.text;
}
export function isActionFactoryCall(checker, call) {
    const callee = unparen(call.expression);
    if (!ts.isIdentifier(callee))
        return false;
    const decl = resolveSymbol(checker, callee)?.valueDeclaration;
    return (!!decl && inAuthoring(decl) && ts.isFunctionDeclaration(decl) && decl.name?.text === "action");
}
const GLOBAL_NAMES = new Set(["Math", "console", "Object", "Array", "Date", "JSON", "undefined"]);
export class Analyzer {
    program;
    checker;
    sink;
    declCache = new Map();
    structDecls = new Map();
    structFieldMap = new Map();
    structDeps = new Map();
    building = new Set();
    usedStructs = null;
    libMembers = new Map();
    constructor(program, checker, sink) {
        this.program = program;
        this.checker = checker;
        this.sink = sink;
    }
    report(node, code, message, severity = "error") {
        if (inLibrary(node))
            return;
        this.sink.report(node, code, message, severity);
    }
    // Runs `fn` and returns the struct declarations (dependencies first) it referenced
    trackStructs(fn) {
        const saved = this.usedStructs;
        const used = new Set();
        this.usedStructs = used;
        try {
            const result = fn();
            const structs = [...this.structDecls.keys()]
                .filter((n) => used.has(n))
                .map((n) => this.structDecls.get(n));
            return { result, structs };
        }
        finally {
            this.usedStructs = saved;
        }
    }
    noteStruct(name) {
        const used = this.usedStructs;
        if (!used || used.has(name))
            return;
        used.add(name);
        for (const dep of this.structDeps.get(name) ?? [])
            this.noteStruct(dep);
    }
    trackNote(ty) {
        if (typeof ty !== "object")
            return;
        if ("struct" in ty)
            this.noteStruct(ty.struct);
        else if ("array" in ty)
            this.trackNote(ty.array);
        else if ("record" in ty)
            this.trackNote(ty.record.value);
    }
    structFields(name) {
        return this.structFieldMap.get(name);
    }
    // ---- type nodes ----
    tyFromTypeNode(node, at) {
        if (!node)
            return this.fail(at, "missing-type", "A type annotation is required here.");
        switch (node.kind) {
            case ts.SyntaxKind.NumberKeyword:
                return this.fail(node, "bare-number", "Bare `number` is not allowed in client code: it does not say whether the value is a ManiaScript Integer or Real. Use `Integer` or `Real` from maniatsx/client.");
            case ts.SyntaxKind.StringKeyword:
                return "Text";
            case ts.SyntaxKind.BooleanKeyword:
                return "Boolean";
            case ts.SyntaxKind.VoidKeyword:
                return "Void";
        }
        if (ts.isParenthesizedTypeNode(node))
            return this.tyFromTypeNode(node.type, at);
        if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.ReadonlyKeyword) {
            return this.tyFromTypeNode(node.type, at);
        }
        if (ts.isArrayTypeNode(node))
            return { array: this.tyFromTypeNode(node.elementType, at) };
        if (ts.isUnionTypeNode(node)) {
            const rest = node.types.filter((t) => !(ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword) &&
                t.kind !== ts.SyntaxKind.UndefinedKeyword);
            if (rest.length === 1 && rest.length < node.types.length) {
                const inner = this.tyFromTypeNode(rest[0], at);
                if (typeof inner === "object" && "class" in inner)
                    return inner;
            }
            return this.fail(node, "union-type", "Union types are only allowed as `T | null` on API class references.");
        }
        if (ts.isTypeReferenceNode(node))
            return this.fromTypeReference(node, at);
        if (ts.isTypeLiteralNode(node)) {
            return this.fail(node, "anonymous-type", "Object types in client code need a name. Declare an `interface` and use it here.");
        }
        return this.fail(node, "unsupported-type", `Unsupported type \`${node.getText()}\` in client code.`);
    }
    fromTypeReference(node, at) {
        const nameNode = ts.isQualifiedName(node.typeName) ? node.typeName.right : node.typeName;
        const sym = resolveSymbol(this.checker, nameNode);
        const decl = sym?.declarations?.[0];
        const name = sym?.name ?? nameNode.text;
        const args = node.typeArguments;
        if (decl && inTypes(decl)) {
            if ([
                "Integer",
                "Real",
                "Text",
                "Boolean",
                "Void",
                "Ident",
                "Vec2",
                "Vec3",
                "Int2",
                "Int3",
            ].includes(name)) {
                return (name === "Boolean" ? "Boolean" : name);
            }
        }
        if (decl && (inAuthoring(decl) || inContract(decl))) {
            if (name === "ClientState")
                return { state: this.tyFromTypeNode(args?.[0], at) };
            if (name === "ClientShared")
                return { shared: this.tyFromTypeNode(args?.[0], at) };
            if (name === "ClientRef")
                return { ref: this.tyFromTypeNode(args?.[0], at) };
            if (name === "Action" || name === "ClientAction")
                return "Action";
        }
        if (decl && (name === "Array" || name === "ReadonlyArray") && !inLibrary(decl)) {
            return { array: this.tyFromTypeNode(args?.[0], at) };
        }
        if (decl &&
            name === "Record" &&
            this.program.isSourceFileDefaultLibrary(decl.getSourceFile())) {
            const key = this.tyFromTypeNode(args?.[0], at);
            if (key !== "Text" && key !== "Integer" && key !== "Ident") {
                return this.fail(node, "record-key", "Record keys must be Text, Integer or Ident.");
            }
            return { record: { key, value: this.tyFromTypeNode(args?.[1], at) } };
        }
        if (decl && inApi(decl)) {
            if (ts.isInterfaceDeclaration(decl))
                return { class: name };
            if (ts.isTypeAliasDeclaration(decl))
                return { enum: this.qualified(decl) };
        }
        if (sym && decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl))) {
            if (name === "Array" || name === "ReadonlyArray") {
                return { array: this.tyFromTypeNode(args?.[0], at) };
            }
            if (this.program.isSourceFileDefaultLibrary(decl.getSourceFile())) {
                if (name === "Record")
                    return this.fail(node, "record-key", "Unsupported Record type.");
                return this.fail(node, "unsupported-type", `Unsupported type \`${node.getText()}\` in client code.`);
            }
            return { struct: this.useStruct(sym, node) };
        }
        return this.fail(node, "unsupported-type", `Unsupported type \`${node.getText()}\` in client code.`);
    }
    qualified(decl) {
        const parts = [decl.name.getText()];
        for (let p = decl.parent; p; p = p.parent) {
            if (ts.isModuleDeclaration(p))
                parts.unshift(p.name.getText());
        }
        return parts.join("::");
    }
    fail(node, code, message) {
        this.report(node, code, message);
        return "Void";
    }
    // ---- checker types (fallback when a declaration has no type node) ----
    tyFromTsType(type, at) {
        const alias = type.aliasSymbol;
        const aliasDecl = alias?.declarations?.[0];
        if (alias && aliasDecl && inTypes(aliasDecl) && alias.name === "Ident")
            return "Ident";
        // An action handle, however it was obtained (action() or a host helper returning Action)
        const own = type.getSymbol();
        const ownDecl = own?.declarations?.[0];
        if (own && ownDecl && (inAuthoring(ownDecl) || inContract(ownDecl))) {
            if (own.name === "Action" || own.name === "ClientAction")
                return "Action";
        }
        // Inferred vectors (e.g. a function returning vec3()) keep the interface, not the alias name
        if (own && ownDecl && inTypes(ownDecl) && ["Vec2", "Vec3", "Int2", "Int3"].includes(own.name))
            return own.name;
        const f = type.flags;
        if (f & ts.TypeFlags.BooleanLike)
            return "Boolean";
        if (f & ts.TypeFlags.StringLike) {
            const v = type.isStringLiteral() ? type.value : undefined;
            if (v && /^\w+(::\w+)+$/.test(v))
                return { enum: v.slice(0, v.lastIndexOf("::")) };
            return "Text";
        }
        if (f & ts.TypeFlags.NumberLike)
            return "Num";
        if (f & ts.TypeFlags.Void)
            return "Void";
        if (f & (ts.TypeFlags.Null | ts.TypeFlags.Undefined))
            return "Null";
        if (type.isUnion()) {
            const rest = type.types.filter((t) => !(t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)));
            if (rest.length > 0 && rest.every((t) => t.isStringLiteral() && /::/.test(t.value))) {
                const first = rest[0].value;
                return { enum: first.slice(0, first.lastIndexOf("::")) };
            }
            if (rest.length === 1)
                return this.tyFromTsType(rest[0], at);
            return this.fail(at, "union-type", "Union types are only allowed as `T | null` on API class references.");
        }
        if (type.flags & ts.TypeFlags.Intersection) {
            return this.fail(at, "unsupported-type", `Cannot determine the ManiaScript type of \`${this.checker.typeToString(type)}\`.`);
        }
        if (this.checker.isArrayType(type)) {
            const el = this.checker.getTypeArguments(type)[0];
            return { array: el ? this.tyFromTsType(el, at) : "Void" };
        }
        const sym = type.getSymbol();
        const decl = sym?.declarations?.[0];
        if (sym && decl && inApi(decl) && ts.isInterfaceDeclaration(decl))
            return { class: sym.name };
        if (sym &&
            decl &&
            sym.name !== "__type" &&
            !this.program.isSourceFileDefaultLibrary(decl.getSourceFile()) &&
            (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl))) {
            return { struct: this.useStruct(sym, at) };
        }
        return this.fail(at, "unsupported-type", `Cannot determine the ManiaScript type of \`${this.checker.typeToString(type)}\`.`);
    }
    // ---- structs ----
    // A component props interface carrying client handles is not data; never emit it as a #Struct
    hasHandleField(type) {
        return this.checker.getPropertiesOfType(type).some((prop) => {
            const pd = prop.valueDeclaration;
            if (!pd || !ts.isPropertySignature(pd) || !pd.type || !ts.isTypeReferenceNode(pd.type))
                return false;
            const name = ts.isQualifiedName(pd.type.typeName) ? pd.type.typeName.right : pd.type.typeName;
            const decl = resolveSymbol(this.checker, name)?.declarations?.[0];
            return !!decl && (inContract(decl) || inAuthoring(decl));
        });
    }
    useStruct(sym, at) {
        const name = `K_${sym.name}`;
        if (this.hasHandleField(this.checker.getDeclaredTypeOfSymbol(sym)))
            return name;
        this.depTarget?.push(name);
        if (!this.structDecls.has(name) && !this.building.has(name)) {
            this.building.add(name);
            const deps = [];
            const fields = [];
            const type = this.checker.getDeclaredTypeOfSymbol(sym);
            for (const prop of this.checker.getPropertiesOfType(type)) {
                const pd = prop.valueDeclaration;
                if (!pd || !ts.isPropertySignature(pd)) {
                    this.report(at, "struct-member", `Struct \`${sym.name}\` member \`${prop.name}\` must be a plain property; methods are not allowed.`);
                    continue;
                }
                const ty = this.withDeps(deps, () => this.tyFromTypeNode(pd.type, pd));
                fields.push({ name: prop.name, ty });
            }
            this.building.delete(name);
            this.structFieldMap.set(name, fields);
            this.structDeps.set(name, deps);
            const body = fields.map((f) => `  ${msName(f.ty)} ${f.name};`).join("\n");
            this.structDecls.set(name, `#Struct ${name} {\n${body}\n}`);
        }
        this.noteStruct(name);
        return name;
    }
    depTarget = null;
    withDeps(deps, fn) {
        const saved = this.depTarget;
        this.depTarget = deps;
        try {
            return fn();
        }
        finally {
            this.depTarget = saved;
        }
    }
    // ---- declarations ----
    declTy(sym, at) {
        const cached = this.declCache.get(sym);
        if (cached)
            return cached;
        const decl = sym.valueDeclaration ?? sym.declarations?.[0];
        const ty = decl
            ? this.declTyOf(decl, at)
            : this.fail(at, "unresolved", "Cannot resolve this identifier.");
        this.declCache.set(sym, ty);
        return ty;
    }
    declTyOf(decl, at) {
        if (ts.isVariableDeclaration(decl)) {
            if (decl.type)
                return this.tyFromTypeNode(decl.type, at);
            const init = decl.initializer && unparen(decl.initializer);
            if (init && ts.isCallExpression(init)) {
                const kind = authoringCallKind(this.checker, init);
                if (kind === "state")
                    return { state: this.stateArgTy(init, at) };
                if (kind === "shared")
                    return { shared: this.stateArgTy(init, at, 1) };
                if (kind === "ref")
                    return { ref: this.refClassTy(init, at) };
                if (kind === "fn")
                    return { fn: this.fnSig(init, decl) };
                if (isActionFactoryCall(this.checker, init))
                    return "Action";
            }
            return this.numberGuard(this.tyFromTsType(this.checker.getTypeAtLocation(decl), decl), decl);
        }
        if (ts.isParameter(decl)) {
            if (decl.type)
                return this.tyFromTypeNode(decl.type, at);
            return this.numberGuard(this.tyFromTsType(this.checker.getTypeAtLocation(decl), decl), decl);
        }
        if (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) {
            if (decl.type)
                return this.tyFromTypeNode(decl.type, at);
        }
        if (ts.isBindingElement(decl)) {
            const node = this.bindingTypeNode(decl);
            if (node)
                return this.tyFromTypeNode(node, at);
        }
        return this.numberGuard(this.tyFromTsType(this.checker.getTypeAtLocation(decl), decl), decl);
    }
    // Declared-but-unannotated numbers cannot be told apart; make the user say which
    numberGuard(ty, decl) {
        if (ty !== "Num")
            return ty;
        const name = ts.isVariableDeclaration(decl) || ts.isParameter(decl) ? decl.name.getText() : decl.getText();
        this.report(decl, "bare-number", `\`${name}\` is a number without an Integer or Real annotation, so the compiler cannot pick the ManiaScript type. Annotate it, for example \`${name}: Integer\`.`);
        return "Integer";
    }
    bindingTypeNode(el) {
        const pattern = el.parent;
        if (!ts.isObjectBindingPattern(pattern))
            return undefined;
        const owner = pattern.parent;
        let holder;
        if (ts.isBindingElement(owner))
            holder = this.bindingTypeNode(owner);
        else
            holder = owner.type;
        if (!holder)
            return undefined;
        const key = (el.propertyName ?? el.name);
        const keyName = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : undefined;
        if (!keyName)
            return undefined;
        const prop = this.checker.getPropertyOfType(this.checker.getTypeFromTypeNode(holder), keyName);
        const pd = prop?.valueDeclaration;
        return pd && (ts.isPropertySignature(pd) || ts.isPropertyDeclaration(pd)) ? pd.type : undefined;
    }
    // The control class of a `client.ref<CMlX>()`; the type argument is mandatory
    refClassTy(call, at) {
        const explicit = call.typeArguments?.[0];
        if (!explicit)
            return this.fail(call, "ref-type", `\`${call.getText()}\` needs a type argument naming the control class, for example \`client.ref<CMlLabel>()\`.`);
        const ty = this.tyFromTypeNode(explicit, at);
        if (typeof ty === "object" && "class" in ty)
            return ty;
        if (ty !== "Void")
            this.report(explicit, "ref-type", `\`client.ref<${explicit.getText()}>\` must name a ManiaScript control class such as CMlLabel.`);
        return "Void";
    }
    // `argIndex` is the position of the initial value (1 for client.shared, which takes the key first)
    stateArgTy(call, at, argIndex = 0) {
        const explicit = call.typeArguments?.[0];
        if (explicit)
            return this.tyFromTypeNode(explicit, at);
        const arg = call.arguments[argIndex];
        if (!arg)
            return this.fail(call, "state-type", "client.state needs an initial value.");
        const e = unparen(arg);
        if (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e)) {
            const sym = resolveSymbol(this.checker, ts.isIdentifier(e) ? e : e.name);
            if (sym)
                return this.declTy(sym, e);
        }
        const ty = this.tyFromTsType(this.checker.getTypeAtLocation(e), e);
        if (ty === "Num") {
            this.report(call, "bare-number", 'Cannot tell whether this client.state holds an Integer or a Real. Give it a type argument, for example `client.state<Integer>(0)` or `client.shared<Integer>("key", 0)`.');
            return "Integer";
        }
        return ty;
    }
    // Signature of a `client.fn(...)` bound to a top-level const
    fnSig(call, decl) {
        const fnNode = call.arguments[0] && unparen(call.arguments[0]);
        const name = ts.isIdentifier(decl.name) ? decl.name.text : "anonymous";
        const base = baseNameOf(call.getSourceFile().fileName);
        if (!fnNode || !(ts.isArrowFunction(fnNode) || ts.isFunctionExpression(fnNode))) {
            this.report(call, "fn-shape", "client.fn expects an arrow function or function expression.");
            return { name: `Mtx_F_${base}_${name}`, params: [], ret: "Void" };
        }
        const params = fnNode.parameters.map((p) => ({
            name: ts.isIdentifier(p.name) ? p.name.text : "arg",
            ty: p.type
                ? this.tyFromTypeNode(p.type, p)
                : this.fail(p, "missing-type", `Parameter \`${p.name.getText()}\` of a client.fn needs a type annotation (Integer, Real, Text, ...).`),
        }));
        let ret;
        if (fnNode.type)
            ret = this.tyFromTypeNode(fnNode.type, fnNode);
        else {
            const rt = this.checker.getReturnTypeOfSignature(this.checker.getSignatureFromDeclaration(fnNode));
            ret = this.tyFromTsType(rt, fnNode);
            if (ret === "Num") {
                this.report(fnNode, "bare-number", "Annotate the return type of this client.fn with Integer or Real.");
                ret = "Integer";
            }
        }
        return { name: `Mtx_F_${base}_${name}`, params, ret, node: fnNode };
    }
    libMember(lib, name) {
        const key = `${lib}.${name}`;
        const hit = this.libMembers.get(key);
        if (hit)
            return hit;
        const file = this.program
            .getSourceFiles()
            .find((f) => isLibraryFile(f.fileName, "maniascript/api.generated"));
        let out = [];
        if (file) {
            for (const st of file.statements) {
                if (!ts.isVariableStatement(st))
                    continue;
                for (const d of st.declarationList.declarations) {
                    if (ts.isIdentifier(d.name) && d.name.text === lib) {
                        const prop = this.checker.getTypeAtLocation(d.name).getProperty(name);
                        out = (prop?.declarations ?? []).filter((x) => ts.isMethodSignature(x));
                    }
                }
            }
        }
        this.libMembers.set(key, out);
        return out;
    }
    // ---- identifiers ----
    isFnHandle(decl) {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer)
            return false;
        const init = unparen(decl.initializer);
        return ts.isCallExpression(init) && authoringCallKind(this.checker, init) === "fn";
    }
    classify(id, closure) {
        const sym = resolveSymbol(this.checker, id);
        const decl = sym?.valueDeclaration ?? sym?.declarations?.[0];
        if (!sym || !decl)
            return GLOBAL_NAMES.has(id.text) ? { k: "global", name: id.text } : { k: "unknown" };
        const name = sym.name;
        if (inAuthoring(decl)) {
            if (name === "ml")
                return { k: "ml" };
            if (name === "client")
                return { k: "client" };
            if (name === "action")
                return { k: "actionFn" };
        }
        if (inApi(decl) || inTypes(decl)) {
            if (LIBS.has(name))
                return { k: "lib", name };
            if (VEC_CTORS.has(name))
                return { k: "vecCtor", name };
            if (name === "NullId")
                return { k: "nullId" };
            return { k: "apiValue" };
        }
        if (decl.getSourceFile().isDeclarationFile && GLOBAL_NAMES.has(name))
            return { k: "global", name };
        if (closure &&
            decl.getSourceFile() === closure.getSourceFile() &&
            decl.pos >= closure.pos &&
            decl.end <= closure.end) {
            return { k: "local" };
        }
        if (this.checker.getTypeAtLocation(id).getCallSignatures().length > 0 &&
            !this.isFnHandle(decl)) {
            return { k: "function" };
        }
        const ty = this.declTy(sym, id);
        if (typeof ty === "object" && "state" in ty)
            return { k: "state", ty };
        if (typeof ty === "object" && "shared" in ty)
            return { k: "shared", ty };
        if (typeof ty === "object" && "ref" in ty)
            return { k: "ref", ty };
        if (typeof ty === "object" && "fn" in ty)
            return { k: "fn", ty };
        if (ty === "Action")
            return { k: "action", ty };
        return { k: "capture", ty };
    }
}
export function baseNameOf(fileName) {
    const base = norm(fileName)
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "");
    return base.replace(/[^A-Za-z0-9]/g, "_");
}
