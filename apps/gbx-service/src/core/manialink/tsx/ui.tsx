import type { Node, Vec2 } from "maniatsx";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

// U+F00D is the "x" glyph of the in-game icon font
const CLOSE_ICON = "";

// Token behind each tone; the same mapping legacyManialinkTheme uses for the quad.* and label.* colors
export type PanelTone = "surface" | "surfaceAlt" | "content" | "contentAlt";
export type LabelTone =
  | "text"
  | "textMuted"
  | "contentText"
  | "contentTextMuted";

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

export const Panel = slot<PanelProps>("ui/panel", ({ tone, ...rest }) => {
  const { color } = kit.useTokens();
  return <quad {...rest} bgcolor={color[tone]} />;
});

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
  action?: string;
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

export interface WindowFrameProps {
  id: string;
  title: string;
  // Content area; the title bar adds 5 to the height
  size: Vec2;
  children?: Node;
}

// Frame, title bar and the close button, which sends "close-window-<id>"
export const WindowFrame = slot<WindowFrameProps>("ui/window", (props) => {
  const [width, height] = props.size;
  const color = kit.useTokens().color;
  return (
    <frame
      id="window"
      pos={[-width / 2, height / 2]}
      size={[width, height + 5]}
      z-index={20}
    >
      <Panel tone="surface" pos={[0, 0]} size={[width, 5]} />
      <Label
        tone="text"
        font="title"
        pos={[1.5, -2.25]}
        text={props.title}
        size={[width - 9.5, 5]}
        valign="center"
        halign="left"
        textsize={1}
      />
      <Label
        tone="contentText"
        pos={[width - 1.5, -2.25]}
        text={CLOSE_ICON}
        size={[5, 5]}
        valign="center"
        halign="right"
        textsize={1}
        action={`close-window-${props.id}`}
        focusareacolor2={`${color.text}0`}
      />

      <Panel tone="content" pos={[0, -5]} size={[width, height]} />
      <frame pos={[0, -5]} size={[width, height]}>
        {props.children}
      </frame>
    </frame>
  );
});
