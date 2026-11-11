import { Manialink, ManialinkDeps } from "./manialink";

export interface ActionButton {
  name: string;
  icon: string;
  type?: "image" | "text";
  action?: string;
  // Only shown to connected panel admins of this server
  adminOnly?: boolean;
}

const WIDGET = {
  id: "action-group-widget",
  template: "action-group",
  withUpdate: false,
  position: { x: -156, y: 85 },
} as const;

// Shared expandable button bar in the top-left corner; plugins add their entry points here.
// Everyone gets the public buttons; connected admins get a personal copy that adds the admin-only ones.
export class ActionGroup {
  private readonly widget: Manialink;
  private readonly adminWidgets = new Map<string, Manialink>();
  private actions: ActionButton[] = [];
  private admins: readonly string[] = [];

  constructor(private readonly deps: ManialinkDeps) {
    this.widget = new Manialink(deps, WIDGET);
  }

  add(action: ActionButton): void {
    this.actions = [
      ...this.actions.filter((a) => a.name !== action.name),
      action,
    ];
    this.render();
  }

  remove(name: string): void {
    this.actions = this.actions.filter((a) => a.name !== name);
    this.render();
  }

  setAdmins(logins: readonly string[]): void {
    this.admins = [...new Set(logins)];
    // Admins only change what's drawn when there are admin-only buttons (or copies to drop)
    if (this.adminWidgets.size > 0 || this.actions.some((a) => a.adminOnly))
      this.render();
  }

  list(): readonly ActionButton[] {
    return this.actions;
  }

  private render(): void {
    const publicActions = this.actions.filter((a) => !a.adminOnly);
    const hasAdminActions = publicActions.length !== this.actions.length;
    const wanted = new Set(hasAdminActions ? this.admins : []);

    for (const [login, widget] of this.adminWidgets) {
      if (wanted.has(login)) continue;
      widget.destroy();
      this.adminWidgets.delete(login);
    }

    // Broadcast next: it restores the bar for dropped admins and overwrites personal copies,
    // so those are drawn again last
    if (publicActions.length === 0) {
      this.widget.destroy();
    } else {
      this.widget.setData({ actions: publicActions });
      this.widget.display();
    }

    for (const login of wanted) {
      let widget = this.adminWidgets.get(login);
      if (!widget) {
        widget = new Manialink(this.deps, { ...WIDGET, login });
        this.adminWidgets.set(login, widget);
      }
      widget.setData({ actions: this.actions });
      widget.display();
    }
  }
}
