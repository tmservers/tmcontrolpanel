import type { Node, Vec2 } from "maniatsx";
import { slot } from "maniatsx/theme";
import { Label } from "./label";
import { Panel } from "./panel";
import { kit } from "./theme";

// U+F00D is the "x" glyph of the in-game icon font
const CLOSE_ICON = "\uf00d";

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
