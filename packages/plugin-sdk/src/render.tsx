import type { ThemeData } from "@tmcontrolpanel/shared";
import { render, type Node } from "maniatsx";
import { kit, toKitTheme } from "./ui/theme";

// What every page component receives; the host sends nothing else
export interface ManialinkPageProps {
  id: string;
  position: { x: number; y: number };
  size: { x: number; y: number };
  title: string;
  hideWhileDriving: boolean;
  data: unknown;
}

export type ManialinkComponent = (props: ManialinkPageProps) => Node;

// Renders a page component under the server's preset, with this bundle's own maniatsx
export function renderComponent(
  Component: ManialinkComponent,
  props: ManialinkPageProps,
  theme: ThemeData,
): string {
  return render(
    <kit.ThemeProvider theme={toKitTheme(theme)}>
      <Component {...props} />
    </kit.ThemeProvider>,
  );
}
