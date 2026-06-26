"use client";

import { Button } from "~/components/ui/button";
import { Github } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import React from "react";

export function GithubAuthButton() {
  const handleGithubAuth = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      toast.error(`GitHub sign in failed: ${err.message || err}`);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGithubAuth}
      className="flex w-full items-center justify-center gap-2 border-border bg-black text-white hover:bg-neutral-900 font-mono text-xs uppercase tracking-wider transition-colors py-5"
    >
      <Github className="h-4 w-4 text-white fill-white shrink-0" />
      <span>Connect with GitHub</span>
    </Button>
  );
}
