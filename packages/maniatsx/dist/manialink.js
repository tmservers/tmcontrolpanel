import { dedent, ms } from "./ms.js";
import { raw } from "./raw.js";
import { renderChildren, useRenderScope } from "./render.js";
import { jsx } from "./jsx-runtime.js";
import { MS_CODE } from "./vnode.js";
const PROLOG = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>';
const SCOPE_KEY = Symbol.for("maniatsx.manialink");
const LIB = /^[\w./-]+$/;
const ALIAS = /^[A-Za-z_]\w*$/;
const DIRTY_MARK = "\0dirty\0";
let clientFactory;
export function installClientExtension(factory) {
    clientFactory = factory;
}
function createScope() {
    const scope = {
        client: undefined,
        includes: new Map(),
        libs: new Set(),
        dirtyWrites: false,
        slots: {
            structs: [],
            globals: [],
            functions: [],
            refInit: [],
            stateInit: [],
            main: [],
            events: [],
            sync: [],
            loop: [],
        },
        rawScript: false,
        onRawScript() {
            this.rawScript = true;
        },
    };
    const host = {
        part(slot, code, id) {
            const parts = scope.slots[slot];
            if (id !== undefined && parts.some((part) => part.id === id))
                return;
            parts.push({ id, code });
        },
        lib(lib) {
            if (!LIB.test(lib))
                throw new Error(`invalid ManiaScript lib ${JSON.stringify(lib)}`);
            scope.libs.add(lib);
            return `\0lib:${lib}\0`;
        },
        dirty: () => DIRTY_MARK,
        dirtyWrites(on) {
            scope.dirtyWrites = on;
        },
    };
    scope.client = clientFactory?.(host);
    return scope;
}
function requireScope(name) {
    const scope = useRenderScope(SCOPE_KEY);
    if (!scope)
        throw new Error(`<${name}> can only be used inside <Manialink>`);
    return scope;
}
function flatten(src, name, out) {
    if (src === null || src === undefined || src === false)
        return;
    if (typeof src === "string")
        out.push(dedent(src));
    else if (Array.isArray(src))
        for (const item of src)
            flatten(item, name, out);
    else if (src.$$typeof === MS_CODE)
        out.push(src.code);
    else
        throw new Error(`<${name}> children must be strings or ms code, got ${typeof src}`);
}
function trimBlankEdges(text) {
    return text.replace(/^([ \t]*\n)+/, "").replace(/(\n[ \t]*)+$/, "");
}
function makePart(slot, name) {
    return function ScriptPart(props) {
        const scope = requireScope(name);
        if (props.id !== undefined && typeof props.id !== "string") {
            throw new Error(`<${name}> id must be a string`);
        }
        const pieces = [];
        flatten(props.children, name, pieces);
        const code = trimBlankEdges(pieces.join("\n"));
        if (code.trim() === "")
            return null;
        const parts = scope.slots[slot];
        if (props.id !== undefined && parts.some((p) => p.id === props.id))
            return null;
        parts.push({ id: props.id, code });
        return null;
    };
}
function Include(props) {
    addInclude(requireScope("Script.Include"), props.lib, props.as);
    return null;
}
function addInclude(scope, lib, alias) {
    if (typeof lib !== "string" || !LIB.test(lib)) {
        throw new Error(`<Script.Include> invalid lib ${JSON.stringify(lib)}`);
    }
    if (typeof alias !== "string" || !ALIAS.test(alias)) {
        throw new Error(`<Script.Include lib="${lib}"> invalid alias ${JSON.stringify(alias)}`);
    }
    const existing = scope.includes.get(lib);
    if (existing !== undefined) {
        if (existing !== alias) {
            throw new Error(`<Script.Include> lib "${lib}" is already included as "${existing}", not "${alias}"`);
        }
        return;
    }
    for (const [otherLib, otherAlias] of scope.includes) {
        if (otherAlias === alias) {
            throw new Error(`<Script.Include> alias "${alias}" is already used for lib "${otherLib}", not "${lib}"`);
        }
    }
    scope.includes.set(lib, alias);
}
/** Script parts register into the nearest `<Manialink>`; they render no XML. */
export const Script = {
    Include,
    Globals: makePart("globals", "Script.Globals"),
    Functions: makePart("functions", "Script.Functions"),
    Main: makePart("main", "Script.Main"),
    Events: makePart("events", "Script.Events"),
    Loop: makePart("loop", "Script.Loop"),
};
function indentBlock(parts, spaces) {
    const pad = " ".repeat(spaces);
    return parts.flatMap((p) => p.code.split("\n").map((line) => (line.trim() === "" ? "" : pad + line)));
}
function assemble(scope, manialinkId) {
    for (const lib of scope.libs)
        if (!scope.includes.has(lib))
            addInclude(scope, lib, lib);
    const { structs, globals, functions, refInit, stateInit, main, events, sync, loop } = scope.slots;
    const count = scope.includes.size +
        structs.length +
        globals.length +
        functions.length +
        refInit.length +
        stateInit.length +
        main.length +
        events.length +
        sync.length +
        loop.length;
    if (count === 0)
        return null;
    if (scope.rawScript) {
        throw new Error(`<Manialink id="${manialinkId}"> mixes Script.* parts with a raw <script>; a page has one script`);
    }
    const lines = [];
    for (const [lib, alias] of scope.includes)
        lines.push(`#Include "${lib}" as ${alias}`);
    lines.push(...indentBlock(structs, 0), ...indentBlock(globals, 0), ...indentBlock(functions, 0));
    // The game's parser rejects `main()` directly after global declarations ("unexpected main"); a function in between fixes it
    if (functions.length === 0 && (globals.length > 0 || structs.length > 0))
        lines.push("Void Mtx_Noop() {}");
    lines.push("main() {", ...indentBlock(refInit, 2), ...indentBlock(stateInit, 2), ...indentBlock(main, 2), "  while (True) {", "    yield;");
    if (events.length > 0) {
        lines.push("    foreach (Event in PendingEvents) {", ...indentBlock(events, 6), "    }");
    }
    lines.push(...indentBlock(sync, 4), ...indentBlock(loop, 4), "  }", "}");
    // Without bindings nothing reads the flag, so its writes (one statement per line) go away
    const kept = scope.dirtyWrites ? lines : lines.filter((line) => line.trim() !== DIRTY_MARK);
    return kept
        .join("\n")
        .replaceAll(DIRTY_MARK, scope.dirtyWrites ? "Mtx_Dirty = True;" : "")
        .replace(/\0lib:(\w+)\0/g, (_, lib) => scope.includes.get(lib));
}
function ManialinkBody(props) {
    const scope = createScope();
    const xml = renderChildren(props.children, { key: SCOPE_KEY, value: scope });
    scope.client?.finish();
    const script = assemble(scope, props.manialinkId);
    return [raw(xml), script === null ? null : jsx("script", { children: ms.raw(script) })];
}
export function Manialink(props) {
    if (useRenderScope(SCOPE_KEY))
        throw new Error("<Manialink> cannot be nested inside another <Manialink>");
    if (typeof props.id !== "string" || props.id === "")
        throw new Error("<Manialink> requires an id");
    // jsx() directly so props pass through without re-spreading
    const element = jsx("manialink", {
        id: props.id,
        name: props.name,
        version: 3,
        layer: props.layer,
        children: jsx(ManialinkBody, { manialinkId: props.id, children: props.children }),
    });
    return [props.prolog === false ? null : raw(PROLOG), element];
}
