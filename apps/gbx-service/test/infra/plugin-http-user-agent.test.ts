import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.hoisted(() => vi.fn());
vi.mock("node:https", () => ({ request }));

import { HttpsPluginClient } from "../../src/infra/http/plugin-http-client";

const ECM_HOST = "us-central1-fantasy-trackmania.cloudfunctions.net";

async function sentUserAgent(contact: string, host: string) {
  await new HttpsPluginClient(contact).fetch({
    url: `https://${host}/match-addRound`,
    method: "POST",
    headers: {},
    timeoutMs: 1000,
    maxResponseBytes: 1000,
  });
  return request.mock.calls[0]![1].headers["user-agent"];
}

beforeEach(() => {
  request.mockReset();
  request.mockImplementation((_url, _options, onResponse) => {
    const res = Object.assign(new EventEmitter(), {
      statusCode: 200,
      headers: {},
    });
    const req = Object.assign(new EventEmitter(), {
      end: () => {
        onResponse(res);
        res.emit("end");
        req.emit("close");
      },
    });
    return req;
  });
});

describe("plugin HTTP user agent", () => {
  it("sends the contact to eCircuitMania", async () => {
    expect(await sentUserAgent("TMControlPanel / me", ECM_HOST)).toBe(
      "TMControlPanel / me",
    );
  });

  it("keeps the contact from other plugin hosts", async () => {
    expect(await sentUserAgent("TMControlPanel / me", "example.com")).toBe(
      "TMControlPanel-Plugin",
    );
  });

  it("falls back to the default without a contact", async () => {
    expect(await sentUserAgent("", ECM_HOST)).toBe("TMControlPanel-Plugin");
  });
});
