import type { Node, Vec2 } from "maniatsx";
import { Page, ScriptPrelude } from "./page";
import { WindowFrame } from "./ui";

export interface WindowProps {
  id: string;
  title: string;
  size: Vec2;
  children?: Node;
}

// Port of window.hbs; children place content and Script.* parts
export function Window(props: WindowProps) {
  return (
    <Page id={props.id}>
      <ScriptPrelude />
      <WindowFrame id={props.id} title={props.title} size={props.size}>
        {props.children}
      </WindowFrame>
    </Page>
  );
}
