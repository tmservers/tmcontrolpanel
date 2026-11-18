import { action as clientAction } from "maniatsx/client";
import { renderComponent } from "../render";
import type { PluginContext, PluginDefinition } from "../types";

type Register = (definition: unknown) => void;
const scope = globalThis as {
  __tmcpRegister?: Register;
  __tmcpUiInstalled?: boolean;
};

// Importing the UI kit teaches the plugin's ctx about components and client actions. It hooks the
// sandbox's register function instead of changing definePlugin, so plugins that don't use the kit
// keep bundles without maniatsx.
if (typeof scope.__tmcpRegister === "function" && !scope.__tmcpUiInstalled) {
  scope.__tmcpUiInstalled = true;
  const register = scope.__tmcpRegister;
  scope.__tmcpRegister = (value) => {
    const definition = value as PluginDefinition<unknown>;
    register({
      ...definition,
      create(ctx: PluginContext<unknown>) {
        const theme = () => ctx.ui.themeData();
        // Components become render functions the guest runtime calls
        const toRender = ({ component, updateComponent, ...rest }: any) => ({
          ...rest,
          render: (props: any) => renderComponent(component, props, theme()),
          renderUpdate: updateComponent
            ? (props: any) => renderComponent(updateComponent, props, theme())
            : undefined,
        });
        const ui = {
          ...ctx.ui,
          action: (name: string) =>
            clientAction(`${ctx.ui.actionPrefix()}${name}`),
          widget(options: any) {
            if (!options.component) return ctx.ui.widget(options);
            return ctx.ui.widget(toRender(options));
          },
          window(options: any) {
            if (!options.component) return ctx.ui.window(options);
            return ctx.ui.window(toRender(options));
          },
        };
        return definition.create({ ...ctx, ui } as PluginContext<unknown>);
      },
    });
  };
}
