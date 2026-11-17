# maniatsx

Write Trackmania manialinks in TSX with full type checking, and render them to Manialink v3 XML.

**Status: phase 1 is available; phase 2 client compilation is experimental.** See [PLAN.md](PLAN.md).

## Setup

Not on npm yet. Run `bun run build` and depend on the package from a local path; it loads from `dist/`.

```json
{
  "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "maniatsx" }
}
```

In a project that also uses React, keep React's JSX setup and opt single files in with the pragma. It needs `"jsx": "react-jsx"` (or `react-jsxdev`):

```tsx
/** @jsxImportSource maniatsx */
```

## Quick start

```tsx
import { Manialink, render } from "maniatsx";

const xml = render(
  <Manialink id="hello" name="TMCP:hello">
    <frame pos={[-20, 10]} size={[40, 8]}>
      <quad size={[40, 8]} bgcolor="000000cc" />
      <label pos={[2, -4]} size={[36, 6]} text="Hello" textsize={2} valign="center" />
    </frame>
  </Manialink>,
);
```

`render()` returns a string with the XML prolog first; `<Manialink prolog={false}>` drops it. Nothing renders before `render()` is called.

## Client code (phase 2, experimental)

Client TypeScript compiles into ManiaScript at build time. This is experimental and has not yet been verified in game.

```tsx
import { client, type Integer } from "maniatsx/client";

export function Counter({ start }: { start: Integer }) {
  const count = client.state<Integer>(start);
  return (
    <frame>
      <label text={client.bind(() => "Clicks: " + count.value)} />
      <quad
        size={[20, 8]}
        onClick={client.handler(() => {
          count.value += 1;
        })}
      />
    </frame>
  );
}
```

For Bun runtime imports, register the plugin in a preload file and run `bun --preload ./preload.ts app.tsx`:

```ts
// preload.ts
import { maniatsxPlugin } from "maniatsx/bun-plugin";
Bun.plugin(maniatsxPlugin());
```

For a bundle, pass the plugin to `Bun.build`:

```ts
import { maniatsxPlugin } from "maniatsx/bun-plugin";
await Bun.build({ entrypoints: ["./app.tsx"], outdir: "./dist", plugins: [maniatsxPlugin()] });
```

Alternatively, run `maniatsx-compile --project tsconfig.json --out compiled`. It writes transformed files under the output directory; add `--all` to copy untouched project files too, or `--check` to report diagnostics without writing. The plugin uses the working directory as its compiler root; `rootDir` or `tsconfigPath` can select a different root.

### Persisted state

`client.state<boolean>(false, { persist: true })` keeps the value when the page is sent again with the same manialink id (it compiles to `declare … for Page`); the initial value only applies the first time. The options must be literals. The storage name derives from the source position, so moving the call resets the stored value; pass `key: "open"` to pin it.

### Shared data for update pages

A data-driven widget is a main page plus a small update page that is re-sent with new data. `client.shared<T>(key, initial)` declares the value once, in a module both pages import. The update page writes it with `<Publish>`; the main page reads `.value` in bindings, handlers, `client.fn` and lifecycle code, and `client.watch` runs client code when it changes:

```tsx
export const mapInfo = client.shared<MapInfo>("map_info", { name: "", author: "" });

// main page
<label text={client.bind(() => mapInfo.value.name)} />;
client.watch(mapInfo, () => {
  /* runs on every update */
});

// update page: send only this
<Manialink id="map-info-update">
  <Publish to={mapInfo} value={data} />
</Manialink>;
```

It compiles to `declare … for This` variables plus a version counter that `<Publish>` bumps; the main page compares the version each frame and refreshes its bindings. `.value` is read-only in client code, `key` must be a literal (letters, digits and `_`, not ending in `_V` or `_Seen`), and `T` must be a ManiaScript type (primitives, vectors, arrays, records, interfaces as structs). See `examples/shared-data.tsx`.

### Client refs

`client.state`, `client.handler` and `client.bind` provide client values, event handlers and bindings. Refs let client code target rendered elements, including elements supplied by another component:

```tsx
const nameRef = client.ref<CMlLabel>();
client.onInit(() => {
  nameRef.control.Value = name;
});
return <label ref={nameRef} />;
```

A ref must be placed exactly once in the rendered page. A ref that is never placed or is placed twice causes render to fail.

## Theming

Themes have three layers: tokens, text and layout; primitive slots such as panels and labels; and widget skins that replace a widget view. Most themes only need the first layer.

```tsx
const kit = createThemeKit<Tokens>({ id: "default", name: "Default", tokens: { ... } });
const midnight = kit.defineTheme({ id: "midnight", name: "Midnight", tokens: { color: { surface: "112" } } });

<kit.ThemeProvider theme={midnight}><MapInfo /></kit.ThemeProvider>;
const tokens = kit.useTokens();
const title = kit.useText("map-info.title", "Map");
```

`useTokens()` returns merged tokens. `useText(key, fallback)` reads themed text and uses the fallback (or key) when missing. Layout entries are keyed by widget name and can set anchor, margin, size, scale or visibility.

Slots define shared primitives or widget views. A theme can override a slot; overrides receive `Default` so they can wrap the original. Resolution is theme override, then the slot variant for the theme or an ancestor, then `Default`.

```tsx
const Panel = slot<PanelProps>("ui/panel", DefaultPanel);
const compact = kit.defineTheme({
  id: "compact",
  name: "Compact",
  components: [override(Panel, ({ Default, ...props }) => <Default {...props} variant="thin" />)],
});
```

`Anchored` places a widget using `useLayout` and `anchorPos`:

```tsx
<Anchored name="map-info" layout={{ anchor: "top-right", margin: [2, 2], size: [55, 10] }}>
  <MapInfoView />
</Anchored>
```

The screen is 320×180 with its origin at the center and y increasing upward. Margin is inward from the anchored edges; size is unscaled content size (scale is applied by layout).

Keep widget logic separate from its view. Logic creates state, handlers, bindings and refs, then passes them as typed props to a view slot. A skin only needs to place those refs; a ref never placed or placed twice fails at render.

```tsx
const nameRef = client.ref<CMlLabel>();
client.onInit(() => {
  nameRef.control.Value = name;
});
return <View name={name} nameRef={nameRef} />;
```

Themes apply when the page is rendered. Switching themes means re-sending the pages.

## Attributes

- `undefined` and `null` omit the attribute. Numbers get at most 4 decimals and no exponent; `NaN` and `Infinity` throw.
- Booleans become `"1"` or `"0"`. Tuples: `pos={[10, -5]}` becomes `pos="10 -5"`. Strings pass through.
- `class` takes a string or an array; empty items are dropped: `class={["btn", active ? "btn-on" : ""]}`.
- `data-*` is allowed on every element. Values are XML-escaped, so player text in attributes is safe.
- Text children are only allowed in `<script>`, `<style>` and `<stylesheet>`. Use `text=` on `<label>`.

Use `<include url="./page.xml" />` to include a local or remote manialink file.

## Dictionaries

```tsx
import { Dico } from "maniatsx";

<Dico translations={{ fr: { greeting: "Salut" }, en: { greeting: "Hello" } }} />;
<label textid="greeting" />;
```

Languages and entries follow insertion order; the last language is the game’s fallback. Text IDs must be XML names, and an empty dictionary throws.

## Components and context

Components are plain synchronous functions `(props) => Node`. `useContext` works only during a render, so call it in a component body.

```tsx
import { createContext, useContext } from "maniatsx";

const Theme = createContext({ fg: "ffffff" });

function Title(props: { text: string }) {
  return <label text={props.text} textcolor={useContext(Theme).fg} />;
}

<Theme.Provider value={{ fg: "ffcc00" }}>
  <Title text="Ranking" />
</Theme.Provider>;
```

Seed a value from outside the tree with the `contexts` option: `render(node, { contexts: [[Theme, { fg: "ffcc00" }]] })`.

## Script composition

`Script.*` components render no XML. They register parts with the nearest `<Manialink>`, which assembles them into one `<script>`.

```tsx
import { Script, ms } from "maniatsx";

function ClickCounter(props: { control: string }) {
  return (
    <>
      <Script.Globals id="clicks">{ms`declare Integer G_Clicks;`}</Script.Globals>
      <Script.Main id="clicks">{ms`G_Clicks = 0;`}</Script.Main>
      <Script.Events id={props.control}>{ms`
        if (Event.Type == CMlScriptEvent::Type::MouseClick && Event.ControlId == ${props.control}) {
          G_Clicks += 1;
        }
      `}</Script.Events>
    </>
  );
}
```

- `Script.Include lib="MathLib" as="ML"` emits `#Include`. Reusing a lib with another alias, or an alias for another lib, throws.
- `Script.Globals` and `Script.Functions` go at top level. `Script.Main` runs at the start of `main()`. `Script.Events` runs inside the event loop, where `Event` is the loop variable. `Script.Loop` runs every frame after the events.
- `id` dedupes a part within its slot, first wins. It is not `key`, which JSX consumes. A component rendered 40 times can emit its functions once.

The output is the last child of `<manialink>`, in an XML comment: includes, globals, functions, then `main() { main parts; while (True) { yield; foreach (Event in PendingEvents) { events }; loop parts } }`. Without parts there is no `<script>`. Mixing `Script.*` with a raw `<script>` in one page throws.

## The ms template

`ms` turns JS values into ManiaScript literals, so interpolated text cannot break out of its literal. `ms\`Name = ${"Bo\"b"}\``gives`Name = "Bo\"b"`.

| JS value        | ManiaScript                    |
| --------------- | ------------------------------ |
| `42` / `1.5`    | `42` / `1.5`                   |
| `ms.real(1)`    | `1.`                           |
| `ms.int(7)`     | `7` (throws if not an integer) |
| `true`          | `True`                         |
| `ms.vec2(1, 2)` | `<1., 2.>`                     |
| `[1, 2]`        | `[1, 2]` (non-empty, one type) |

- JS cannot tell `Integer` from `Real`, so use `ms.real` where ManiaScript needs a Real. Integers beyond `Number.MAX_SAFE_INTEGER` throw (ManiaScript Integer is 64-bit, JS loses precision above 2^53).
- `null`, `undefined`, objects, and empty or mixed arrays throw. Nested `ms` code is inserted as is.
- `ms.raw(text)` inserts text verbatim. Trusted only.
- Strings escape `\`, `"`, newlines and tabs. Any `--` is split (`"a-" ^ "-b"`): the game rejects `--` anywhere inside the comment-wrapped script. For the same reason a raw script line containing `--` (e.g. `// ----`) throws at render time.

## Raw XML and player text

`raw(xml)` inserts XML verbatim. Use it only for XML you built, never for player text.

Player names may contain `$` colour codes. `escapeFormatting` neutralises them for display; `stripFormatting` removes them for measuring or comparing:

```tsx
<label text={escapeFormatting(player.name)} />;
stripFormatting("$f00Bob$z"); // "Bob"
```

## Render options

```ts
const warnings: string[] = [];

render(node, {
  pretty: true, // two-space indent, one element per line
  contexts: [[Theme, { fg: "ffcc00" }]],
  onWarning: (message) => warnings.push(message), // default: console.warn
  warnBytes: 60_000, // warn when the output is larger
});
```

Warnings cover duplicate `id`s, omitted empty tuples or arrays, and oversized output. Invalid values, names and placements throw.

## Typings

Element and attribute types are generated from `vendor/manialink_v3.xsd` (reaby/manialink-xsd, MIT, see `vendor/LICENSE-manialink-xsd`) into `src/generated/intrinsics.ts`. Schema mistakes and gaps are fixed in `src/intrinsics-overrides.ts`; for example `linespacing` is a number, and the v1/v2 `posn` and `sizen` are removed. Run `bun run gen` after the XSD changes. Never edit `src/generated/` by hand.

## Development

## Visual tests

Install the bridge plugin with `bun run bridge:install`, then load it in Openplanet from the Developer menu. Be in a map (playground) for examples that use `InputPlayer`. Run `bun run visual --update` once to create baselines, review `test/visual/.out/report.html`, then run `bun run visual` to compare them. The report includes baseline, actual, and diff images.

```sh
bun install
bun run typecheck   # tsc --noEmit over the whole project
bun test            # unit, type, golden and XSD validation tests
bun run gen         # regenerate typings from the XSD
bun run build       # emit dist/
bun run bench       # render benchmark
./node_modules/.bin/prettier --write <files>   # not bunx
```

Conventions are in [AGENTS.md](AGENTS.md).

## Design mockups

`examples/themed/DESIGN.md` is the spec for the themed HUD scene; `examples/themed/mockups.html` is a hand-drawn canvas rendering of it that should match the in-game screenshots (`test/visual/scene-*.png`). Text is blitted from Trackmania's own glyphs in `examples/themed/glyphs.png` and `glyphs.json`, which `bun run design:capture-glyphs` captures from the running game (bridge plugin loaded, a map open); rerun it when the scenes use new text or text styles. Without the atlas the mockups fall back to Montserrat. `bun run design:diff [theme]` renders each theme headless and compares it with the visual baselines, writing diff images to `test/visual/.out/design/`.

## Roadmap

Phase 2 compiles a TypeScript subset to ManiaScript: client state, event handlers and server actions. Phase 1 keeps the VNode tree so phase 2 can build on it. See [PLAN.md](PLAN.md).
