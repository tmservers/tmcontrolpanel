import type { Vec2 } from "maniatsx";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

export type LabelTone = "text" | "textMuted" | "contentText" | "contentTextMuted";

export interface LabelProps {
  tone: LabelTone;
  // The theme's title or body font when absent
  font?: "title" | "body";
  text?: string;
  pos?: Vec2;
  size?: Vec2;
  textsize?: number;
  halign?: "left" | "center" | "right";
  valign?: "top" | "center" | "center2" | "bottom";
  "z-index"?: number;
  opacity?: number;
  action?: string;
  focusareacolor1?: string;
  focusareacolor2?: string;
  hidden?: boolean;
  id?: string;
}

export const Label = slot<LabelProps>("ui/label", ({ tone, font, ...rest }) => {
  const tokens = kit.useTokens();
  return (
    <label
      {...rest}
      textcolor={tokens.color[tone]}
      textfont={font ? tokens.font[font] : undefined}
    />
  );
});
