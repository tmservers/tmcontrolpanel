import { Script, type Node, type Vec2 } from "maniatsx";
import { HideWhileDriving } from "./hide-while-driving";
import { Page, ScriptPrelude } from "./page";

export interface WidgetProps {
  id: string;
  position: Vec2;
  hideWhileDriving?: boolean;
  children?: Node;
}

// Port of widget.hbs: a hidden frame revealed 300 ms after load, and the optional hide-while-driving script
export function Widget(props: WidgetProps) {
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
      <frame id="widget" pos={props.position} z-index={10} hidden>
        {props.children}
      </frame>
      {/* After the children so its loop call runs last, as in widget.hbs */}
      <HideWhileDriving target="widget" active={props.hideWhileDriving} />
    </Page>
  );
}
