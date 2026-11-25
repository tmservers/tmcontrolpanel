import {
  DEFAULT_MARKETPLACE_INDEX_URL,
  MIN_SECRET_LENGTH,
} from "@tmcontrolpanel/shared";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const csv = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

const ARCHIVE_KEYS = [
  "EVENT_ARCHIVE_ENDPOINT",
  "EVENT_ARCHIVE_BUCKET",
  "EVENT_ARCHIVE_ACCESS_KEY_ID",
  "EVENT_ARCHIVE_SECRET_ACCESS_KEY",
] as const;

const envSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(3100),
    LOG_LEVEL: z.string().default("info"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    REDIS_URI: z.string().min(1, "REDIS_URI is required"),
    GBX_SERVICE_TOKEN: z
      .string()
      .min(
        MIN_SECRET_LENGTH,
        `GBX_SERVICE_TOKEN must be at least ${MIN_SECRET_LENGTH} characters`,
      ),
    WS_TICKET_SECRET: z
      .string()
      .min(
        MIN_SECRET_LENGTH,
        `WS_TICKET_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
      ),
    WS_ALLOWED_ORIGINS: csv,
    // Limit which servers this instance manages; empty manages all (see X-2 in the requirements)
    GBX_SERVICE_ENABLED_SERVERS: csv,
    // Cluster: unique id per container, worker process count (0 runs everything in one process)
    GBX_NODE_ID: z
      .string()
      .default("")
      .transform((value) => value.trim() || hostname()),
    GBX_WORKERS: z.coerce.number().int().min(0).max(64).default(1),
    GBX_LEASE_TTL_MS: z.coerce.number().int().min(6000).default(15_000),
    // Set by the front for the worker processes it starts
    GBX_WORKER_ID: z.string().optional(),
    // Commit the image was built from, shown in the in-game connect notice
    APP_REVISION: z.string().optional(),
    NADEO_SERVER_LOGIN: z.string().default(""),
    NADEO_SERVER_PASSWORD: z.string().default(""),
    NADEO_CONTACT: z.string().default("TMControlPanel"),
    NADEO_CLIENT_ID: z.string().default(""),
    NADEO_CLIENT_SECRET: z.string().default(""),
    // Plugin marketplace index, checked for withdrawn (yanked) versions; empty turns that off
    MARKETPLACE_INDEX_URL: z
      .union([z.literal(""), z.string().url()])
      .default(DEFAULT_MARKETPLACE_INDEX_URL),
    MARKETPLACE_CHECK_MINUTES: z.coerce.number().int().min(0).default(30),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
    TEMPLATES_DIR: z.string().optional(),
    // Codriver: where the service reaches the panel, and the token both share; empty turns /co off
    PANEL_INTERNAL_URL: z.union([z.literal(""), z.string().url()]).default(""),
    PANEL_INTERNAL_TOKEN: z.string().default(""),
    // Event archive on R2; off unless the first four are set
    EVENT_ARCHIVE_ENDPOINT: z
      .union([z.literal(""), z.string().url()])
      .default(""),
    EVENT_ARCHIVE_BUCKET: z.string().default(""),
    EVENT_ARCHIVE_ACCESS_KEY_ID: z.string().default(""),
    EVENT_ARCHIVE_SECRET_ACCESS_KEY: z.string().default(""),
    EVENT_ARCHIVE_SPOOL_DIR: z
      .string()
      .default("")
      .transform((dir) => dir.trim() || join(tmpdir(), "tmcp-events")),
    EVENT_ARCHIVE_SPOOL_MB: z.coerce.number().int().positive().default(1024),
    EVENT_ARCHIVE_SKIP_REPLIES: z
      .enum(["", "true", "false"])
      .default("")
      .transform((value) => value === "true"),
  })
  .superRefine((env, ctx) => {
    const archive = ARCHIVE_KEYS.filter((key) => env[key]);
    if (archive.length > 0) {
      for (const key of ARCHIVE_KEYS) {
        if (env[key]) continue;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must be set when ${archive[0]} is set`,
        });
      }
    }
    if (
      env.PANEL_INTERNAL_URL &&
      env.PANEL_INTERNAL_TOKEN.length < MIN_SECRET_LENGTH
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["PANEL_INTERNAL_TOKEN"],
        message: `PANEL_INTERNAL_TOKEN must be at least ${MIN_SECRET_LENGTH} characters when PANEL_INTERNAL_URL is set`,
      });
    }
  });

export type Config = z.infer<typeof envSchema> & { templatesDir: string };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `  ${i.path.join(".")}: ${i.message}`,
    );
    throw new Error(
      `Invalid configuration:\n${issues.join("\n")}\n` +
        "Set these as environment variables. For local development put them in the repo root .env " +
        "(see .env.example); apps/gbx-service/.env is an optional override.",
    );
  }

  return {
    ...result.data,
    // Resolves to apps/gbx-service/templates from both src/ (tsx) and dist/ (bundle)
    templatesDir:
      result.data.TEMPLATES_DIR ??
      fileURLToPath(new URL("../templates", import.meta.url)),
  };
}
