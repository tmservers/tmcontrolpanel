import { renderComponent } from "./render";
import type { PluginContext, PluginDefinition } from "./types";

export * from "./helpers";
export * from "./types";

// Registers the plugin with the sandbox it is loaded into. Bundle the plugin so this call runs
// when the script is evaluated (tmcp-plugin build does that).
export function definePlugin<Config = Record<string, unknown>>(
  definition: PluginDefinition<Config>,
): PluginDefinition<Config> {
  const register = (
    globalThis as { __tmcpRegister?: (definition: unknown) => void }
  ).__tmcpRegister;
  if (typeof register === "function")
    register({
      ...definition,
      create(ctx: PluginContext<Config>) {
        const ui = {
          ...ctx.ui,
          widget(options: any) {
            if (!options.component) return ctx.ui.widget(options);
            const {
              component: Component,
              updateComponent: Update,
              ...rest
            } = options;
            return ctx.ui.widget({
              ...rest,
              render: (props: any) =>
                renderComponent(Component, props, ctx.ui.themeData()),
              renderUpdate: Update
                ? (props: any) =>
                    renderComponent(Update, props, ctx.ui.themeData())
                : undefined,
            });
          },
          window(options: any) {
            if (!options.component) return ctx.ui.window(options);
            const { component: Component, ...rest } = options;
            return ctx.ui.window({
              ...rest,
              render: (props: any) =>
                renderComponent(Component, props, ctx.ui.themeData()),
            });
          },
        };
        return definition.create({ ...ctx, ui });
      },
    });
  return definition;
}
