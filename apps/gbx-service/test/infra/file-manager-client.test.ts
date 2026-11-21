import type { DbClient } from "@tmcontrolpanel/db";
import { encryptServerCredential } from "@tmcontrolpanel/shared/server-credentials";
import { describe, expect, it } from "vitest";
import { FileManagerClient } from "../../src/infra/filemanager/file-manager-client";

const SECRET = "x".repeat(32);

function fakeDb(
  server: {
    filemanagerUrl: string | null;
    filemanagerPassword: string | null;
  } | null,
) {
  const queries: unknown[] = [];
  const db = {
    servers: {
      findFirst: async (query: unknown) => {
        queries.push(query);
        return server;
      },
    },
  } as unknown as DbClient;
  return { db, queries };
}

function fakeFetch(response: () => Response) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response();
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const server = {
  filemanagerUrl: "https://fm.example.com/",
  filemanagerPassword: encryptServerCredential("secret-token", SECRET),
};

describe("FileManagerClient", () => {
  it("calls the fixed list endpoint with the decrypted token and no redirects", async () => {
    const { db, queries } = fakeDb(server);
    const http = fakeFetch(() =>
      Response.json(["Modes/A.Script.txt", "B.Script.txt"]),
    );
    const client = new FileManagerClient(db, SECRET, http.impl);

    expect(await client.listScripts("s1")).toEqual([
      "Modes/A.Script.txt",
      "B.Script.txt",
    ]);
    expect(http.calls[0]!.url).toBe("https://fm.example.com/scripts");
    expect(http.calls[0]!.init.redirect).toBe("error");
    expect(http.calls[0]!.init.headers).toEqual({
      Authorization: "Bearer secret-token",
    });
    expect(queries[0]).toMatchObject({ where: { id: "s1", deletedAt: null } });

    await client.listMaps("s1");
    expect(http.calls[1]!.url).toBe("https://fm.example.com/maps");
  });

  it("drops entries that aren't usable paths", async () => {
    const { db } = fakeDb(server);
    const http = fakeFetch(() =>
      Response.json(["ok.Map.Gbx", 42, "", "x".repeat(301), null]),
    );
    expect(
      await new FileManagerClient(db, SECRET, http.impl).listMaps("s1"),
    ).toEqual(["ok.Map.Gbx"]);
  });

  it("rejects without a file manager, on errors and on malformed or huge bodies", async () => {
    const none = new FileManagerClient(
      fakeDb({ filemanagerUrl: null, filemanagerPassword: null }).db,
      SECRET,
    );
    await expect(none.listMaps("s1")).rejects.toThrow(
      "This server has no file manager",
    );
    await expect(
      new FileManagerClient(fakeDb(null).db, SECRET).listMaps("s1"),
    ).rejects.toThrow("This server has no file manager");

    const cases: [() => Response, string][] = [
      [
        () => new Response("nope", { status: 401 }),
        "The file manager answered 401",
      ],
      [
        () => Response.json({ files: [] }),
        "The file manager sent an invalid list",
      ],
      [() => new Response("not json"), "The file manager sent an invalid list"],
      [
        () => new Response("x".repeat(3 * 1024 * 1024)),
        "The file manager sent an invalid list",
      ],
    ];
    for (const [response, message] of cases) {
      const client = new FileManagerClient(
        fakeDb(server).db,
        SECRET,
        fakeFetch(response).impl,
      );
      await expect(client.listScripts("s1")).rejects.toThrow(message);
    }

    const down = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    await expect(
      new FileManagerClient(fakeDb(server).db, SECRET, down).listScripts("s1"),
    ).rejects.toThrow("The file manager could not be reached");
  });
});
