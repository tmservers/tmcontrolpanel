# maniatsx

Write Trackmania Manialinks in typed TSX and render them to Manialink v3 XML. Client TypeScript can also compile to ManiaScript at build time; that feature is experimental.

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

Configure TypeScript with `"jsx": "react-jsx"` and `"jsxImportSource": "maniatsx"`. See [getting started](docs/getting-started.md).

## Documentation

- [Overview](docs/index.md)
- [Getting started](docs/getting-started.md)
- [Components](docs/components.md)
- [Client code](docs/client-code.md)
- [Theming](docs/theming.md)
- [Testing](docs/testing.md)
- [Game behaviour reference](docs/game-behaviour.md)
- [Tooling](docs/tooling.md)

## Development

```sh
bun install
bun run typecheck
bun test
bun run gen
bun run build
bun run bench
./node_modules/.bin/prettier --write <files>
```

See [AGENTS.md](AGENTS.md) for contributor conventions.
