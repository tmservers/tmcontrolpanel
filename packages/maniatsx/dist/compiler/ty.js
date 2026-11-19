export const isNum = (t) => t === "Integer" || t === "Real";
export const isVec = (t) => t === "Vec2" || t === "Vec3" || t === "Int2" || t === "Int3";
export const isClass = (t) => typeof t === "object" && "class" in t;
export function hasNum(t) {
    if (t === "Num")
        return true;
    if (typeof t === "object" && "array" in t)
        return hasNum(t.array);
    return false;
}
export function msName(t) {
    if (typeof t === "string")
        return t;
    if ("array" in t)
        return `${msName(t.array)}[]`;
    if ("record" in t)
        return `${msName(t.record.value)}[${msName(t.record.key)}]`;
    if ("struct" in t)
        return t.struct;
    if ("class" in t)
        return t.class;
    if ("enum" in t)
        return t.enum;
    if ("state" in t)
        return `State<${msName(t.state)}>`;
    if ("shared" in t)
        return `Shared<${msName(t.shared)}>`;
    if ("ref" in t)
        return `Ref<${msName(t.ref)}>`;
    return "fn";
}
export function toMs(t) {
    if (typeof t === "string") {
        return t === "Void" || t === "Null" || t === "Num" || t === "Action" ? undefined : t;
    }
    if ("array" in t) {
        const inner = toMs(t.array);
        return inner && { array: inner };
    }
    if ("record" in t) {
        const key = toMs(t.record.key);
        const value = toMs(t.record.value);
        if (key !== "Integer" && key !== "Text" && key !== "Ident")
            return undefined;
        return value && { record: { key, value } };
    }
    if ("struct" in t)
        return { struct: t.struct };
    return undefined;
}
// Loose compatibility used for overload picking; tsc has already checked the real types
export function compat(param, arg) {
    if (arg === "Num")
        return param === "Integer" || param === "Real";
    if (param === "Real" && arg === "Integer")
        return true;
    if (typeof param === "string" || typeof arg === "string") {
        if (typeof param === "object" && arg === "Null")
            return isClass(param);
        return param === arg;
    }
    if ("class" in param)
        return "class" in arg;
    if ("enum" in param)
        return "enum" in arg;
    if ("array" in param)
        return "array" in arg && compat(param.array, arg.array);
    if ("record" in param)
        return "record" in arg;
    if ("struct" in param)
        return "struct" in arg && param.struct === arg.struct;
    return false;
}
