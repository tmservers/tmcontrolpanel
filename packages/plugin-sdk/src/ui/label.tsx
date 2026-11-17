import type { Vec2 } from "maniatsx";
import type { ClientBinding } from "maniatsx/client";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

// Props the game can update live from client code (client.bind)
type Bindable<T> = T | ClientBinding<T>;

export type LabelTone =
  | "text"
  | "textMuted"
  | "contentText"
  | "contentTextMuted";

export interface LabelProps {
  tone: LabelTone;
  // The theme's title or body font when absent
  font?: "title" | "body";
  text?: Bindable<string>;
  pos?: Vec2;
  size?: Vec2;
  textsize?: number;
  halign?: "left" | "center" | "right";
  valign?: "top" | "center" | "center2" | "bottom";
  "z-index"?: number;
  opacity?: Bindable<number>;
  action?: string;
  focusareacolor1?: string;
  focusareacolor2?: string;
  hidden?: Bindable<boolean>;
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
