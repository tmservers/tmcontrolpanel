import { Manialink, render } from "maniatsx";
import { createThemeKit } from "maniatsx/theme";

interface SmokeTokens {
  color: { text: string };
  size: { md: number };
}

const kit = createThemeKit<SmokeTokens>({
  id: "tsx-smoke",
  name: "TSX smoke",
  tokens: { color: { text: "FFF" }, size: { md: 2 } },
  text: { greeting: "Hello from TSX" },
});

function Greeting() {
  const tokens = kit.useTokens();
  return (
    <label
      pos={[0, 0]}
      textsize={tokens.size.md}
      textcolor={tokens.color.text}
      text={kit.useText("greeting")}
    />
  );
}

// Proves the maniatsx JSX runtime works inside the service
export function renderTsxSmoke(): string {
  return render(
    <kit.ThemeProvider theme={kit.base}>
      <Manialink id="tsx-smoke">
        <Greeting />
      </Manialink>
    </kit.ThemeProvider>,
  );
}
