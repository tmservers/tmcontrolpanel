"use client";

import { getDbConnectionBuilder } from "@/lib/spacetimedb/connection-builder";
import { isSignedOutOfTmservers } from "@/lib/spacetimedb/session";
import { useMemo, useState } from "react";
import { useAuth, useAutoSignin } from "react-oidc-context";
import { SpacetimeDBProvider as Provider } from "spacetimedb/react";
import UsersProvider from "./users-provider";

export default function SpacetimeDBProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();

  // Read once on mount; signing in again reloads the page through the OIDC redirect
  const [signedOut] = useState(isSignedOutOfTmservers);

  // Built synchronously so the provider exists in the same render the token does
  const token = auth.user?.id_token;
  const builder = useMemo(() => getDbConnectionBuilder(token), [token]);

  // Without a token the panel still renders; tournament UI shows a sign-in prompt
  if (!builder) {
    return (
      <>
        {!signedOut && <AutoSignin />}
        {children}
      </>
    );
  }

  return (
    <>
      {!signedOut && <AutoSignin />}
      <Provider connectionBuilder={builder}>
        <UsersProvider>{children}</UsersProvider>
      </Provider>
    </>
  );
}

// Hooks can't be conditional, so auto sign-in lives in its own component
function AutoSignin() {
  useAutoSignin();
  return null;
}
