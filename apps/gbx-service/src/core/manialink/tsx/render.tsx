import type { ThemeData } from "@tmcontrolpanel/shared";
import { render } from "maniatsx";
import { DEFAULT_THEME_DATA, kit, toKitTheme } from "./theme";
import type { ManialinkComponent, ManialinkPageProps } from "./types";

// Renders a page component under the server's preset; the TSX counterpart of TemplateRenderer.render
export function renderComponent(
  Component: ManialinkComponent,
  props: ManialinkPageProps,
  theme: ThemeData = DEFAULT_THEME_DATA,
): string {
  return render(
    <kit.ThemeProvider theme={toKitTheme(theme)}>
      <Component {...props} />
    </kit.ThemeProvider>,
  );
}
