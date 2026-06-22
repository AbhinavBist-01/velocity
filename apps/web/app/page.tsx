"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight, Kanban, GitPullRequest, ShieldCheck,
  Sparkles, Code, FileText, MessageSquare,
  ExternalLink, AlertTriangle, Terminal, Sun, Moon
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

/* ─────────────────────────────────────────────────────────────────────────
   Theme Toggle Button — sun (light) / moon (dark) with spin animation
───────────────────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  const toggle = () => {
    setAnimKey(k => k + 1);
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative h-9 w-9 flex items-center justify-center glass border border-foreground/20 hover:border-foreground/50 transition-all duration-300"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="relative h-9 w-9 flex items-center justify-center glass border border-foreground/20 hover:border-foreground/50 hover:scale-110 transition-all duration-300 overflow-hidden group"
    >
      {/* Hover glow ring */}
      <span className="absolute inset-0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground/5" />

      <span key={animKey} className="theme-icon-enter relative z-10">
        {isDark ? (
          /* Moon — shown when in dark mode */
          <Moon className="h-4 w-4 text-foreground" strokeWidth={1.8} />
        ) : (
          /* Sun — shown when in light mode */
          <Sun className="h-4 w-4 text-foreground" strokeWidth={1.8} />
        )}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Landing Page
───────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(3);

  const pipelineSteps = [
    { id: 0, title: "Product Discovery",  desc: "Intake context and customer interviews", status: "completed" },
    { id: 1, title: "PRD Specifications", desc: "Typesafe markdown spec sheets",          status: "completed" },
    { id: 2, title: "Kanban Planning",    desc: "Granular engineering sub-tasks",          status: "completed" },
    { id: 3, title: "AI PR Code Review",  desc: "Inline validation & security checks",     status: "active"    },
    { id: 4, title: "Release Sign-off",   desc: "PM validation & automated changelogs",    status: "pending"   },
  ];

  const featureCards = [
    { icon: <MessageSquare className="h-4 w-4" />, title: "Context Discovery",   desc: "Asks precise follow-up questions tailored to the request complexity to secure development criteria.",          tag: "// STEP_01_DISCOVERY"    },
    { icon: <FileText      className="h-4 w-4" />, title: "PRD Generation",      desc: "Generates a highly structured specifications document covering user stories, acceptance criteria and metrics.", tag: "// STEP_02_REQUIREMENTS"  },
    { icon: <Kanban        className="h-4 w-4" />, title: "Actionable Tasks",    desc: "Splits PRD goals into separate modular engineering tasks with priorities and drag-and-drop statuses.",         tag: "// STEP_03_PLANNING"     },
    { icon: <Code          className="h-4 w-4" />, title: "Diff Browser",        desc: "Displays modifications in a rich code tree, matching line changes with git diff highlights and branching.",    tag: "// STEP_04_DIFF_VIEW"    },
    { icon: <ShieldCheck   className="h-4 w-4" />, title: "Automated Audit",     desc: "Scans pull requests for security flaws and rate-limiting issues, placing callouts on faulty code lines.",     tag: "// STEP_05_AI_AUDIT"     },
    { icon: <Sparkles      className="h-4 w-4" />, title: "Release Automation",  desc: "Triggers deployment pipelines on shipment, compiling automatic change notes and deployment changelogs.",     tag: "// STEP_06_SHIPMENT"     },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none overflow-x-hidden relative bg-grid-dots">

      {/* Hero ambient glow */}
      <div className="hero-glow pointer-events-none fixed inset-0 z-0" />

      {/* Structural Top Border */}
      <div className="w-full h-1 bg-foreground relative z-10" />

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-foreground text-background flex items-center justify-center font-black text-sm tracking-tighter">
              VL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs uppercase tracking-widest font-black">Velocity</span>
                <span className="text-[9px] font-mono border border-foreground/30 px-1 leading-none uppercase text-muted-foreground py-0.5">v1.0</span>
              </div>
              <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider block">Automated Delivery Engine</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-muted-foreground">
            <a href="#features" className="hover:text-foreground hover:underline underline-offset-4 transition-all">01 // Features</a>
            <a href="#workflow" className="hover:text-foreground hover:underline underline-offset-4 transition-all">02 // Workflow</a>
            <a
              href="http://localhost:8000/docs"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-all flex items-center gap-1"
            >
              <span>03 // API Ref</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button className="rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 py-5 px-6 border border-foreground gap-1.5 transition-all">
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 lg:py-36 flex flex-col items-center text-center max-w-6xl mx-auto w-full border-x border-border z-10">

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass border border-foreground/15 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-10">
          <Terminal className="h-3.5 w-3.5 text-foreground animate-pulse" />
          <span>Status: Pipeline Online // Build: Stable</span>
        </div>

        {/* Heading */}
        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9] text-foreground">
          Move features <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40">
            from idea to prod
          </span>{" "}
          <br />
          in one flow.
        </h1>

        <p className="text-muted-foreground text-base lg:text-lg max-w-3xl mb-12 leading-relaxed font-mono tracking-tight">
          Velocity orchestrates the entire software delivery lifecycle. Gather missing requirements,
          generate structured PRDs, plan engineering tickets, run automated AI PR code reviews, and ship features.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-none py-6 px-10 font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 border-2 border-foreground transition-all gap-2 group"
            >
              <span>Open Dev Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-none py-6 px-10 font-mono text-xs uppercase tracking-widest border-2 border-foreground hover:bg-foreground hover:text-background transition-all gap-2"
            >
              <span>Read API Docs</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Architectural corner labels */}
        <div className="absolute left-6 bottom-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden lg:block">
          SYS // ENG_PIPELINE_ACTIVE
        </div>
        <div className="absolute right-6 bottom-4 text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden lg:block">
          LOC // VELOCITY_MONOREPO
        </div>
      </section>

      {/* ── Interactive Pipeline Mockup ────────────────────────────────── */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full border-x border-t border-border z-10">
        <div className="relative glass-card p-4 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-foreground" />

          {/* Mock browser chrome */}
          <div className="bg-background/80 border border-border/80 overflow-hidden flex flex-col backdrop-blur-sm">
            {/* Browser bar */}
            <div className="bg-muted/50 border-b border-border/80 p-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-none bg-foreground/20 border border-foreground/30" />
                <span className="h-3 w-3 rounded-none bg-foreground/20 border border-foreground/30" />
                <span className="h-3 w-3 rounded-none bg-foreground/20 border border-foreground/30" />
              </div>
              <div className="px-6 py-1 border border-border/60 bg-background/60 text-[10px] font-mono w-72 text-center truncate backdrop-blur-sm">
                velocity-app/features/stripe-checkout
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="inline-block h-2 w-2 rounded-full bg-foreground animate-ping" />
                <span>PIPELINE_SYNCED</span>
              </div>
            </div>

            {/* Workspace body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
              {/* Sidebar steps */}
              <div className="space-y-4 lg:col-span-1 border-r border-border/80 pr-6 hidden lg:block">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Delivery Pipeline</span>
                <div className="space-y-2 font-mono text-xs">
                  {pipelineSteps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full flex items-center gap-2.5 p-2 transition-all border text-left ${
                        activeStep === step.id
                          ? "bg-foreground text-background border-foreground font-bold"
                          : step.status === "completed"
                          ? "bg-muted/20 text-muted-foreground border-transparent hover:border-border"
                          : "text-muted-foreground/60 border-transparent hover:border-border/30"
                      }`}
                    >
                      <span className="text-[9px] font-bold">0{step.id + 1} //</span>
                      <span className="truncate">{step.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic step panels */}
              <div className="lg:col-span-3 space-y-4 font-mono">
                {activeStep === 0 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border border-foreground/30 p-4 bg-muted/20 glass">
                      <span className="text-[10px] text-muted-foreground">Discovery Intake Chat // Questions</span>
                      <h4 className="font-bold text-sm mt-1">Feature: Email notifications on task assignments</h4>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 border border-border glass-card">
                        <p className="font-bold text-muted-foreground">Q1: Should notifications fire for all task status updates, or only when a task is newly assigned?</p>
                        <p className="mt-1 text-foreground">&gt; Only when newly assigned or assignee changes.</p>
                      </div>
                      <div className="p-3 border border-border glass-card">
                        <p className="font-bold text-muted-foreground">Q2: Should the notification email contain task description details, or just the title and links?</p>
                        <p className="mt-1 text-foreground">&gt; Title, assignee name, and a direct link to the task workspace.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="border border-foreground/30 p-4 glass flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground">Typesafe Specification // PRD</span>
                        <h4 className="font-bold text-sm mt-1">PRD-TASK-EMAIL-NOTIF.md</h4>
                      </div>
                      <Badge className="bg-foreground text-background border-none rounded-none text-[9px] px-2 py-0.5">APPROVED</Badge>
                    </div>
                    <div className="p-4 border border-border glass-card text-[11px] h-48 overflow-y-auto leading-relaxed text-muted-foreground select-text">
                      {`# PRD: Email Notifications on Task Assignments\n\n## 1. Product Requirements\n- **FR-1**: Trigger an email to the assignee whenever a task is created with an assignee or when the assignee changes.\n- **FR-2**: Emails must contain: task name, assignee name, and direct workspace URL.\n- **FR-3**: Provide a user configuration toggle to disable email alerts.\n\n## 2. Technical Scope\n- Integrate Nodemailer service configuration.\n- Bind listeners to Prisma model hooks for \`Task\` update events.`}
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border border-foreground/30 p-4 glass">
                      <span className="text-[10px] text-muted-foreground">Granular Task Breakdown // Kanban</span>
                      <h4 className="font-bold text-sm mt-1">Tasks generated from PRD</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="border border-border p-3 glass-card">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-muted-foreground">TASK-01</span>
                          <span className="text-[9px] font-bold">TODO</span>
                        </div>
                        <p className="font-bold">Setup Mailer Service</p>
                      </div>
                      <div className="border border-foreground/40 p-3 glass">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-muted-foreground">TASK-02</span>
                          <span className="text-[9px] font-bold text-foreground">IN_PROGRESS</span>
                        </div>
                        <p className="font-bold">Bind Prisma Update Listener</p>
                      </div>
                      <div className="border border-border/40 p-3 glass opacity-60">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-muted-foreground">TASK-03</span>
                          <span className="text-[9px] line-through">DONE</span>
                        </div>
                        <p className="font-bold line-through">Create Email Toggle UI</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between glass border border-border/80 p-4">
                      <div>
                        <span className="text-[9px] text-muted-foreground block mb-0.5">Automated Compliance Review</span>
                        <h3 className="font-bold text-xs text-foreground">AI Code Review Findings</h3>
                      </div>
                      <Badge className="bg-foreground text-background rounded-none font-bold uppercase text-[9px] py-0.5 px-2">Changes Requested</Badge>
                    </div>
                    <div className="border border-border/80 glass-card font-mono text-[10px] leading-relaxed p-4 space-y-2.5">
                      <div className="text-muted-foreground border-b border-border/60 pb-2 mb-2 flex items-center justify-between">
                        <span>apps/api/src/routes/checkout.ts</span>
                        <span className="text-foreground border border-foreground/30 px-1 text-[8px] uppercase font-bold rounded-none">modified</span>
                      </div>
                      <div className="text-muted-foreground">06  export const checkoutRouter = router(&#123;</div>
                      <div className="bg-foreground/5 text-red-500 px-2 border-l-2 border-red-500">-07    createSession: publicProcedure</div>
                      <div className="bg-foreground/10 text-foreground px-2 border-l-2 border-foreground">+07    createSession: protectedProcedure // Auth Enforced</div>
                      <div className="text-muted-foreground">08      .input(z.object(&#123; planId: z.string() &#125;))</div>
                      <div className="my-3 mx-2 p-3 border-2 border-foreground glass text-xs text-foreground space-y-1">
                        <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[9px]">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>AI Audit Result // Requirement Check</span>
                        </div>
                        <p className="text-muted-foreground text-[10px] leading-relaxed">
                          ❌ Security Warning: The route lacks authentication checks, failing validation against constraint **SEC-04**.
                          Proceeding requires switching from `publicProcedure` to `protectedProcedure`.
                        </p>
                      </div>
                      <div className="text-muted-foreground">09      .query(async (&#123; input &#125;) =&gt; &#123;</div>
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border border-foreground/30 p-4 glass flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground">Production Deployment</span>
                        <h4 className="font-bold text-sm mt-1">Release Sign-off Ready</h4>
                      </div>
                      <Badge className="bg-foreground text-background border-none rounded-none text-[9px] px-2 py-0.5 font-bold animate-pulse">DEPLOY_READY</Badge>
                    </div>
                    <div className="border border-border p-5 glass-card text-center space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                        All checks passed successfully. Auto-generated release changelogs are compiled and deployment hooks are verified.
                      </p>
                      <Button className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 py-3 px-6 border border-foreground">
                        Sign-off & Deploy to Staging
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Timeline ──────────────────────────────────────────── */}
      <section id="workflow" className="px-6 py-24 border-t border-b border-border w-full relative z-10">
        {/* Glass background layer */}
        <div className="absolute inset-0 glass pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-left mb-16 max-w-xl">
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">02 // Life Cycle Steps</span>
            <h2 className="text-3xl lg:text-5xl font-black mt-3 tracking-tighter uppercase">Structured engineering flow</h2>
            <p className="text-muted-foreground font-mono text-xs mt-3">Velocity enforces atomic transitions at every step of feature implementation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative font-mono">
            {[
              { n: "01", title: "Discovery Intake", body: "Feature requests arrive via channels. The agent queries for missing details through structured questions." },
              { n: "02", title: "Generate PRD",     body: "Compiles constraints, user stories, out-of-scope criteria, and success metrics into typesafe markdown." },
              { n: "03", title: "Kanban Breakdown", body: "Parses the PRD into component-level dev tickets automatically, tracking task completion as cards." },
              { n: "04", title: "AI PR Audit",      body: "Performs inline checks against original requirements directly in the pull request diff, reporting flaws." },
              { n: "05", title: "PM Release",       body: "Requires Lead PM approval. Deploys code changes and outputs markdown release logs automatically." },
            ].map((step) => (
              <div key={step.n} className="space-y-4 border-l border-foreground/20 pl-4 py-1 glass-card p-4 hover:border-l-foreground/60 transition-all duration-300">
                <span className="text-xs font-black text-muted-foreground">[ {step.n} ]</span>
                <h3 className="font-bold text-sm uppercase tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24 max-w-6xl mx-auto w-full border-x border-border z-10 relative">
        <div className="text-left mb-16 max-w-xl">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">01 // Engine Features</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3 tracking-tighter uppercase">Built-in capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="glass-card hover:border-foreground/30 transition-all duration-500 p-6 flex flex-col justify-between h-64 font-mono group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="h-8 w-8 border border-foreground/30 flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all duration-300">
                  {card.icon}
                </div>
                <h4 className="font-bold text-base uppercase">{card.title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{card.desc}</p>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-4">{card.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-border text-center w-full relative z-10">
        <div className="absolute inset-0 glass pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-8 relative">
          <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter">Ready to ship with confidence?</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed font-mono">
            Configure your projects, write PRD plans, and let our AI compliance checker verify code changes against original goals.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="rounded-none py-6 px-10 font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 border-2 border-foreground transition-all gap-1.5 hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6 glass-nav text-xs text-muted-foreground font-mono w-full z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 Velocity. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>Powered by Turborepo & tRPC</span>
            <a
              href="http://localhost:8000/docs"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-all flex items-center gap-1"
            >
              <span>OpenAPI Spec</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
