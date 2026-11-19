import { MS_CODE } from "./vnode.js";
function code(text) {
    return Object.freeze({ $$typeof: MS_CODE, code: text });
}
function isMsCode(value) {
    return typeof value === "object" && value !== null && value.$$typeof === MS_CODE;
}
// String(n) is the shortest round-trip form but may use an exponent; expand it.
function decimal(n) {
    const s = String(n);
    const m = /^(-?)(\d)(?:\.(\d+))?e([+-]\d+)$/.exec(s);
    if (!m)
        return s;
    const digits = m[2] + (m[3] ?? "");
    const point = 1 + Number(m[4]);
    let body;
    if (point <= 0)
        body = "0." + "0".repeat(-point) + digits;
    else if (point >= digits.length)
        body = digits + "0".repeat(point - digits.length);
    else
        body = digits.slice(0, point) + "." + digits.slice(point);
    return m[1] + body;
}
function finite(n, where) {
    if (typeof n !== "number")
        throw new TypeError(`${where} expects a number, got ${typeof n}`);
    if (!Number.isFinite(n))
        throw new RangeError(`${where} expects a finite number, got ${n}`);
    return n;
}
function realText(n, where) {
    const s = decimal(finite(n, where));
    return s.includes(".") ? s : s + ".";
}
function intText(n, where) {
    if (!Number.isInteger(finite(n, where)))
        throw new RangeError(`${where} expects an integer, got ${n}`);
    // ManiaScript Integer is 64-bit (wiki.trackmania.io); JS is exact only up to 2^53
    if (!Number.isSafeInteger(n))
        throw new RangeError(`${where} is outside the safe Integer range: ${n}`);
    return decimal(n);
}
function stringText(s) {
    const escaped = s
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        // "--" is an error inside the script's XML comment, so split it with a concat
        .replace(/-(?=-)/g, '-" ^ "');
    return `"${escaped}"`;
}
function kindOf(value) {
    if (isMsCode(value))
        return "code";
    if (Array.isArray(value))
        return "array";
    return typeof value;
}
function literal(value, where) {
    if (typeof value === "number") {
        return Number.isInteger(finite(value, where)) ? intText(value, where) : decimal(value);
    }
    if (typeof value === "string")
        return stringText(value);
    if (typeof value === "boolean")
        return value ? "True" : "False";
    if (isMsCode(value))
        return value.code;
    if (Array.isArray(value)) {
        if (value.length === 0)
            throw new TypeError(`${where} is an empty array; ManiaScript needs a typed literal`);
        const first = kindOf(value[0]);
        const items = value.map((item, i) => {
            if (kindOf(item) !== first) {
                throw new TypeError(`${where} mixes ${first} and ${kindOf(item)} items (item ${i})`);
            }
            return literal(item, `${where}[${i}]`);
        });
        return `[${items.join(", ")}]`;
    }
    const what = value === null ? "null" : typeof value;
    throw new TypeError(`${where} cannot be turned into ManiaScript: got ${what}`);
}
// Strips common indentation and blank edge lines; works on the literal parts so interpolated text stays as is.
export function dedentParts(parts) {
    if (!parts.some((p) => p.includes("\n")))
        return [...parts];
    let min = Infinity;
    parts.forEach((part, k) => {
        const lines = part.split("\n");
        lines.forEach((line, j) => {
            if (j === 0 && k > 0)
                return;
            const lastOfOpen = j === lines.length - 1 && k < parts.length - 1;
            if (line.trim() === "" && !lastOfOpen)
                return;
            min = Math.min(min, line.length - line.trimStart().length);
        });
    });
    if (min === Infinity)
        min = 0;
    const out = parts.map((part, k) => part
        .split("\n")
        .map((line, j) => j === 0 && k > 0 ? line : line.slice(Math.min(min, line.length - line.trimStart().length)))
        .join("\n"));
    out[0] = out[0].replace(/^([ \t]*\n)+/, "");
    const last = out.length - 1;
    out[last] = out[last].replace(/(\n[ \t]*)+$/, "");
    return out;
}
export function dedent(text) {
    return dedentParts([text.replace(/\r\n?/g, "\n")])[0];
}
// Raw strings keep ManiaScript escapes like \" and \n as written.
function tag(strings, ...values) {
    const parts = dedentParts(strings.raw);
    let text = parts[0];
    values.forEach((value, i) => {
        text += literal(value, `ms\`\` interpolation ${i}`) + parts[i + 1];
    });
    return code(text);
}
export const ms = Object.assign(tag, {
    real: (n) => code(realText(n, "ms.real()")),
    int: (n) => code(intText(n, "ms.int()")),
    vec2: (x, y) => code(`<${realText(x, "ms.vec2() x")}, ${realText(y, "ms.vec2() y")}>`),
    raw(text) {
        if (typeof text !== "string")
            throw new TypeError("ms.raw() expects a string");
        return code(text);
    },
});
