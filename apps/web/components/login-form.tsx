"use client";

import React from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useSignin } from "~/hooks/api/auth";
import { GoogleAuthButton } from "~/components/google-auth-button";
import { Sparkles } from "lucide-react";

function getSafeNextPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const nextPath = new URLSearchParams(window.location.search).get("next");

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  type FormValues = {
    email: string;
    password: string;
  };

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const { signInWithEmailAndPasswordAsync, error, status } = useSignin();
  const isSubmitting = status === "pending";

  async function onSubmit(values: FormValues) {
    try {
      await signInWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
      });
      router.replace(getSafeNextPath());
      router.refresh();
    } catch (err) {
      // handled by useSignin state
    }
  }

  function onError(errors: FieldErrors<FormValues>) {
    return errors;
  }

  return (
    <div className="flex flex-col gap-6 w-full" {...props}>
      <Card className="border border-border/40 bg-card/75 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-primary/5">
        <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <CardHeader className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase">ShipFlow AI Portal</span>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your projects, feature intake pipeline, and AI release reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="mb-6 space-y-4">
            <GoogleAuthButton />
            <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground/60">
              <div className="h-px flex-1 bg-border/50" />
              <span>or connect with email</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="email" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/80">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-background/50 border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary transition-all duration-200"
                  aria-invalid={!!errors.email}
                  {...register("email", {
                    required: "Enter your email.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/80">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-background/50 border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary transition-all duration-200"
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "Enter your password.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters.",
                    },
                  })}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden group/btn font-semibold py-6 bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-200 active:scale-[0.98]"
                >
                  {isSubmitting ? "Signing in..." : "Login"}
                </Button>
                {error && (
                  <FieldError className="mt-2 text-center text-sm text-destructive font-medium">
                    {error.message || "Invalid credentials. Please try again."}
                  </FieldError>
                )}
                <FieldDescription className="text-center mt-4 text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline transition-all">
                    Sign up
                  </Link>
                </FieldDescription>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
