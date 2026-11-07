"use client";

import type { AuthContextProps } from "react-oidc-context";
import { SPACETIME_LOCAL_STORAGE_TOKEN_KEY } from "./connection-builder";

// Set after an explicit sign-out so the panel stops auto-signing in to tmservers.live
const SIGNED_OUT_KEY = "tmservers_signed_out";

export const isSignedOutOfTmservers = () =>
  typeof window !== "undefined" &&
  localStorage.getItem(SIGNED_OUT_KEY) === "true";

export const signInToTmservers = (auth: AuthContextProps) => {
  localStorage.removeItem(SIGNED_OUT_KEY);
  return auth.signinRedirect();
};

// Ends the tmservers.live OIDC session too, so the next sign-in can pick another account
export const signOutOfTmservers = (auth: AuthContextProps) => {
  localStorage.setItem(SIGNED_OUT_KEY, "true");
  localStorage.removeItem(SPACETIME_LOCAL_STORAGE_TOKEN_KEY);
  return auth.signoutRedirect();
};
