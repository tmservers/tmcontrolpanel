import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { reportException } from "@/lib/sentry/report";
import { TMEVENTS_COOKIE, TMEVENTS_COOKIE_PATH } from "@/lib/tmevents/cookie";
import {
  connectTmevents,
  TMEVENTS_ISSUER,
  tmeventsConfigured,
} from "@/lib/tmevents/oauth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const TEXT: Record<string, string> = {
  connected: "Trackmania Events is connected. You can close this window.",
  denied: "Trackmania Events was not connected.",
  failed:
    "Connecting Trackmania Events failed. Close this window and try again.",
};

// The popup's last page: tells the panel window how it went and closes itself.
// Only fixed text ends up in the page, never anything from the request.
function page(outcome: keyof typeof TEXT, status: number) {
  const res = new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Trackmania Events</title>` +
      `<body style="font-family:sans-serif;padding:2rem"><p>${TEXT[outcome]}</p>` +
      `<script>if(window.opener){window.opener.postMessage({type:"tmevents",outcome:"${outcome}"},location.origin);window.close()}</script>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
  res.cookies.set(TMEVENTS_COOKIE, "", {
    path: TMEVENTS_COOKIE_PATH,
    maxAge: 0,
  });
  return res;
}

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  if (!tmeventsConfigured()) return new NextResponse(null, { status: 404 });

  const query = req.nextUrl.searchParams;
  const [state, verifier] = (
    req.cookies.get(TMEVENTS_COOKIE)?.value ?? ""
  ).split(".");
  const code = query.get("code");
  const issuer = query.get("iss");
  if (
    !state ||
    !verifier ||
    !same(state, query.get("state") ?? "") ||
    (issuer !== null && issuer !== TMEVENTS_ISSUER)
  )
    return page("failed", 400);
  if (!code)
    return page(
      query.get("error") === "access_denied" ? "denied" : "failed",
      400,
    );

  try {
    await connectTmevents(session.user.id, code, verifier);
    return page("connected", 200);
  } catch (error) {
    const meta = { type: "api", module: "tmevents", function: "callback" };
    logger.error({ meta, error }, "Trackmania Events sign-in failed");
    reportException(error, meta, session);
    return page("failed", 502);
  }
}
