import "server-only";

// Holds the OAuth state and PKCE verifier between the redirect and the callback
export const TMEVENTS_COOKIE = "tmevents_oauth";
export const TMEVENTS_COOKIE_PATH = "/api/auth/callback/tmevents";
