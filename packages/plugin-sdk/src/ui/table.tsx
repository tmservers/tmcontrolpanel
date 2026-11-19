/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import { slot } from "maniatsx/theme";
import type { Table } from "../helpers";
import { Label } from "./label";
import { Panel } from "./panel";
import { kit } from "./theme";

export interface TableProps {
  // Data from buildTable()
  table: Table;
  // Page actions, full action names (ctx.ui.action(...))
  prevAction?: string;
  nextAction?: string;
  pos?: [number, number];
}

// U+F104 and U+F105 are the arrows of the in-game icon font
const PREV = " Prev";
const NEXT = "Next ";

// Port of templates/components/table.hbs
export const UiTable = slot<TableProps>(
  "ui/table",
  ({ table, prevAction, nextAction, pos }) => {
    const { color, font } = kit.useTokens();
    const { width, rowHeight, textY, pagerY } = table;
    const height = -(pagerY - 6);
    return (
      <frame pos={pos ?? [0, 0]} size={[width, height]}>
        <Panel tone="surface" pos={[0, 0]} size={[width, rowHeight]} />
        {table.columns.map((column) => (
          <Label
            tone="text"
            font="title"
            pos={[column.x, textY]}
            size={[column.width, rowHeight]}
            text={column.title}
            halign={column.halign}
            valign="center2"
            textsize={0.9}
          />
        ))}

        {table.rows.length === 0 ? (
          <Label
            tone="contentText"
            font="body"
            pos={[width / 2, -rowHeight * 2]}
            size={[width, rowHeight]}
            text={table.empty}
            halign="center"
            valign="center2"
            textsize={1}
            opacity={0.6}
          />
        ) : (
          table.rows.map((row) => (
            <frame pos={[0, row.y]} size={[width, rowHeight]}>
              {row.odd && (
                <Panel
                  tone="contentAlt"
                  pos={[0, 0]}
                  size={[width, rowHeight]}
                  opacity={0.6}
                />
              )}
              {row.cells.map((cell) => (
                <label
                  pos={[cell.x, textY]}
                  size={[cell.width, rowHeight]}
                  text={cell.text}
                  halign={cell.halign}
                  valign="center2"
                  textsize={0.9}
                  textfont={font.body}
                  textcolor={cell.color ?? color.contentText}
                />
              ))}
            </frame>
          ))
        )}

        {table.pages !== 1 && (
          <frame pos={[0, pagerY]} size={[width, 5]}>
            <Panel
              tone="surface"
              pos={[0, 0]}
              size={[width, 0.25]}
              opacity={0.4}
            />
            <Label
              tone="contentText"
              font="body"
              pos={[1, -3]}
              size={[width - 30, 4]}
              text={`${table.from}-${table.to} of ${table.total}`}
              valign="center2"
              textsize={0.9}
              opacity={0.7}
            />
            <Label
              tone="contentText"
              font="title"
              pos={[width - 22, -3]}
              size={[10, 4]}
              text={PREV}
              halign="center"
              valign="center2"
              textsize={0.9}
              {...(table.hasPrev
                ? {
                    action: prevAction,
                    focusareacolor1: color.textMuted,
                    focusareacolor2: color.text,
                  }
                : { opacity: 0.3 })}
            />
            <Label
              tone="contentText"
              font="body"
              pos={[width - 14, -3]}
              size={[6, 4]}
              text={`${table.page}/${table.pages}`}
              halign="center"
              valign="center2"
              textsize={0.9}
            />
            <Label
              tone="contentText"
              font="title"
              pos={[width - 6, -3]}
              size={[10, 4]}
              text={NEXT}
              halign="center"
              valign="center2"
              textsize={0.9}
              {...(table.hasNext
                ? {
                    action: nextAction,
                    focusareacolor1: color.textMuted,
                    focusareacolor2: color.text,
                  }
                : { opacity: 0.3 })}
            />
          </frame>
        )}
      </frame>
    );
  },
);
