/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import { Script, ms } from "maniatsx";
import { slot } from "maniatsx/theme";
import { kit } from "./theme";

export interface SelectOption {
  value: string;
  label: string;
  detail?: string;
}

export interface SelectProps {
  // Entry name: the picked value arrives in answer.entries[name]
  name: string;
  value: string;
  options: SelectOption[];
  pos?: [number, number];
  width: number;
  // Rows shown before the list scrolls (default 10)
  maxVisible?: number;
  // Adds a last option that switches to a free text entry
  custom?: { label: string };
  disabled?: boolean;
}

const FIELD_HEIGHT = 5;
const ROW_HEIGHT = 4;
const STRIP_HEIGHT = 3;
const CHEVRON_DOWN = "";
const CHEVRON_UP = "";

// "CCC" -> <0.800, 0.800, 0.800>; scripts set colors without ColorLib
function vec3(hex: string): string {
  const digits = hex.replace(/^#/, "");
  const parts =
    digits.length >= 6
      ? [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255)
      : [0, 1, 2].map((i) => parseInt(digits[i] ?? "0", 16) / 15);
  return `<${parts.map((part) => (Number.isFinite(part) ? part : 0).toFixed(3)).join(", ")}>`;
}

interface SelectColors {
  closedBg: string;
  openBg: string;
  closedText: string;
  openText: string;
  rowBg: string;
  rowHoverBg: string;
  rowMuted: string;
}

// Plain ManiaScript (no client compiler), so the GBX service can render the kit untransformed.
// Root controls: field, entry, back link, list, underline, then glyph labels (the script
// serializer escapes non-ASCII, which ManiaScript can't read). List: background, then rows.
function selectFunctions(colors: SelectColors) {
  const c = Object.fromEntries(
    Object.entries(colors).map(([key, hex]) => [key, ms.raw(vec3(hex))]),
  ) as Record<keyof SelectColors, ReturnType<typeof ms.raw>>;
  return ms`
Void TmcpSel_Paint(CMlFrame _Root, Boolean _Open) {
  declare CMlFrame Field <=> (_Root.Controls[0] as CMlFrame);
  declare CMlLabel Chevron <=> (Field.Controls[3] as CMlLabel);
  if (_Open) {
    (Field.Controls[0] as CMlQuad).BgColor = ${c.openBg};
    (Field.Controls[1] as CMlLabel).TextColor = ${c.openText};
    Chevron.TextColor = ${c.openText};
    Chevron.SetText((_Root.Controls[6] as CMlLabel).Value);
  } else {
    (Field.Controls[0] as CMlQuad).BgColor = ${c.closedBg};
    (Field.Controls[1] as CMlLabel).TextColor = ${c.closedText};
    Chevron.TextColor = ${c.closedText};
    Chevron.SetText((_Root.Controls[7] as CMlLabel).Value);
  }
}

Void TmcpSel_Layout(CMlFrame _Root, Integer _Offset) {
  declare Integer[Text] TmcpSel_Count for Page;
  declare Integer[Text] TmcpSel_Max for Page;
  declare Integer[Text] TmcpSel_Offset for Page;
  declare CMlFrame List <=> (_Root.Controls[3] as CMlFrame);
  declare Text Key = _Root.ControlId;
  declare Integer Count = TmcpSel_Count[Key];
  declare Integer Max = TmcpSel_Max[Key];
  declare Integer First = _Offset;
  if (First > Count - Max) First = Count - Max;
  if (First < 0) First = 0;
  TmcpSel_Offset[Key] = First;
  declare Real Y = 0.;
  if (Count > Max) Y = -${ms.real(STRIP_HEIGHT)};
  for (I, 0, Count - 1) {
    declare CMlFrame Row <=> (List.Controls[1 + I] as CMlFrame);
    Row.Visible = I >= First && I < First + Max;
    if (Row.Visible) {
      Row.RelativePosition_V3 = <0., Y>;
      Y -= ${ms.real(ROW_HEIGHT)};
    }
  }
}

Void TmcpSel_Scroll(CMlFrame _Root, Integer _Delta) {
  declare Integer[Text] TmcpSel_Offset for Page;
  TmcpSel_Layout(_Root, TmcpSel_Offset[_Root.ControlId] + _Delta);
}

Void TmcpSel_Toggle(CMlFrame _Root) {
  declare CMlFrame List <=> (_Root.Controls[3] as CMlFrame);
  List.Visible = !List.Visible;
  TmcpSel_Paint(_Root, List.Visible);
}

Void TmcpSel_Pick(CMlFrame _Row) {
  declare Integer[Text] TmcpSel_Count for Page;
  declare CMlFrame List <=> _Row.Parent;
  declare CMlFrame Root <=> List.Parent;
  declare CMlFrame Field <=> (Root.Controls[0] as CMlFrame);
  declare Text Value = (_Row.Controls[4] as CMlLabel).Value;
  (Field.Controls[1] as CMlLabel).SetText((_Row.Controls[2] as CMlLabel).Value);
  (Field.Controls[2] as CMlLabel).SetText((_Row.Controls[3] as CMlLabel).Value);
  (Field.Controls[4] as CMlLabel).SetText(Value);
  (Root.Controls[1] as CMlEntry).SetText(Value, False);
  for (I, 0, TmcpSel_Count[Root.ControlId] - 1) {
    declare CMlFrame Other <=> (List.Controls[1 + I] as CMlFrame);
    if ((Other.Controls[4] as CMlLabel).Value == Value) (Other.Controls[1] as CMlLabel).SetText((Root.Controls[5] as CMlLabel).Value);
    else (Other.Controls[1] as CMlLabel).SetText("");
  }
  List.Hide();
  TmcpSel_Paint(Root, False);
}

Void TmcpSel_Hover(CMlFrame _Row, Boolean _Over) {
  if (_Over) {
    (_Row.Controls[0] as CMlQuad).BgColor = ${c.rowHoverBg};
    (_Row.Controls[1] as CMlLabel).TextColor = ${c.openText};
    (_Row.Controls[2] as CMlLabel).TextColor = ${c.openText};
    (_Row.Controls[3] as CMlLabel).TextColor = ${c.openText};
  } else {
    (_Row.Controls[0] as CMlQuad).BgColor = ${c.rowBg};
    (_Row.Controls[1] as CMlLabel).TextColor = ${c.closedText};
    (_Row.Controls[2] as CMlLabel).TextColor = ${c.closedText};
    (_Row.Controls[3] as CMlLabel).TextColor = ${c.rowMuted};
  }
}

// Custom mode shows the entry; leaving it restores the last picked value
Void TmcpSel_SetCustom(CMlFrame _Root, Boolean _Custom) {
  declare CMlFrame Field <=> (_Root.Controls[0] as CMlFrame);
  declare CMlEntry Entry <=> (_Root.Controls[1] as CMlEntry);
  _Root.Controls[3].Hide();
  TmcpSel_Paint(_Root, False);
  Field.Visible = !_Custom;
  _Root.Controls[2].Visible = _Custom;
  if (_Custom) Entry.StartEdition();
  else Entry.SetText((Field.Controls[4] as CMlLabel).Value, False);
}
`;
}

const EVENTS = ms`
if (Event.Type == CMlScriptEvent::Type::MouseClick) {
  if (Event.Control.HasClass("tmcp-select-toggle")) TmcpSel_Toggle(Event.Control.Parent.Parent);
  else if (Event.Control.HasClass("tmcp-select-pick")) TmcpSel_Pick(Event.Control.Parent);
  else if (Event.Control.HasClass("tmcp-select-up")) TmcpSel_Scroll(Event.Control.Parent.Parent.Parent, -1);
  else if (Event.Control.HasClass("tmcp-select-down")) TmcpSel_Scroll(Event.Control.Parent.Parent.Parent, 1);
  else if (Event.Control.HasClass("tmcp-select-custom")) TmcpSel_SetCustom(Event.Control.Parent.Parent.Parent.Parent, True);
  else if (Event.Control.HasClass("tmcp-select-back")) TmcpSel_SetCustom(Event.Control.Parent, False);
} else if (Event.Type == CMlScriptEvent::Type::MouseOver && Event.Control.HasClass("tmcp-select-pick")) {
  TmcpSel_Hover(Event.Control.Parent, True);
} else if (Event.Type == CMlScriptEvent::Type::MouseOut && Event.Control.HasClass("tmcp-select-pick")) {
  TmcpSel_Hover(Event.Control.Parent, False);
}
`;

function DefaultSelect(props: SelectProps) {
  const { color, font } = kit.useTokens();
  const { width, options } = props;
  const key = `tmcp-select-${props.name.replace(/[^A-Za-z0-9_-]/g, "-")}`;
  const max = Math.max(1, Math.floor(props.maxVisible ?? 10));
  const scrolls = options.length > max;
  const selectedIndex = options.findIndex(
    (option) => option.value === props.value,
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const startCustom = !!props.custom && !selected && props.value !== "";
  // Open the list with the current value in view
  const offset = Math.max(
    0,
    Math.min(selectedIndex - Math.floor(max / 2), options.length - max),
  );
  const top = scrolls ? -STRIP_HEIGHT : 0;
  const rowsBottom = top - Math.min(max, options.length) * ROW_HEIGHT;
  const customY = scrolls ? rowsBottom - STRIP_HEIGHT : rowsBottom;
  const listHeight = -customY + (props.custom ? ROW_HEIGHT + 0.25 : 0);
  const detailWidth = Math.min(width * 0.45, 22);
  const dim = props.disabled ? 0.45 : undefined;

  return (
    <frame
      id={key}
      pos={props.pos ?? [0, 0]}
      size={[width, FIELD_HEIGHT + 4]}
      z-index={30}
    >
      <Script.Functions id="tmcp-select">
        {selectFunctions({
          closedBg: color.contentAlt,
          openBg: color.surface,
          closedText: color.contentText,
          openText: color.text,
          rowBg: color.content,
          rowHoverBg: color.surfaceAlt,
          rowMuted: color.contentTextMuted,
        })}
      </Script.Functions>
      {/* Declared once per page (deduped by id), then filled per select */}
      <Script.Main id="tmcp-select">{ms`
declare Integer[Text] TmcpSel_Count for Page;
declare Integer[Text] TmcpSel_Max for Page;
declare Integer[Text] TmcpSel_Offset for Page;
`}</Script.Main>
      <Script.Main id={key}>{ms`
TmcpSel_Count[${key}] = ${ms.int(options.length)};
TmcpSel_Max[${key}] = ${ms.int(max)};
TmcpSel_Offset[${key}] = ${ms.int(offset)};
`}</Script.Main>
      <Script.Events id="tmcp-select">{EVENTS}</Script.Events>

      {/* The field sits above the entry; picking writes the entry, custom mode hides the field */}
      <frame size={[width, FIELD_HEIGHT]} z-index={2} hidden={startCustom}>
        <quad
          id={`${key}-toggle`}
          class="tmcp-select-toggle"
          size={[width, FIELD_HEIGHT]}
          bgcolor={color.contentAlt}
          opacity={dim}
          scriptevents={!props.disabled}
        />
        <label
          pos={[1, -FIELD_HEIGHT / 2]}
          size={[width - detailWidth - 5, FIELD_HEIGHT]}
          text={selected?.label ?? props.value}
          opacity={dim}
          textsize={1}
          textfont={font.body}
          textcolor={color.contentText}
          valign="center2"
        />
        <label
          pos={[width - 4, -FIELD_HEIGHT / 2]}
          size={[detailWidth, FIELD_HEIGHT]}
          text={selected?.detail ?? ""}
          opacity={dim}
          textsize={0.8}
          textfont={font.body}
          textcolor={color.contentTextMuted}
          halign="right"
          valign="center2"
        />
        <label
          pos={[width - 1.5, -FIELD_HEIGHT / 2]}
          size={[3, FIELD_HEIGHT]}
          text={CHEVRON_DOWN}
          opacity={dim}
          textsize={1}
          textcolor={color.contentText}
          halign="right"
          valign="center2"
        />
        <label text={selected?.value ?? ""} hidden />
      </frame>
      <entry
        name={props.name}
        default={props.value}
        size={[width, FIELD_HEIGHT]}
        textsize={1}
        textfont="GameFontRegular"
        textcolor={color.contentText}
        focusareacolor1={color.contentAlt}
        focusareacolor2={color.contentAlt}
        valuetype="Ml_String"
        valign="top"
        z-index={1}
      />
      <label
        id={`${key}-back`}
        class="tmcp-select-back"
        pos={[0, -FIELD_HEIGHT - 1]}
        size={[width, 3]}
        text="‹ Back to list"
        textsize={0.8}
        textfont={font.body}
        textcolor={color.contentTextMuted}
        hidden={!startCustom}
        scriptevents
      />
      <frame
        pos={[0, -FIELD_HEIGHT - 0.25]}
        size={[width, listHeight]}
        z-index={40}
        hidden
      >
        <quad size={[width, listHeight]} bgcolor={color.content} />
        {options.map((option, index) => {
          const shown = index >= offset && index < offset + max;
          return (
            <frame
              pos={[0, top - (index - offset) * ROW_HEIGHT]}
              size={[width, ROW_HEIGHT]}
              hidden={!shown}
            >
              <quad
                id={`${key}-pick-${index}`}
                class="tmcp-select-pick"
                size={[width, ROW_HEIGHT]}
                bgcolor={color.content}
                scriptevents
              />
              <label
                pos={[1.5, -ROW_HEIGHT / 2]}
                size={[2, ROW_HEIGHT]}
                text={index === selectedIndex ? "✓" : ""}
                textsize={0.9}
                textcolor={color.contentText}
                halign="center"
                valign="center2"
              />
              <label
                pos={[3.5, -ROW_HEIGHT / 2]}
                size={[width - detailWidth - 6, ROW_HEIGHT]}
                text={option.label}
                textsize={0.9}
                textfont={index === selectedIndex ? font.title : font.body}
                textcolor={color.contentText}
                valign="center2"
              />
              <label
                pos={[width - 1, -ROW_HEIGHT / 2]}
                size={[detailWidth, ROW_HEIGHT]}
                text={option.detail ?? ""}
                textsize={0.7}
                textfont={font.body}
                textcolor={color.contentTextMuted}
                halign="right"
                valign="center2"
              />
              <label text={option.value} hidden />
            </frame>
          );
        })}
        {scrolls && (
          <frame size={[width, STRIP_HEIGHT]}>
            <quad
              id={`${key}-up`}
              class="tmcp-select-up"
              size={[width, STRIP_HEIGHT]}
              bgcolor={color.contentAlt}
              scriptevents
            />
            <label
              pos={[width / 2, -STRIP_HEIGHT / 2]}
              text="▲"
              textsize={0.7}
              textcolor={color.contentTextMuted}
              halign="center"
              valign="center2"
            />
          </frame>
        )}
        {scrolls && (
          <frame pos={[0, rowsBottom]} size={[width, STRIP_HEIGHT]}>
            <quad
              id={`${key}-down`}
              class="tmcp-select-down"
              size={[width, STRIP_HEIGHT]}
              bgcolor={color.contentAlt}
              scriptevents
            />
            <label
              pos={[width / 2, -STRIP_HEIGHT / 2]}
              text="▼"
              textsize={0.7}
              textcolor={color.contentTextMuted}
              halign="center"
              valign="center2"
            />
          </frame>
        )}
        {props.custom && (
          <frame pos={[0, customY]} size={[width, ROW_HEIGHT + 0.25]}>
            <frame pos={[0, -0.25]} size={[width, ROW_HEIGHT]}>
              <quad
                id={`${key}-custom`}
                class="tmcp-select-custom"
                size={[width, ROW_HEIGHT]}
                bgcolor={color.content}
                bgcolorfocus={color.contentAlt}
                scriptevents
              />
              <label
                pos={[3.5, -ROW_HEIGHT / 2]}
                size={[width - 5, ROW_HEIGHT]}
                text={props.custom.label}
                textprefix="$i"
                textsize={0.9}
                textfont={font.body}
                textcolor={color.contentText}
                valign="center2"
              />
            </frame>
            <quad size={[width, 0.25]} bgcolor={color.contentAlt} />
          </frame>
        )}
      </frame>
      {/* ECM-style underline below the field and the entry */}
      <quad
        pos={[0, -FIELD_HEIGHT]}
        size={[width, 0.25]}
        bgcolor={color.surface}
        z-index={3}
      />
      <label text="✓" hidden />
      <label text={CHEVRON_UP} hidden />
      <label text={CHEVRON_DOWN} hidden />
    </frame>
  );
}

export const Select = slot<SelectProps>("ui/select", DefaultSelect);
