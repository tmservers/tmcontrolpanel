import { contextRuntime, providers } from "./context.js";
import { escapeAttribute, escapeText, formatNumber, serializeValue } from "./serialize.js";
import { Fragment, MS_CODE, RAW_XML, VNODE } from "./vnode.js";
// Phase 2 hooks, matched by registry symbols so phase 1 doesn't import the client runtime
const CLIENT_HANDLE = Symbol.for("maniatsx.client");
const MANIALINK_SCOPE = Symbol.for("maniatsx.manialink");
function isClientHandle(value) {
    return (typeof value === "object" &&
        value !== null &&
        value.$$typeof === CLIENT_HANDLE);
}
const NAME = /^[A-Za-z_][\w.:-]*$/;
const STYLE_TEXT = new Set(["style", "stylesheet"]);
// <timeout> holds a non-negative Integer as text (XSD xs:integer, 0..2147483647)
const TIMEOUT_MAX = 2147483647;
let current = null;
export function render(node, options = {}) {
    const st = {
        out: [],
        pretty: options.pretty ?? false,
        depth: 0,
        element: null,
        contexts: (options.contexts ?? []).map(([ctx, value]) => ({ id: ctx.id, value })),
        scopes: [],
        ids: new Set(),
        warn: options.onWarning ?? ((m) => console.warn(m)),
    };
    const prev = current;
    const prevStack = contextRuntime.stack;
    current = st;
    contextRuntime.stack = st.contexts;
    try {
        walk(node, st);
    }
    finally {
        current = prev;
        contextRuntime.stack = prevStack;
    }
    let xml = st.out.join("");
    if (st.pretty && xml.endsWith("\n"))
        xml = xml.slice(0, -1);
    if (options.warnBytes !== undefined && xml.length * 3 > options.warnBytes) {
        const bytes = new TextEncoder().encode(xml).length;
        if (bytes > options.warnBytes) {
            st.warn(`Output is ${bytes} bytes, over the warnBytes limit of ${options.warnBytes}`);
        }
    }
    return xml;
}
// M3 hook: render children to a string at the current depth; a scope also gets its own id set.
export function renderChildren(node, scope) {
    const st = requireState("renderChildren()");
    const saved = {
        out: st.out,
        ids: st.ids,
        depth: st.depth,
        element: st.element,
        contexts: st.contexts.length,
        scopes: st.scopes.length,
    };
    st.out = [];
    if (scope) {
        st.scopes.push(scope);
        st.ids = new Set();
    }
    try {
        walk(node, st);
        return st.out.join("");
    }
    finally {
        st.out = saved.out;
        st.ids = saved.ids;
        st.depth = saved.depth;
        st.element = saved.element;
        st.contexts.length = saved.contexts;
        st.scopes.length = saved.scopes;
    }
}
// Dictionary entries need inline text while retaining the current indentation.
export function renderTextElement(name, text) {
    const st = requireState("renderTextElement()");
    const xml = `<${name}>${escapeText(text)}</${name}>`;
    return st.pretty ? "  ".repeat(st.depth) + xml + "\n" : xml;
}
// M3 hook: the value of the nearest enclosing scope opened with this key.
export function useRenderScope(key) {
    const st = requireState("useRenderScope()");
    for (let i = st.scopes.length - 1; i >= 0; i--) {
        if (st.scopes[i].key === key)
            return st.scopes[i].value;
    }
    return undefined;
}
// Scope values with an onRawScript method are told when a raw <script> is written below them.
function reportRawScript(st) {
    for (let i = st.scopes.length - 1; i >= 0; i--) {
        const value = st.scopes[i].value;
        if (typeof value?.onRawScript === "function") {
            value.onRawScript();
            return;
        }
    }
}
function requireState(fn) {
    if (!current)
        throw new Error(`${fn} can only be called while rendering`);
    return current;
}
function describe(node) {
    if (typeof node === "object" && node !== null && node.$$typeof === VNODE) {
        const type = node.type;
        if (typeof type === "string")
            return `<${type}>`;
        if (typeof type === "function")
            return `component ${type.name || "(anonymous)"}`;
        return "<Fragment>";
    }
    return typeof node;
}
function where(st) {
    return st.element ? `inside <${st.element}>` : "at the top level";
}
function push(st, text) {
    if (text !== "")
        st.out.push(text);
}
function pushText(st, text) {
    if (st.pretty)
        push(st, "  ".repeat(st.depth) + text + "\n");
    else
        push(st, text);
}
function walk(node, st) {
    if (node === null || node === undefined || typeof node === "boolean")
        return;
    if (typeof node === "string" || typeof node === "number") {
        if (typeof node === "number" && st.element === "timeout") {
            if (!Number.isInteger(node) || node < 0 || node > TIMEOUT_MAX) {
                throw new Error(`<timeout> must contain an integer from 0 to ${TIMEOUT_MAX}, got ${node}`);
            }
            pushText(st, String(node));
            return;
        }
        const text = typeof node === "number" ? formatNumber(node) : node;
        if (st.element !== null && STYLE_TEXT.has(st.element)) {
            pushText(st, escapeText(text));
            return;
        }
        const preview = JSON.stringify(text.length > 30 ? text.slice(0, 30) + "..." : text);
        throw new Error(`Text ${preview} is not allowed ${where(st)}; only <script>, <style> and <stylesheet> take text`);
    }
    if (Array.isArray(node)) {
        for (const child of node)
            walk(child, st);
        return;
    }
    const obj = node;
    if (obj.$$typeof === RAW_XML) {
        const xml = obj.xml;
        push(st, st.pretty && xml !== "" && !xml.endsWith("\n") ? xml + "\n" : xml);
        return;
    }
    if (obj.$$typeof === MS_CODE) {
        throw new Error(`ManiaScript code is only allowed inside <script>, found ${where(st)}`);
    }
    if (obj.$$typeof !== VNODE) {
        throw new Error(`Cannot render a value of type ${typeof node} ${where(st)}`);
    }
    const vnode = node;
    const { type, props } = vnode;
    if (type === Fragment) {
        walk(props.children, st);
    }
    else if (typeof type === "function") {
        const ctx = providers.get(type);
        if (ctx) {
            st.contexts.push({ id: ctx.id, value: props.value });
            try {
                walk(props.children, st);
            }
            finally {
                st.contexts.pop();
            }
        }
        else {
            walk(type(props), st);
        }
    }
    else if (typeof type === "string") {
        writeElement(type, props, st);
    }
    else {
        throw new Error(`Invalid element type ${String(type)} ${where(st)}`);
    }
}
function writeAttributes(tag, props, st) {
    let attrs = "";
    for (const name of Object.keys(props)) {
        if (name === "children" || name === "key")
            continue;
        const value = props[name];
        if (Array.isArray(value) && value.length === 0 && name !== "class") {
            st.warn(`<${tag}> attribute "${name}" is an empty array and was omitted`);
            continue;
        }
        const text = serializeValue(tag, name, value);
        if (text === null)
            continue;
        if (!NAME.test(name))
            throw new Error(`<${tag}>: invalid attribute name "${name}"`);
        if (name === "id") {
            if (st.ids.has(text))
                st.warn(`Duplicate id "${text}" on <${tag}>`);
            else
                st.ids.add(text);
        }
        attrs += ` ${name}="${escapeAttribute(text)}"`;
    }
    return attrs;
}
function collectScriptText(node, out) {
    if (node === null || node === undefined || typeof node === "boolean")
        return;
    if (typeof node === "string")
        out.push(node);
    else if (typeof node === "number")
        out.push(formatNumber(node));
    else if (Array.isArray(node))
        for (const child of node)
            collectScriptText(child, out);
    else if (node.$$typeof === MS_CODE) {
        out.push(node.code);
    }
    else {
        throw new Error(`<script> only takes text or ManiaScript code, found ${describe(node)}`);
    }
}
function writeElement(tag, props, st) {
    if (!NAME.test(tag))
        throw new Error(`Invalid element name "${tag}"`);
    if (Object.values(props).some(isClientHandle)) {
        const scope = useRenderScope(MANIALINK_SCOPE);
        if (!scope)
            throw new Error(`<${tag}> client handles can only be used inside <Manialink>`);
        const client = scope.client;
        if (!client)
            throw new Error(`<${tag}> client handles need the runtime: import "maniatsx/client"`);
        props = client.element(tag, props);
    }
    for (const name of ["onClick", "onRightClick", "onMouseOver", "onMouseOut", "onSubmit"]) {
        if (props[name] != null)
            throw new Error(`<${tag}> attribute "${name}" requires a ClientHandler`);
    }
    const indent = st.pretty ? "  ".repeat(st.depth) : "";
    const nl = st.pretty ? "\n" : "";
    const open = `<${tag}${writeAttributes(tag, props, st)}`;
    if (tag === "script") {
        reportRawScript(st);
        const parts = [];
        collectScriptText(props.children, parts);
        const code = parts.join("");
        // The game rejects any "--" inside the comment-wrapped script, not just "-->"
        const dash = code.split("\n").findIndex((line) => line.includes("--"));
        if (dash !== -1) {
            throw new Error(`<script> content must not contain "--" (line ${dash + 1}: ${JSON.stringify(code.split("\n")[dash].trim())})`);
        }
        push(st, code === ""
            ? `${indent}${open} />${nl}`
            : `${indent}${open}><!--\n${code}\n--></script>${nl}`);
        return;
    }
    const slot = st.out.length;
    st.out.push("");
    const prevElement = st.element;
    st.element = tag;
    st.depth++;
    try {
        walk(props.children, st);
    }
    finally {
        st.depth--;
        st.element = prevElement;
    }
    if (st.out.length === slot + 1) {
        st.out[slot] = `${indent}${open} />${nl}`;
    }
    else {
        st.out[slot] = `${indent}${open}>${nl}`;
        st.out.push(`${indent}</${tag}>${nl}`);
    }
}
