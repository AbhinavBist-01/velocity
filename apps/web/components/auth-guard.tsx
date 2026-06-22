"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";
import { Spinner } from "~/components/ui/spinner";

function getLoginRedirect() {
  if (typeof window === "undefined") {
    return "/login";
  }
  const next = `${window.location.pathname}${window.location.search}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isError, isLoading } = useUser();

  useEffect(() => {
    if (isError || (!isLoading && !user)) {
      router.replace(getLoginRedirect());
    }
  }, [isError, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-3">
        <Spinner className="size-8 text-primary" />
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase animate-pulse">
          Loading secure workspace
        </span>
      </div>
    );
  }

  if (!user) {
    return null; // will redirect in useEffect
  }

  return <>{children}</>;
}
