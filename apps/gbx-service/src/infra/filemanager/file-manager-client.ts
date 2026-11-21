import type { DbClient } from "@tmcontrolpanel/db";
import { readBodyLimited } from "@tmcontrolpanel/shared";
import { decryptServerCredential } from "@tmcontrolpanel/shared/server-credentials";
import type { ServerFileLister } from "../../core/ports";

const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_FILES = 5000;
const MAX_PATH = 300;

export class FileManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileManagerError";
  }
}

// Lists files through a server's file manager. Only fixed list endpoints are reachable,
// and the URL and password never leave this class.
export class FileManagerClient implements ServerFileLister {
  constructor(
    private readonly db: DbClient,
    private readonly secretsKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  listScripts(serverId: string): Promise<string[]> {
    return this.list(serverId, "/scripts");
  }

  listMaps(serverId: string): Promise<string[]> {
    return this.list(serverId, "/maps");
  }

  private async list(
    serverId: string,
    path: "/scripts" | "/maps",
  ): Promise<string[]> {
    // Read on every call so a changed or removed file manager applies at once
    const server = await this.db.servers.findFirst({
      where: { id: serverId, deletedAt: null },
      select: { filemanagerUrl: true, filemanagerPassword: true },
    });
    if (!server?.filemanagerUrl) {
      throw new FileManagerError("This server has no file manager");
    }
    const base = server.filemanagerUrl.replace(/\/+$/, "");
    const password = server.filemanagerPassword
      ? decryptServerCredential(server.filemanagerPassword, this.secretsKey)
      : "";

    let response: Response;
    try {
      response = await this.fetchImpl(`${base}${path}`, {
        method: "GET",
        redirect: "error",
        headers: { Authorization: `Bearer ${password}` },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new FileManagerError("The file manager could not be reached");
    }
    if (response.status !== 200) {
      await response.body?.cancel();
      throw new FileManagerError(
        `The file manager answered ${response.status}`,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(
        new TextDecoder().decode(await readBodyLimited(response, MAX_BYTES)),
      );
    } catch {
      throw new FileManagerError("The file manager sent an invalid list");
    }
    if (!Array.isArray(parsed)) {
      throw new FileManagerError("The file manager sent an invalid list");
    }
    return parsed
      .filter(
        (file): file is string =>
          typeof file === "string" &&
          file.length > 0 &&
          file.length <= MAX_PATH,
      )
      .slice(0, MAX_FILES);
  }
}
