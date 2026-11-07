"use client";

import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import { signInToTmservers } from "@/lib/spacetimedb/session";
import { IconLogin } from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";

// Tournament pages read SpacetimeDB, whose provider only mounts once signed in to tmservers.live
export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (config.TMSERVERS.DISABLED) {
    return (
      <Notice
        title="Tournaments are disabled"
        description="Tournaments need tmservers.live, which is turned off for this panel."
      />
    );
  }

  return <RequireTmservers>{children}</RequireTmservers>;
}

function RequireTmservers({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return <Notice title="Connecting to tmservers.live..." />;
  }

  if (!auth.isAuthenticated || !auth.user?.id_token) {
    return (
      <Notice
        title="Log in to tmservers.live"
        description="Tournaments are hosted on tmservers.live. Log in with your Trackmania account to view them."
      >
        <Button onClick={() => signInToTmservers(auth)}>
          <IconLogin />
          Log in
        </Button>
      </Notice>
    );
  }

  return children;
}

function Notice({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && (
        <p className="max-w-md text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
