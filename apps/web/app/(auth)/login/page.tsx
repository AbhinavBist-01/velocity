import Link from "next/link";
import { LoginForm } from "~/components/login-form";
import { Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-muted/30 to-background px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="w-full max-w-md flex flex-col items-center gap-6 relative z-10">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform hover:scale-105 duration-200"
        >
          <div className="size-10 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            ShipFlow<span className="text-primary">.ai</span>
          </span>
        </Link>

        {/* Form Card */}
        <LoginForm />
      </div>
    </main>
  );
}
