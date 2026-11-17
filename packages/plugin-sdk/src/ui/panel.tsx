import type { Vec2 } from "maniatsx";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

// Token behind each tone; the same mapping the legacy quad.* and label.* colors use
export type PanelTone = "surface" | "surfaceAlt" | "content" | "contentAlt";

export interface PanelProps {
  tone: PanelTone;
  size: Vec2;
  pos?: Vec2;
  "z-index"?: number;
  opacity?: number;
  action?: string;
  class?: string;
  hidden?: boolean;
  id?: string;
  scriptevents?: boolean;
}

// A flat quad in a theme color; presets can ship variants of the slot
export const Panel = slot<PanelProps>("ui/panel", ({ tone, ...rest }) => {
  const { color } = kit.useTokens();
  return <quad {...rest} bgcolor={color[tone]} />;
});
