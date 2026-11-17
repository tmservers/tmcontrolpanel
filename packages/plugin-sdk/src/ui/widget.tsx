import { Script, type Node, type Vec2 } from "maniatsx";
import { Page, ScriptPrelude } from "./page";
import { HideWhileDriving } from "./widget-hide";

export interface WidgetFrameProps {
  id: string;
  // A component's props.position ({ x, y }) or a maniatsx Vec2
  position: Vec2 | { x: number; y: number };
  hideWhileDriving?: boolean;
  children?: Node;
}

// The page around a widget: a frame revealed 300 ms after load, optionally hidden while driving
export function WidgetFrame(props: WidgetFrameProps) {
  const p = props.position;
  const pos: Vec2 = "x" in p ? [p.x, p.y] : p;
  return (
    <Page id={props.id}>
      <ScriptPrelude />
      <Script.Globals id="widget">{"declare CMlFrame widget;"}</Script.Globals>
      <Script.Main id="widget">{`
        widget <=> (Page.MainFrame.GetFirstChild("widget") as CMlFrame);
        widgetBasePosition = widget.AbsolutePosition_V3;

        sleep(300);
        widget.Show();
      `}</Script.Main>
      <frame id="widget" pos={pos} z-index={10} hidden>
        {props.children}
      </frame>
      {/* After the children so its loop call runs last, as in widget.hbs */}
      <HideWhileDriving target="widget" active={props.hideWhileDriving} />
    </Page>
  );
}
