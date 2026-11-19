import "./install";
// The UI kit for TSX widgets: the shared theme kit and the primitives, each a maniatsx slot
export { Label, type LabelProps, type LabelTone } from "./label";
export { Page, ScriptPrelude, type PageProps } from "./page";
export {
  Panel,
  RoundedRect,
  type PanelCorners,
  type PanelProps,
  type PanelTone,
  type RoundedRectProps,
} from "./panel";
export { UiTable as Table, type TableProps } from "./table";
export { DEFAULT_THEME_DATA, kit, toKitTheme } from "./theme";
export type { ThemeData, ThemeTokens } from "./theme";
export { WidgetFrame, type WidgetFrameProps } from "./widget";
export { WindowFrame, type WindowFrameProps } from "./window";
