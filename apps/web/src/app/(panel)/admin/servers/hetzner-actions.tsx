"use client";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/routes";
import { IconKey } from "@tabler/icons-react";
import Link from "next/link";

// Tokens belong to users, so they are added and shared from account settings
export const createHetznerActions = () => (
  <Link href={routes.settings} className={buttonVariants()}>
    <IconKey />
    <span className="hidden sm:inline">Manage tokens</span>
  </Link>
);
