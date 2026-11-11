import type { Logger } from "../logger";
import type { Clock } from "../ports";

export type AdminResolver = (
  serverId: string,
  login: string,
) => Promise<boolean>;

const CACHE_TTL_MS = 60_000;

// Which logins hold a panel admin role on this server, and which of them are connected.
// Cached briefly so plugins can check on every action without a query each time.
export class ServerAdmins {
  private readonly cache = new Map<string, { admin: boolean; at: number }>();
  private readonly connected = new Set<string>();
  private readonly listeners = new Set<(logins: readonly string[]) => void>();
  // Bumped on every sync so a slow lookup can't re-add a login that left meanwhile
  private generation = 0;

  constructor(
    private readonly serverId: string,
    private readonly resolve: AdminResolver | null,
    private readonly clock: Pick<Clock, "now">,
    private readonly log: Logger,
  ) {}

  async isAdmin(login: string): Promise<boolean> {
    if (!this.resolve || !login) return false;
    const hit = this.cache.get(login);
    if (hit && this.clock.now() - hit.at < CACHE_TTL_MS) return hit.admin;
    try {
      const admin = await this.resolve(this.serverId, login);
      this.cache.set(login, { admin, at: this.clock.now() });
      return admin;
    } catch (error) {
      // Fail closed: a database hiccup must not grant admin access
      this.log.warn({ err: error, login }, "Admin lookup failed");
      return false;
    }
  }

  connectedAdmins(): readonly string[] {
    return [...this.connected];
  }

  onChange(listener: (logins: readonly string[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async playerConnected(login: string): Promise<void> {
    const generation = this.generation;
    this.cache.delete(login);
    const admin = await this.isAdmin(login);
    if (generation !== this.generation) return;
    if (admin && !this.connected.has(login)) {
      this.connected.add(login);
      this.emit();
    }
  }

  playerDisconnected(login: string): void {
    this.cache.delete(login);
    if (this.connected.delete(login)) this.emit();
  }

  // Full player list after a (re)connect
  async sync(logins: readonly string[]): Promise<void> {
    const generation = ++this.generation;
    const results = await Promise.all(
      logins.map(async (login) => [login, await this.isAdmin(login)] as const),
    );
    if (generation !== this.generation) return;
    this.connected.clear();
    for (const [login, admin] of results) if (admin) this.connected.add(login);
    this.emit();
  }

  private emit(): void {
    const logins = this.connectedAdmins();
    for (const listener of this.listeners) listener(logins);
  }
}
