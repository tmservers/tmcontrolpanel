// Reduces a manialink to what the game sees, so two renderers can be compared structurally.
// Attribute order, whitespace, number formatting and the split into several <script> blocks don't matter.

export interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
}

export interface NormalizedPage {
  tree: XmlNode;
  // Every script statement of the page, sorted; the order of parts is not compared
  script: string[];
}

export interface NormalizeOptions {
  // Attribute renames applied before comparing, per tag: { label: { color: "textcolor" } }
  renameAttrs?: Record<string, Record<string, string>>;
}

const TEXT_ATTRS = new Set([
  "text",
  "textprefix",
  "default",
  "image",
  "id",
  "name",
  "class",
]);

function normalizeValue(name: string, value: string): string {
  if (TEXT_ATTRS.has(name)) return value;
  return value
    .trim()
    .split(/\s+/)
    .map((token) =>
      /^-?\d+(\.\d+)?$/.test(token)
        ? String(Number(Number(token).toFixed(4)))
        : token,
    )
    .join(" ");
}

// One statement per entry; blocks, the loop variable's case and spacing around calls are unified
export function scriptStatements(body: string): string[] {
  return body
    .replace(/\bevent\b/g, "Event")
    .replace(/([;{}])/g, "$1\n")
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\s+\(/g, "(")
        .replace(/\)\s*\{/g, ") {"),
    )
    .filter(Boolean);
}

export function normalizeXml(
  xml: string,
  options: NormalizeOptions = {},
): NormalizedPage {
  const scripts: string[] = [];
  const markup = xml
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(
      /<script>\s*<!--([\s\S]*?)-->\s*<\/script>/g,
      (_, body: string) => {
        scripts.push(body);
        return "";
      },
    );

  const root: XmlNode = { tag: "#root", attrs: {}, children: [] };
  const stack: XmlNode[] = [root];
  let last = 0;
  const tag = /<(\/?)([A-Za-z][\w-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;
  for (const match of markup.matchAll(tag)) {
    const between = markup.slice(last, match.index);
    if (between.trim())
      throw new Error(`Unexpected text between tags: ${between.trim()}`);
    last = match.index + match[0].length;
    const [, closing, name, rawAttrs, selfClosing] = match;
    if (closing) {
      const open = stack.pop();
      if (open?.tag !== name) throw new Error(`Mismatched </${name}>`);
      continue;
    }
    const rename = options.renameAttrs?.[name] ?? {};
    const attrs: Record<string, string> = {};
    for (const [, key, value] of rawAttrs.matchAll(/([\w:-]+)="([^"]*)"/g)) {
      const target = rename[key] ?? key;
      attrs[target] = normalizeValue(target, value);
    }
    const node: XmlNode = {
      tag: name,
      attrs: Object.fromEntries(Object.entries(attrs).sort()),
      children: [],
    };
    stack.at(-1)!.children.push(node);
    if (!selfClosing) stack.push(node);
  }
  if (markup.slice(last).trim()) throw new Error("Unexpected trailing text");
  if (stack.length !== 1) throw new Error(`Unclosed <${stack.at(-1)!.tag}>`);
  if (root.children.length !== 1)
    throw new Error("Expected exactly one root element");

  return {
    tree: root.children[0],
    script: scripts.flatMap(scriptStatements).sort(),
  };
}

// Statements only one side has, as multisets
export function scriptDiff(
  a: string[],
  b: string[],
): { onlyA: string[]; onlyB: string[] } {
  const remaining = [...b];
  const onlyA: string[] = [];
  for (const statement of a) {
    const index = remaining.indexOf(statement);
    if (index === -1) onlyA.push(statement);
    else remaining.splice(index, 1);
  }
  return { onlyA, onlyB: remaining };
}
