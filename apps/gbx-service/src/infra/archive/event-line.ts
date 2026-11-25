const SCRIPT_CALLBACK = "ManiaPlanet.ModeScriptCallbackArray";

// Script callbacks carry one JSON text; anything else goes through JSON.stringify
function scriptJson(data: unknown): string | null {
  if (!Array.isArray(data) || typeof data[0] !== "string") return null;
  const args = data[1];
  if (!Array.isArray(args) || args.length !== 1) return null;
  const text: unknown = args[0];
  if (typeof text !== "string" || text.length < 2) return null;
  const first = text.charCodeAt(0);
  const last = text.charCodeAt(text.length - 1);
  const enclosed =
    (first === 123 && last === 125) || (first === 91 && last === 93);
  // A raw line break would split the record
  if (!enclosed || text.includes("\n") || text.includes("\r")) return null;
  return text;
}

// One NDJSON record. Script JSON is copied as it is, so most events skip JSON work entirely.
export function encodeEvent(at: number, method: string, data: unknown): string {
  if (method === SCRIPT_CALLBACK) {
    const json = scriptJson(data);
    if (json !== null) {
      return `[${at},${JSON.stringify((data as unknown[])[0])},${json}]\n`;
    }
  }
  return `[${at},${JSON.stringify(method)},${JSON.stringify(data ?? null)}]\n`;
}

// The response id comes first in a script reply, so the start of the text is enough
export function isScriptReply(method: string, data: unknown): boolean {
  if (method !== SCRIPT_CALLBACK) return false;
  const json = scriptJson(data);
  return json !== null && /"responseid"\s*:\s*"[^"]/.test(json.slice(0, 200));
}
