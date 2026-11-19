/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import { Manialink, Script, type Node } from "maniatsx";

export interface PageProps {
  id: string;
  children?: Node;
}

// Port of manialink.hbs: the bare page shell
export function Page(props: PageProps) {
  return (
    <Manialink id={props.id} name={`TMCP:${props.id}`}>
      {props.children}
    </Manialink>
  );
}

// The script prelude window.hbs and widget.hbs share: includes and a guard for control-less events
export function ScriptPrelude() {
  return (
    <>
      <Script.Include lib="MathLib" as="ML" />
      <Script.Include lib="TextLib" as="TL" />
      <Script.Include lib="TimeLib" as="TimeLib" />
      <Script.Include lib="ColorLib" as="CL" />
      {/* First in tree order, so it guards every Events part after it */}
      <Script.Events id="skip-controlless-events">
        {"if (Event.Control == Null) continue;"}
      </Script.Events>
    </>
  );
}
