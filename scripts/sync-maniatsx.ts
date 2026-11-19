// Vendors the built maniatsx package into packages/maniatsx.
// Usage: bun scripts/sync-maniatsx.ts [git-ref]   (MANIATSX_DIR=<checkout> reuses a local clone)
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const REPO = "git@github.com:MRegterschot/maniatsx.git";
const ref = process.argv[2] ?? "master";
const target = resolve(import.meta.dirname, "../packages/maniatsx");

const run = (cmd: string, args: string[], cwd: string) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
const out = (args: string[], cwd: string) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

let dir = process.env.MANIATSX_DIR;
let tmp: string | undefined;
if (dir) {
  run("git", ["fetch", "--tags", "origin"], dir);
} else {
  tmp = mkdtempSync(join(tmpdir(), "maniatsx-"));
  dir = tmp;
  run("git", ["clone", REPO, dir], process.cwd());
}

try {
  // Build from a detached worktree so a local checkout is never modified
  const work = mkdtempSync(join(tmpdir(), "maniatsx-build-"));
  const resolved = (() => {
    for (const candidate of [`origin/${ref}`, ref]) {
      try {
        return out(["rev-parse", "--verify", `${candidate}^{commit}`], dir!);
      } catch {}
    }
    throw new Error(`Unknown ref: ${ref}`);
  })();
  run("git", ["worktree", "add", "--detach", work, resolved], dir);
  try {
    run("bun", ["install", "--frozen-lockfile"], work);
    run("bun", ["run", "build"], work);

    rmSync(join(target, "dist"), { recursive: true, force: true });
    cpSync(join(work, "dist"), join(target, "dist"), { recursive: true });
    // Keep only what consumers need: no dev tooling, scripts or source-only bins
    const pkg = JSON.parse(readFileSync(join(work, "package.json"), "utf8"));
    for (const key of ["devDependencies", "scripts", "bin"]) delete pkg[key];
    pkg.files = ["dist"];
    writeFileSync(
      join(target, "package.json"),
      JSON.stringify(pkg, null, 2) + "\n",
    );
    cpSync(join(work, "README.md"), join(target, "README.md"));
    for (const file of readdirSync(work)) {
      if (/^licen[sc]e/i.test(file))
        cpSync(join(work, file), join(target, file));
    }

    // Declarations keep `.ts` import specifiers; TS 5 consumers need `.js`
    stripTsExtensions(join(target, "dist"));

    writeFileSync(
      join(target, "VENDORED.json"),
      JSON.stringify(
        {
          repo: REPO,
          ref,
          commit: resolved,
          syncedAt: new Date().toISOString(),
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`Vendored maniatsx ${ref} @ ${resolved.slice(0, 8)}`);
  } finally {
    run("git", ["worktree", "remove", "--force", work], dir);
  }
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}

function stripTsExtensions(root: string) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) stripTsExtensions(path);
    else if (path.endsWith(".d.ts")) {
      const src = readFileSync(path, "utf8");
      const next = src.replace(/(["'])(\.{1,2}\/[^"']*)\.ts\1/g, "$1$2.js$1");
      if (next !== src) writeFileSync(path, next);
    }
  }
}
