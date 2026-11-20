/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import { QuarterCircle, type Quadrant, type Vec2 } from "maniatsx";
import type { ClientBinding } from "maniatsx/client";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

// Props the game can update live from client code (client.bind)
type Bindable<T> = T | ClientBinding<T>;

// Token behind each tone; the same mapping the legacy quad.* and label.* colors use
export type PanelTone = "surface" | "surfaceAlt" | "content" | "contentAlt";

export type PanelCorners = "all" | "none" | "left" | "right" | "top" | "bottom";

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
  // Corners to round when the theme has a radius; joined panels round only their outer side
  corners?: PanelCorners;
}

const ROUNDED: Record<PanelCorners, [boolean, boolean, boolean, boolean]> = {
  all: [true, true, true, true],
  none: [false, false, false, false],
  left: [true, false, true, false],
  right: [false, true, false, true],
  top: [true, true, false, false],
  bottom: [false, false, true, true],
};

const TONE_OPACITY = {
  surface: "surface",
  surfaceAlt: "surface",
  content: "content",
  contentAlt: "content",
} as const;

export interface RoundedRectProps {
  size: Vec2;
  color: string;
  opacity: number;
  radius: number;
  // Top-left, top-right, bottom-left, bottom-right
  corners: readonly [boolean, boolean, boolean, boolean];
  pos?: Vec2;
}

// A filled rectangle with the chosen corners rounded. Plain quads tile without seams, so
// only the corner squares use clipped quarter circles, and unrounded sides get no strip.
export function RoundedRect(props: RoundedRectProps) {
  const [w, h] = props.size;
  const r = props.radius;
  const [tl, tr, bl, br] = props.corners;
  const fill = { bgcolor: props.color, opacity: props.opacity };
  const left = tl || bl;
  const right = tr || br;
  const corner = (quadrant: Quadrant, pos: Vec2) => (
    <QuarterCircle
      radius={r}
      quadrant={quadrant}
      color={props.color}
      opacity={props.opacity}
      pos={pos}
    />
  );
  const x0 = left ? r : 0;
  const x1 = right ? w - r : w;
  return (
    <frame pos={props.pos ?? [0, 0]} size={props.size}>
      <quad {...fill} pos={[x0, 0]} size={[x1 - x0, h]} />
      {left && (
        <quad
          {...fill}
          pos={[0, tl ? -r : 0]}
          size={[r, h - (tl ? r : 0) - (bl ? r : 0)]}
        />
      )}
      {right && (
        <quad
          {...fill}
          pos={[w - r, tr ? -r : 0]}
          size={[r, h - (tr ? r : 0) - (br ? r : 0)]}
        />
      )}
      {tl && corner("TopLeft", [0, 0])}
      {tr && corner("TopRight", [w - r, 0])}
      {bl && corner("BottomLeft", [0, -(h - r)])}
      {br && corner("BottomRight", [w - r, -(h - r)])}
    </frame>
  );
}

// A quad in a theme color, drawn with rounded corners when the theme sets a radius
export const Panel = slot<PanelProps>(
  "ui/panel",
  ({ tone, corners = "all", ...rest }) => {
    const { color, opacity, shape } = kit.useTokens();
    const fill = color[tone];
    const alpha = rest.opacity ?? opacity[TONE_OPACITY[tone]];
    const flags = ROUNDED[corners];
    const [w, h] = rest.size;
    const r = shape.radius;
    // Scripts may look the quad up or move its parent, so those keep a single plain quad
    const plain =
      !(r > 0) ||
      !flags.some(Boolean) ||
      typeof alpha !== "number" ||
      (rest.hidden !== undefined && typeof rest.hidden !== "boolean") ||
      rest.id !== undefined ||
      rest.class !== undefined ||
      rest.scriptevents === true ||
      w < r * 2 ||
      h < r * 2;
    if (plain) {
      return (
        <quad
          {...rest}
          bgcolor={fill}
          opacity={
            alpha === 1 && rest.opacity === undefined ? undefined : alpha
          }
        />
      );
    }
    return (
      <frame
        pos={rest.pos}
        size={rest.size}
        z-index={rest["z-index"]}
        hidden={rest.hidden as boolean | undefined}
      >
        <RoundedRect
          size={rest.size}
          color={fill}
          opacity={alpha}
          radius={r}
          corners={flags}
        />
        {rest.action !== undefined && (
          <quad size={rest.size} opacity={0} action={rest.action} z-index={1} />
        )}
      </frame>
    );
  },
);
