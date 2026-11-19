import type { ManialinkTheme, ThemeData } from "@tmcontrolpanel/shared";
import type { ActionRouter } from "../action-router";
import type { ManialinkService } from "../manialink-service";
import type { TemplateRenderer } from "../template-renderer";
import { renderComponent } from "../tsx/render";
import type {
  ManialinkComponent,
  ManialinkPageProps,
  Vector2,
} from "../tsx/types";

export type { ManialinkComponent, ManialinkPageProps, Vector2 };

export interface ManialinkDeps {
  renderer: TemplateRenderer;
  manialinks: ManialinkService;
  actions: ActionRouter;
  // The server's theme; the renderer's default when absent
  theme?: () => ManialinkTheme;
  // The server's resolved preset, for component pages; the Default preset when absent
  themeData?: () => ThemeData;
}

export interface ManialinkOptions {
  id: string;
  // Handlebars template; plugins and older pages
  template?: string;
  // TSX page, rendered under the server's preset instead of a template
  component?: ManialinkComponent;
  // The data page paired with a component; without it a component page has none
  updateComponent?: ManialinkComponent;
  // Player specific when set, public otherwise
  login?: string;
  // Pairs the page with a "<template>-update" page that carries data changes
  withUpdate?: boolean;
  position?: Vector2;
  size?: Vector2;
  title?: string;
  hideWhileDriving?: boolean;
  data?: unknown;
}

export class Manialink {
  readonly login?: string;
  private id: string;
  private template?: string;
  private component?: ManialinkComponent;
  private position: Vector2;
  private size: Vector2;
  private title: string;
  private hideWhileDriving: boolean;
  private data: unknown;
  private readonly updatePage: Manialink | null;

  constructor(
    protected readonly deps: ManialinkDeps,
    options: ManialinkOptions,
  ) {
    this.login = options.login;
    this.id = options.id;
    if (!options.template && !options.component)
      throw new Error(
        `Manialink "${options.id}" needs a template or a component`,
      );
    this.template = options.template;
    this.component = options.component;
    this.position = options.position ?? { x: 0, y: 0 };
    this.size = options.size ?? { x: 100, y: 80 };
    this.title = options.title ?? "";
    this.hideWhileDriving = options.hideWhileDriving ?? false;
    this.data = options.data;

    const hasUpdate =
      options.withUpdate !== false &&
      (options.component ? !!options.updateComponent : true);
    this.updatePage = hasUpdate
      ? new Manialink(deps, {
          id: `${options.id}-update`,
          ...(options.component
            ? { component: options.updateComponent }
            : { template: `${options.template}-update` }),
          login: options.login,
          withUpdate: false,
          title: options.title,
          data: options.data,
        })
      : null;
  }

  getId(): string {
    return this.id;
  }

  display(): void {
    this.deps.manialinks.display(this.id, this.render(), this.login, () =>
      this.render(),
    );
    this.updatePage?.display();
  }

  // Sends only the data page; the main page keeps its client-side state
  update(): void {
    this.updatePage?.display();
  }

  hide(): void {
    this.deps.manialinks.hide(this.id, this.login);
    this.updatePage?.hide();
  }

  destroy(): void {
    this.deps.manialinks.destroy(this.id, this.login);
    this.updatePage?.destroy();
  }

  setData(data: unknown): void {
    this.data = data;
    this.updatePage?.setData(data);
  }

  setTitle(title: string): void {
    this.title = title;
    this.updatePage?.setTitle(title);
  }

  setPosition(position: Vector2): void {
    this.position = position;
  }

  setSize(size: Vector2): void {
    this.size = size;
  }

  render(): string {
    const context: ManialinkPageProps = {
      id: this.id,
      position: this.position,
      size: this.size,
      title: this.title,
      hideWhileDriving: this.hideWhileDriving,
      data: this.data,
    };
    if (this.component)
      return renderComponent(this.component, context, this.deps.themeData?.());
    return this.deps.renderer.render(
      this.template!,
      context,
      this.deps.theme?.(),
    );
  }
}
