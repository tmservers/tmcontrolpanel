import { Script, ms } from "maniatsx";
import { Page } from "../../src/core/manialink/tsx/page";
import type { ManialinkPageProps } from "../../src/core/manialink/tsx/types";
import { Widget } from "../../src/core/manialink/tsx/widget";
import { Window } from "../../src/core/manialink/tsx/window";

// TSX counterparts of the probe templates in manialink-equivalence.test.ts

export function ProbePage(p: ManialinkPageProps) {
  return (
    <Page id={p.id}>
      <frame id="body" pos={[1, 2]} size={[3, 4]} />
    </Page>
  );
}

export function ProbeWindow(p: ManialinkPageProps) {
  return (
    <Window id={p.id} title={p.title} size={[p.size.x, p.size.y]}>
      <label id="body" pos={[2, -2]} text="Hello" textsize={1} />
      <Script.Events>{ms`if (Event.Control.ControlId == "body") { Hit = True; }`}</Script.Events>
    </Window>
  );
}

export function ProbeWidget(p: ManialinkPageProps) {
  return (
    <Widget
      id={p.id}
      position={[p.position.x, p.position.y]}
      hideWhileDriving={p.hideWhileDriving}
    >
      <quad size={[10, 10]} />
    </Widget>
  );
}
