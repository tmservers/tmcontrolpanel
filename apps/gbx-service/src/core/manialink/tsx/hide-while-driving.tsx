import { Script, ms } from "maniatsx";

export interface HideWhileDrivingProps {
  // Id of the frame to slide out of view while the player drives
  target: string;
  // The functions and globals are always present; only the per-frame call is optional
  active?: boolean;
}

// Port of scripts/hide.hbs, as hand-written ManiaScript composed through Script.*
export function HideWhileDriving(props: HideWhileDrivingProps) {
  return (
    <>
      <Script.Globals id="hide-while-driving">{ms`
        declare Vec2 widgetBasePosition;
        declare CMlFrame HS_Target;
        declare Boolean HS_Hidden;
      `}</Script.Globals>
      <Script.Functions id="hide-while-driving">{ms`
        Void hs_hide(Integer duration) {
          HS_Hidden = True;
          declare Real x;
          if (widgetBasePosition[0] < 0.0) {
            x = (HS_Target.Size[0] * -HS_Target.RelativeScale) - 322.0;
          } else {
            x = 322.0;
          }
          AnimMgr.Add(HS_Target, "<frame pos='" ^ x ^ " " ^ widgetBasePosition[1] ^ "' />", duration, CAnimManager::EAnimManagerEasing::ExpInOut);
        }

        Void hs_show(Integer duration) {
          HS_Hidden = False;
          AnimMgr.Add(HS_Target, "<frame pos='" ^ widgetBasePosition[0] ^ " " ^ widgetBasePosition[1] ^ "' />", duration, CAnimManager::EAnimManagerEasing::CircOut);
        }

        Void hidescript() {
          if (HS_Target == Null) {
            HS_Target <=> (Page.MainFrame.GetFirstChild(${props.target}) as CMlFrame);
          }

          declare hideSpeed = 10;

          if (InputPlayer == Null) {
            if (HS_Hidden) {
              hs_show(600);
            }
            return;
          }

          declare Boolean overHidespeed = ML::Abs(InputPlayer.Speed * 3.6) > hideSpeed;

          if (overHidespeed && !HS_Hidden) {
            hs_hide(1000);

            while (InputPlayer.Speed * 3.6 > hideSpeed) {
              yield;
              hidescript();
            }
          }

          if (!overHidespeed && HS_Hidden) {
            sleep(1000);
            hs_show(600);
          }
        }
      `}</Script.Functions>
      {props.active !== false && (
        <Script.Loop id="hide-while-driving">{"hidescript();"}</Script.Loop>
      )}
    </>
  );
}
