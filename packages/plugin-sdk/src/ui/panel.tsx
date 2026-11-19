/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import type { Vec2 } from "maniatsx";
import type { ClientBinding } from "maniatsx/client";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

// Props the game can update live from client code (client.bind)
type Bindable<T> = T | ClientBinding<T>;

// Token behind each tone; the same mapping the legacy quad.* and label.* colors use
export type PanelTone = "surface" | "surfaceAlt" | "content" | "contentAlt";

export interface PanelProps {
  tone: PanelTone;
  size: Vec2;
  pos?: Vec2;
  "z-index"?: number;
  opacity?: Bindable<number>;
  action?: string;
  class?: string;
  hidden?: Bindable<boolean>;
  id?: string;
  scriptevents?: boolean;
}

// A flat quad in a theme color; presets can ship variants of the slot
export const Panel = slot<PanelProps>("ui/panel", ({ tone, ...rest }) => {
  const { color } = kit.useTokens();
  return <quad {...rest} bgcolor={color[tone]} />;
});
