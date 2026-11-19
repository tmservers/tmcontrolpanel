import { createContext, useContext } from "./context.js";
import { jsx } from "./jsx-runtime.js";
const slotContext = createContext(null);
const namedSlots = new Set();
function cloneMerge(base, patch) {
    if (Array.isArray(patch))
        return patch.map((value) => cloneValue(value));
    if (Array.isArray(base) || !isRecord(base) || !isRecord(patch)) {
        return cloneValue(patch);
    }
    const result = { ...base };
    for (const [key, value] of Object.entries(patch)) {
        result[key] =
            key in base ? cloneMerge(base[key], value) : cloneValue(value);
    }
    return result;
}
function cloneValue(value) {
    if (Array.isArray(value))
        return value.map(cloneValue);
    if (isRecord(value))
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneValue(child)]));
    return value;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function freeze(value) {
    if (isRecord(value) || Array.isArray(value)) {
        for (const child of Object.values(value))
            freeze(child);
        Object.freeze(value);
    }
    return value;
}
function mergeKeyed(base, patch) {
    return { ...base, ...patch };
}
function mergeLayout(base, patch) {
    const result = { ...base };
    for (const [key, value] of Object.entries(patch ?? {}))
        result[key] = { ...result[key], ...value };
    return result;
}
function mergeComponents(parent, child = []) {
    const result = new Map(parent.map((entry) => [entry.slotId, entry]));
    for (const entry of child)
        result.set(entry.slotId, entry);
    return [...result.values()];
}
export function override(slot, component) {
    return Object.freeze({ slotId: slot.slotId, component });
}
export function slot(name, Default, variants = {}) {
    if (namedSlots.has(name))
        throw new Error(`Duplicate theme slot name "${name}"`);
    namedSlots.add(name);
    const slotId = Symbol(name);
    const Slot = Object.assign((props) => {
        const active = useContext(slotContext);
        // Theme override first, then a variant the slot ships for the theme or an ancestor
        const custom = active?.components.find((entry) => entry.slotId === slotId);
        if (custom)
            return custom.component({ ...props, Default });
        const variant = active?.chain.map((id) => variants[id]).find((value) => value !== undefined);
        return (variant ?? Default)(props);
    }, { slotName: name, slotId, Default, variants });
    return Slot;
}
export function createThemeKit(definition) {
    const themes = new Map();
    const make = (def, parent) => {
        if (themes.has(def.id))
            throw new Error(`Duplicate theme id "${def.id}"`);
        if (def.extends && themes.get(def.extends.id) !== def.extends) {
            throw new Error(`Theme "${def.id}" extends a theme from another kit`);
        }
        const actualParent = def.extends ?? parent;
        const theme = freeze({
            id: def.id,
            name: def.name,
            chain: Object.freeze([def.id, ...(actualParent?.chain ?? [])]),
            tokens: cloneMerge(actualParent?.tokens ?? def.tokens, def.tokens ?? {}),
            text: mergeKeyed(actualParent?.text ?? {}, def.text),
            layout: mergeLayout(actualParent?.layout ?? {}, def.layout),
            components: mergeComponents(actualParent?.components ?? [], def.components),
        });
        themes.set(def.id, theme);
        return theme;
    };
    const base = make(definition);
    const themeContext = createContext(base);
    const wrappedProvider = ({ theme, children }) => {
        const isData = !("components" in theme);
        if (isData &&
            (typeof theme.id !== "string" || !Array.isArray(theme.chain) || theme.chain[0] !== theme.id))
            throw new Error("Invalid ThemeData: expected a string id and a chain starting with that id.");
        const components = isData ? [] : theme.components;
        return jsx(themeContext.Provider, {
            value: theme,
            children: jsx(slotContext.Provider, {
                value: { chain: theme.chain, components, layout: theme.layout },
                children,
            }),
        });
    };
    return {
        base,
        toData: (theme) => structuredClone({
            id: theme.id,
            name: theme.name,
            chain: theme.chain,
            tokens: theme.tokens,
            text: theme.text,
            layout: theme.layout,
        }),
        defineTheme: (def) => make(def, def.extends ?? base),
        themes: () => Object.freeze([...themes.values()]),
        useTokens: () => useContext(themeContext).tokens,
        useText: (key, fallback = key) => useContext(themeContext).text[key] ?? fallback,
        useTheme: () => useContext(themeContext),
        ThemeProvider: wrappedProvider,
    };
}
export function anchorPos(layout) {
    const [w, h] = layout.size;
    const [mx, my] = layout.margin ?? [0, 0];
    const scale = layout.scale ?? 1;
    const left = layout.anchor.endsWith("left");
    const right = layout.anchor.endsWith("right");
    const top = layout.anchor.startsWith("top");
    const bottom = layout.anchor.startsWith("bottom");
    const x = left ? -160 + mx : right ? 160 - w * scale - mx : (-w * scale) / 2 + mx;
    const y = top ? 90 - my : bottom ? -90 + h * scale + my : (h * scale) / 2 + my;
    return [round3(x), round3(y)];
}
function round3(value) {
    return Math.round((value + Number.EPSILON) * 1000) / 1000;
}
export function useLayout(key, defaults) {
    const theme = useContext(slotContext);
    const layout = {
        ...defaults,
        ...(theme?.layout[key] ?? {}),
        margin: theme?.layout[key]?.margin ?? defaults.margin ?? [0, 0],
        scale: theme?.layout[key]?.scale ?? defaults.scale ?? 1,
        hidden: theme?.layout[key]?.hidden ?? defaults.hidden ?? false,
    };
    return { ...layout, pos: anchorPos(layout) };
}
export function Anchored({ name, layout, id, "z-index": zIndex, children }) {
    const { pos, scale, hidden } = useLayout(name, layout);
    return jsx("frame", {
        id,
        pos,
        scale: scale === 1 ? undefined : scale,
        hidden: hidden || undefined,
        "z-index": zIndex,
        children,
    });
}
