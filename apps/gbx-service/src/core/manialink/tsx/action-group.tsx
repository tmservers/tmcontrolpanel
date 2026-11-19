import { Script, ms } from "maniatsx";
import type { ActionButton } from "../components/action-group";
import type { ManialinkPageProps } from "./types";
import { kit, Label, Panel } from "./ui";
import { Widget } from "./widget";

const SIZE = 5;
// U+F105 is the chevron glyph of the in-game icon font
const CHEVRON = "";
const EASING = "CAnimManager::EAnimManagerEasing::ExpInOut";

// Port of action-group.hbs: the expandable button bar; the toggle animation lives in the page script
export function ActionGroupPage(props: ManialinkPageProps) {
  const actions =
    (props.data as { actions?: ActionButton[] } | undefined)?.actions ?? [];
  const count = actions.length;
  // Themes with a gap show the buttons as separate tiles
  const step = SIZE + kit.useTokens().shape.gap;
  const width = count * step + SIZE;
  const closedX = -count * step;
  return (
    <Widget
      id={props.id}
      position={[props.position.x, props.position.y]}
      hideWhileDriving={props.hideWhileDriving}
    >
      <Script.Main id="action-group">
        {"declare Boolean actionGroupIsOpen for This = False;"}
      </Script.Main>
      <Script.Events id="action-group">{ms`
        if (Event.Control.HasClass("trigger") && Event.Type == CMlScriptEvent::Type::MouseClick) {
          declare Boolean actionGroupIsOpen for This;

          if (actionGroupIsOpen) {
            AnimMgr.Add(Event.Control.Parent, """<frame pos='${closedX} 0' />""", 200, ${ms.raw(EASING)});
            declare triggerIcon <=> ((Event.Control.Parent.Controls[0] as CMlFrame).Controls[1] as CMlLabel);
            AnimMgr.Add(triggerIcon, """<label rot='0' pos='2.6 -2.15' />""", 200, ${ms.raw(EASING)});
          } else {
            AnimMgr.Add(Event.Control.Parent, """<frame pos='0 0' />""", 200, ${ms.raw(EASING)});
            declare triggerIcon <=> ((Event.Control.Parent.Controls[0] as CMlFrame).Controls[1] as CMlLabel);
            AnimMgr.Add(triggerIcon, """<label rot='180' pos='2.25 -2.9' />""", 200, ${ms.raw(EASING)});
          }

          actionGroupIsOpen = !actionGroupIsOpen;
        }
      `}</Script.Events>

      <frame pos={[0, 0]} size={[width, SIZE]} z-index={10}>
        <frame size={[width, SIZE]} pos={[closedX, 0]}>
          <frame pos={[count * step, 0]} size={[SIZE, SIZE]}>
            <Panel tone="surface" size={[SIZE, SIZE]} />
            <Label
              tone="text"
              pos={[2.6, -2.15]}
              text={CHEVRON}
              halign="center"
              valign="center"
              textsize={2.5}
            />
          </frame>

          {actions.map((action, index) => (
            <frame pos={[index * step, 0]} size={[SIZE, SIZE]}>
              <Panel
                tone="content"
                size={[SIZE, SIZE]}
                action={action.action}
              />
              {action.type === "image" ? (
                <quad
                  image={action.icon}
                  size={[3.5, 3.5]}
                  pos={[0.75, -0.75]}
                />
              ) : (
                <Label
                  tone="contentText"
                  pos={[2.5, -2.1]}
                  text={action.icon}
                  halign="center"
                  valign="center"
                  textsize={2}
                />
              )}
            </frame>
          ))}

          <Panel
            tone="surface"
            class="trigger"
            pos={[count * step, 0]}
            z-index={2}
            size={[SIZE, SIZE]}
            opacity={0}
            scriptevents
          />
        </frame>
      </frame>
    </Widget>
  );
}
