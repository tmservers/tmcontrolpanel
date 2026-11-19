import { Manialink, Script, ms, type Vec2 } from "maniatsx";
import { kit } from "./theme";
import type { ManialinkPageProps } from "./types";
import { Label, Panel } from "./ui";
import { Window } from "./window";

// What the Codriver window and its update page are rendered from
export interface CodriverWindowData {
  width: number;
  inputY: number;
  inputHeight: number;
  draftY: number;
  // Sizes of the control pools the script places
  speakers: number;
  lines: number;
  bubbles: number;
  // ManiaScript that fills the update page's shared variables
  script: string;
}

// Icons are glyphs of the in-game icon font
const ICON_CONFIRM = " Confirm";
const ICON_CANCEL = " Cancel";
const ICON_DISCARD = " Discard";
const ICON_SEND = " Send";
const ICON_CLEAR = " Clear";
const EXPERIMENTAL_HINT =
  "Experimental: Codriver can make mistakes. Try “status” or “skip this map”.\nDisruptive changes ask for confirmation.";

interface ButtonProps {
  id?: string;
  hidden?: boolean;
  pos: Vec2;
  size: Vec2;
  action: string;
  text: string;
  textsize?: number;
  // The label's y position
  labelY: number;
  labelId?: string;
}

// A muted button with a thin underline in the surface color
function Button(props: ButtonProps) {
  const [w, h] = props.size;
  return (
    <frame
      id={props.id}
      pos={props.pos}
      size={props.size}
      hidden={props.hidden}
    >
      <Panel tone="contentAlt" size={props.size} action={props.action} />
      <Panel tone="surface" pos={[0, -(h - 0.25)]} size={[w, 0.25]} />
      <Label
        id={props.labelId}
        tone="contentText"
        font="body"
        pos={[w / 2, props.labelY]}
        text={props.text}
        textsize={props.textsize ?? 1}
        valign="center"
        halign="center"
      />
    </frame>
  );
}

function Entry(props: { size: Vec2 }) {
  const { color, font } = kit.useTokens();
  return (
    <textedit
      pos={[0, 0]}
      size={props.size}
      name="codriver-entry"
      id="codriver-entry"
      default=""
      autonewline
      showlinenumbers={false}
      textformat="Basic"
      textsize={1}
      focusareacolor1={color.textMuted}
      focusareacolor2={color.textMuted}
      textcolor={color.contentText}
      textfont={font.body}
    />
  );
}

function Pools(props: { data: CodriverWindowData }) {
  const { width, bubbles, speakers, lines } = props.data;
  const range = (count: number) => Array.from({ length: count }, (_, i) => i);
  return (
    <frame id="codriver-log" size={[width, 1]}>
      {/* Under the messages, so the mouse wheel scrolls the log anywhere over it */}
      <Panel
        tone="content"
        size={[width, 1000]}
        opacity={0}
        scriptevents
        z-index={-1}
      />
      {range(bubbles).map((i) => (
        <Panel
          id={`codriver-bubble-${i}`}
          tone="contentAlt"
          size={[1, 1]}
          hidden
        />
      ))}
      {range(speakers).map((i) => (
        <Label
          id={`codriver-speaker-${i}`}
          tone="contentTextMuted"
          font="title"
          size={[1, 3]}
          textsize={0.6}
          valign="center"
          z-index={1}
          hidden
        />
      ))}
      {range(lines).map((i) => (
        <Label
          id={`codriver-line-${i}`}
          tone="contentText"
          font="body"
          size={[1, 3.3]}
          textsize={1}
          valign="center"
          z-index={1}
          hidden
        />
      ))}
    </frame>
  );
}

function CodriverScript(props: { data: CodriverWindowData }) {
  const { width, bubbles, speakers, lines } = props.data;
  return (
    <>
      <Script.Globals id="codriver">{`
        declare Integer CodriverShown;
        declare Integer CodriverEntryCleared;
        declare Integer CodriverScrolled;
        // Frames left to hold the log at the bottom; a new ScrollMax only takes effect a frame later
        declare Integer CodriverStickFrames;
      `}</Script.Globals>
      <Script.Functions id="codriver">{ms`
        // Places the pooled controls and bars from what the update page last set
        Void CodriverApply() {
          declare Text[] CodriverSpeakerTexts for This;
          declare Vec2[] CodriverSpeakerPos for This;
          declare Real[] CodriverSpeakerWidths for This;
          declare Vec2[] CodriverBubblePos for This;
          declare Vec2[] CodriverBubbleSizes for This;
          declare Text[] CodriverLineTexts for This;
          declare Vec2[] CodriverLinePos for This;
          declare Real[] CodriverLineWidths for This;
          declare Boolean CodriverEmpty for This;
          declare Boolean CodriverBusy for This;
          declare Text CodriverProgress for This;
          declare Real CodriverProgressY for This;
          declare Boolean CodriverConfirm for This;
          declare Real CodriverConfirmY for This;
          declare Text CodriverDraft for This;
          declare Integer CodriverClearEntry for This;
          declare Real CodriverLogHeight for This;
          declare Real CodriverContentHeight for This;
          declare Integer CodriverScrollEnd for This;

          // The log shows what fits between the top and the bars; the rest scrolls
          declare Log <=> (Page.GetFirstChild("codriver-log") as CMlFrame);
          // Someone reading the newest message keeps seeing it as the log grows or shrinks
          declare Boolean AtBottom = Log.ScrollOffset.Y >= Log.ScrollMax.Y - 1.;
          Log.Size = <${ms.real(width)}, CodriverLogHeight>;
          declare Real MaxY = CodriverContentHeight - CodriverLogHeight;
          if (MaxY < 0.) MaxY = 0.;
          Log.ScrollMax = <0., MaxY>;
          if (CodriverScrollEnd != CodriverScrolled || AtBottom) {
            CodriverScrolled = CodriverScrollEnd;
            CodriverStickFrames = 5;
          }

          for (I, 0, ${ms.int(bubbles - 1)}) {
            declare Bubble <=> (Page.GetFirstChild("codriver-bubble-" ^ I) as CMlQuad);
            Bubble.Visible = I < CodriverBubblePos.count;
            if (Bubble.Visible) {
              Bubble.RelativePosition_V3 = CodriverBubblePos[I];
              Bubble.Size = CodriverBubbleSizes[I];
            }
          }
          for (I, 0, ${ms.int(speakers - 1)}) {
            declare Speaker <=> (Page.GetFirstChild("codriver-speaker-" ^ I) as CMlLabel);
            Speaker.Visible = I < CodriverSpeakerTexts.count;
            if (Speaker.Visible) {
              Speaker.SetText(CodriverSpeakerTexts[I]);
              Speaker.RelativePosition_V3 = CodriverSpeakerPos[I];
              Speaker.Size = <CodriverSpeakerWidths[I], 3.>;
            }
          }
          for (I, 0, ${ms.int(lines - 1)}) {
            declare Line <=> (Page.GetFirstChild("codriver-line-" ^ I) as CMlLabel);
            Line.Visible = I < CodriverLineTexts.count;
            if (Line.Visible) {
              Line.SetText(CodriverLineTexts[I]);
              Line.RelativePosition_V3 = CodriverLinePos[I];
              Line.Size = <CodriverLineWidths[I], 3.3>;
            }
          }

          Page.GetFirstChild("codriver-empty").Visible = CodriverEmpty;
          declare Progress <=> (Page.GetFirstChild("codriver-progress") as CMlLabel);
          Progress.Visible = CodriverBusy;
          Progress.SetText("$i" ^ CodriverProgress);
          Progress.RelativePosition_V3 = <0., CodriverProgressY>;

          // Cancel sits at the right end of the progress row
          declare Stop <=> Page.GetFirstChild("codriver-stop");
          Stop.Visible = CodriverBusy;
          declare Vec2 StopPos = Stop.RelativePosition_V3;
          Stop.RelativePosition_V3 = <StopPos.X, CodriverProgressY>;

          declare Confirm <=> Page.GetFirstChild("codriver-confirm");
          Confirm.Visible = CodriverConfirm;
          Confirm.RelativePosition_V3 = <0., CodriverConfirmY>;

          Page.GetFirstChild("codriver-draft").Visible = CodriverDraft != "";
          (Page.GetFirstChild("codriver-draft-text") as CMlLabel).SetText(CodriverDraft);

          declare SendLabel <=> (Page.GetFirstChild("codriver-send-label") as CMlLabel);
          if (CodriverBusy) SendLabel.SetText("Sending…");
          else SendLabel.SetText(${ICON_SEND});

          // Send or Add took the text; anything typed since stays
          if (CodriverClearEntry != CodriverEntryCleared) {
            CodriverEntryCleared = CodriverClearEntry;
            (Page.GetFirstChild("codriver-entry") as CMlTextEdit).Value = "";
          }
        }
      `}</Script.Functions>
      <Script.Main id="codriver">{`
        declare Integer CodriverUpdate for This = -1;
        declare Integer CodriverClearEntry for This = 0;
        CodriverShown = -1;
        CodriverScrolled = -1;
        declare LogFrame <=> (Page.GetFirstChild("codriver-log") as CMlFrame);
        LogFrame.ScrollActive = True;
        LogFrame.ScrollMin = <0., 0.>;
        CodriverEntryCleared = CodriverClearEntry;
        (Page.GetFirstChild("codriver-entry") as CMlTextEdit).StartEdition();
      `}</Script.Main>
      <Script.Loop id="codriver">{`
        declare Integer CodriverUpdate for This;
        if (CodriverUpdate != CodriverShown) {
          CodriverShown = CodriverUpdate;
          CodriverApply();
        }
        if (CodriverStickFrames > 0) {
          CodriverStickFrames = CodriverStickFrames - 1;
          declare Log <=> (Page.GetFirstChild("codriver-log") as CMlFrame);
          Log.ScrollOffset = <0., Log.ScrollMax.Y>;
        }
      `}</Script.Loop>
    </>
  );
}

// Port of codriver-window.hbs: the player's chat window; the update page fills it
export function CodriverWindowPage(props: ManialinkPageProps) {
  const data = props.data as CodriverWindowData;
  const { width } = data;
  const height = props.size.y - 4;
  return (
    <Window
      id={props.id}
      title={props.title}
      size={[props.size.x, props.size.y]}
    >
      <frame id="codriver" pos={[2, -2]} size={[width, height]}>
        <frame id="codriver-empty" hidden>
          <Label
            tone="contentTextMuted"
            font="body"
            pos={[0, -4]}
            size={[width, 8]}
            text={EXPERIMENTAL_HINT}
            textsize={1}
            valign="center"
          />
        </frame>

        {/* Pools of controls the script places; the update page says where and with what text */}
        <Pools data={data} />

        <Label
          id="codriver-progress"
          tone="contentTextMuted"
          font="body"
          size={[width - 22, 4]}
          textsize={1}
          valign="top"
          hidden
        />
        <Button
          id="codriver-stop"
          hidden
          pos={[width - 20, 0]}
          size={[20, 4]}
          action="codriver-stop"
          text=" Cancel request"
          textsize={0.8}
          labelY={-1.75}
        />

        <frame id="codriver-confirm" size={[width, 5]} hidden>
          <Label
            tone="contentText"
            font="body"
            pos={[0, -2.25]}
            size={[50, 5]}
            text="Confirm this change within 60 seconds."
            textsize={1}
            valign="center"
          />
          <Button
            pos={[width - 41, 0]}
            size={[20, 5]}
            action="codriver-confirm"
            text={ICON_CONFIRM}
            labelY={-2.25}
          />
          <Button
            pos={[width - 20, 0]}
            size={[20, 5]}
            action="codriver-cancel"
            text={ICON_CANCEL}
            labelY={-2.25}
          />
        </frame>

        <frame
          id="codriver-draft"
          pos={[0, data.draftY]}
          size={[width, 5]}
          hidden
        >
          <Label
            id="codriver-draft-text"
            tone="contentTextMuted"
            font="body"
            pos={[0, -2.25]}
            size={[width - 17, 5]}
            textsize={1}
            valign="center"
          />
          <Button
            pos={[width - 15, 0]}
            size={[15, 5]}
            action="codriver-discard"
            text={ICON_DISCARD}
            labelY={-2.25}
          />
        </frame>

        {/* Send and Clear stack beside the text box, together as tall as it */}
        <frame pos={[0, data.inputY]} size={[width, data.inputHeight]}>
          <Panel
            tone="surface"
            pos={[0, 0.25 - data.inputHeight]}
            size={[width - 17, 0.25]}
          />
          <Entry size={[width - 17, data.inputHeight]} />
          <Button
            pos={[width - 15, 0]}
            size={[15, 4.75]}
            action="codriver-send"
            text={ICON_SEND}
            labelId="codriver-send-label"
            labelY={-2.25}
          />
          <Button
            pos={[width - 15, -5.25]}
            size={[15, 4.75]}
            action="codriver-clear"
            text={ICON_CLEAR}
            labelY={-2.25}
          />
        </frame>
      </frame>
      <CodriverScript data={data} />
    </Window>
  );
}

const DECLARATIONS = `
  declare Integer CodriverUpdate for This;
  declare Text[] CodriverSpeakerTexts for This;
  declare Vec2[] CodriverSpeakerPos for This;
  declare Real[] CodriverSpeakerWidths for This;
  declare Vec2[] CodriverBubblePos for This;
  declare Vec2[] CodriverBubbleSizes for This;
  declare Text[] CodriverLineTexts for This;
  declare Vec2[] CodriverLinePos for This;
  declare Real[] CodriverLineWidths for This;
  declare Boolean CodriverEmpty for This;
  declare Boolean CodriverBusy for This;
  declare Text CodriverProgress for This;
  declare Real CodriverProgressY for This;
  declare Boolean CodriverConfirm for This;
  declare Real CodriverConfirmY for This;
  declare Text CodriverDraft for This;
  declare Integer CodriverClearEntry for This;
  declare Real CodriverLogHeight for This;
  declare Real CodriverContentHeight for This;
  declare Integer CodriverScrollEnd for This;
`;

// Port of codriver-window-update.hbs: only sets the variables the window's script reads
export function CodriverWindowUpdatePage(props: ManialinkPageProps) {
  const { script } = props.data as CodriverWindowData;
  return (
    <Manialink id={props.id} name={`TMCP:${props.id}`}>
      {/* The script is built and escaped by updateScript() */}
      <Script.Main id="codriver-update">{ms`${ms.raw(DECLARATIONS)}${ms.raw(script)}`}</Script.Main>
    </Manialink>
  );
}
