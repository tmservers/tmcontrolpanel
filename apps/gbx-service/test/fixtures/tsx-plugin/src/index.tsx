import {
  definePlugin,
  type WidgetRenderProps,
} from "@tmcontrolpanel/plugin-sdk";
import { Label, Panel } from "@tmcontrolpanel/plugin-sdk/ui";
import { Manialink } from "maniatsx";
import { client, Publish, type Integer } from "maniatsx/client";

interface Score {
  points: Integer;
}

// Published by the update page, read by the main page
const score = client.shared<Score>("score", { points: 0 });

export default definePlugin({
  create(ctx) {
    const pick = ctx.ui.action("pick");

    function Board(props: WidgetRenderProps) {
      const clicks = client.state<Integer>(0, { persist: true, key: "clicks" });
      return (
        <Manialink id={props.id}>
          <Panel tone="surface" size={[40, 10]} />
          <Label
            tone="text"
            pos={[2, -2]}
            text={client.bind(() => `${score.value.points}`)}
          />
          <quad
            pos={[30, -2]}
            size={[6, 6]}
            onClick={client.handler(() => {
              clicks.value += 1;
              pick.trigger("42");
            })}
          />
        </Manialink>
      );
    }

    function BoardUpdate(props: WidgetRenderProps) {
      const data = props.data as { points: number };
      return (
        <Manialink id={props.id}>
          <Publish to={score} value={{ points: data.points }} />
        </Manialink>
      );
    }

    ctx.action("pick", (_answer, params) =>
      ctx.storage.set("args", params.args),
    );

    return {
      start() {
        ctx.ui
          .widget({
            id: "board",
            component: Board,
            updateComponent: BoardUpdate,
            data: { points: 7 },
          })
          .display();
      },
    };
  },
});
