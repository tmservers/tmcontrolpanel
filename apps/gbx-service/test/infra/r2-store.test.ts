import { once } from "node:events";
import { createServer, type RequestListener, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { R2ObjectStore } from "../../src/infra/archive/r2-store";

const secret = "test-secret-do-not-leak";
const servers: Server[] = [];

async function listen(handler: RequestListener) {
  const server = createServer(handler);
  servers.push(server);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No server address");
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
  );
});

describe("R2ObjectStore", () => {
  it("signs and sends a PUT with the object bytes", async () => {
    const body = new Uint8Array([0, 1, 2, 255]);
    const received = new Promise<void>((resolve, reject) => {
      void listen((req, res) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          try {
            expect(req.method).toBe("PUT");
            expect(req.url).toBe("/bucket/folder/a%20b.bin");
            expect(Buffer.concat(chunks)).toEqual(Buffer.from(body));
            expect(Number(req.headers["content-length"])).toBe(body.length);
            expect(req.headers.authorization).toMatch(
              /^AWS4-HMAC-SHA256 Credential=key-id\/.+\/auto\/s3\/aws4_request/,
            );
            expect(req.headers["x-amz-content-sha256"]).toBe(
              "UNSIGNED-PAYLOAD",
            );
            res.end("ok");
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      })
        .then((endpoint) =>
          new R2ObjectStore({
            endpoint,
            bucket: "bucket",
            accessKeyId: "key-id",
            secretAccessKey: secret,
          }).put("folder/a b.bin", body),
        )
        .catch(reject);
    });
    await received;
  });

  it("reports failure status without exposing the secret", async () => {
    const endpoint = await listen((_req, res) => {
      res.statusCode = 403;
      res.end("denied");
    });
    const error: Error = await new R2ObjectStore({
      endpoint,
      bucket: "bucket",
      accessKeyId: "key-id",
      secretAccessKey: secret,
    })
      .put("key", new Uint8Array())
      .then(
        () => new Error("not rejected"),
        (reason) => reason,
      );
    expect(error.message).toBe("R2 PUT 403: denied");
    expect(error.message).not.toContain(secret);
  });

  it("aborts a hanging request after the configured timeout", async () => {
    const endpoint = await listen(() => {});
    await expect(
      new R2ObjectStore({
        endpoint,
        bucket: "bucket",
        accessKeyId: "key-id",
        secretAccessKey: secret,
        timeoutMs: 30,
      }).put("key", new Uint8Array()),
    ).rejects.toThrow();
  });
});
