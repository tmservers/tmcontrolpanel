import { auth } from "@/lib/auth";
import { TMEVENTS_COOKIE, TMEVENTS_COOKIE_PATH } from "@/lib/tmevents/cookie";
import { createAuthorization, tmeventsConfigured } from "@/lib/tmevents/oauth";
import { NextResponse } from "next/server";

// Starts the Trackmania Events sign-in. Opened as a popup from the import dialog.
export async function GET() {
  if (!(await auth())) return new NextResponse("Unauthorized", { status: 401 });
  if (!tmeventsConfigured())
    return new NextResponse("Trackmania Events is not set up on this panel", {
      status: 404,
    });

  const { url, state, verifier } = createAuthorization();
  const res = NextResponse.redirect(url);
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(TMEVENTS_COOKIE, `${state}.${verifier}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: TMEVENTS_COOKIE_PATH,
    maxAge: 600,
  });
  return res;
}
