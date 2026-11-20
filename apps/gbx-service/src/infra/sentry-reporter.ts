import * as Sentry from "@sentry/node";
import type { ErrorReporter } from "../core/ports";

// Reports through the Sentry client main.ts/worker.ts set up when SENTRY_DSN is configured
export const sentryErrorReporter: ErrorReporter = {
  captureException(error, { tags, extra }) {
    if (!Sentry.isInitialized()) return;
    Sentry.withScope((scope) => {
      scope.setTags(tags);
      if (extra) scope.setExtras(extra);
      Sentry.captureException(error);
    });
  },
};
