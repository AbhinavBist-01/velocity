"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight, Kanban, GitPullRequest, ShieldCheck,
  Sparkles, Code, FileText, MessageSquare,
  ExternalLink, AlertTriangle, Terminal, Sun, Moon, GitBranch, Zap
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

/* ─────────────────────────────────────────────────────────────────────────
   Theme Toggle Button
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
        className="relative h-9 w-9 flex items-center justify-center border border-foreground/15 hover:border-foreground/40 transition-all duration-200"
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
      className="relative h-9 w-9 flex items-center justify-center border border-foreground/15 hover:border-foreground/50 transition-all duration-200 overflow-hidden group"
    >
      <span key={animKey} className="theme-icon-enter relative z-10">
        {isDark ? (
          <Moon className="h-[15px] w-[15px] text-foreground" strokeWidth={1.5} />
        ) : (
          <Sun className="h-[15px] w-[15px] text-foreground" strokeWidth={1.5} />
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
    {
      icon: <MessageSquare className="h-[18px] w-[18px]" />,
      title: "Context Discovery",
      desc: "Asks precise follow-up questions tailored to the request complexity to secure development criteria.",
      tag: "STEP_01",
      wide: true,
    },
    {
      icon: <FileText className="h-[18px] w-[18px]" />,
      title: "PRD Generation",
      desc: "Generates a highly structured specifications document covering user stories, acceptance criteria and metrics.",
      tag: "STEP_02",
      wide: false,
    },
    {
      icon: <Kanban className="h-[18px] w-[18px]" />,
      title: "Actionable Tasks",
      desc: "Splits PRD goals into separate modular engineering tasks with priorities and drag-and-drop statuses.",
      tag: "STEP_03",
      wide: false,
    },
    {
      icon: <Code className="h-[18px] w-[18px]" />,
      title: "Diff Browser",
      desc: "Displays modifications in a rich code tree, matching line changes with git diff highlights.",
      tag: "STEP_04",
      wide: false,
    },
    {
      icon: <ShieldCheck className="h-[18px] w-[18px]" />,
      title: "Automated Audit",
      desc: "Scans pull requests for security flaws and rate-limiting issues, placing callouts on faulty code lines.",
      tag: "STEP_05",
      wide: false,
    },
    {
      icon: <Sparkles className="h-[18px] w-[18px]" />,
      title: "Release Automation",
      desc: "Triggers deployment pipelines on shipment, compiling automatic change notes and deployment changelogs.",
      tag: "STEP_06",
      wide: true,
    },
  ];

  const workflowSteps = [
    { n: "01", title: "Discovery Intake", body: "Feature requests arrive via channels. The agent queries for missing details through structured questions." },
    { n: "02", title: "Generate PRD",     body: "Compiles constraints, user stories, out-of-scope criteria, and success metrics into typesafe markdown." },
    { n: "03", title: "Kanban Breakdown", body: "Parses the PRD into component-level dev tickets automatically, tracking task completion as cards." },
    { n: "04", title: "AI PR Audit",      body: "Performs inline checks against original requirements directly in the pull request diff, reporting flaws." },
    { n: "05", title: "PM Release",       body: "Requires Lead PM approval. Deploys code changes and outputs markdown release logs automatically." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none overflow-x-hidden relative">

      {/* Subtle dot grid across whole page */}
      <div className="fixed inset-0 bg-grid-dots opacity-40 pointer-events-none z-0" />

      {/* Hero ambient */}
      <div className="hero-glow pointer-events-none fixed inset-0 z-0" />

      {/* Top accent rule */}
      <div className="w-full h-[2px] bg-foreground relative z-10" />

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="glass-nav sticky top-0 z-50 px-6 lg:px-10 py-0 h-14 flex items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 bg-foreground text-background flex items-center justify-center font-black text-xs tracking-tighter shrink-0 group-hover:opacity-80 transition-opacity">
              VL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold">Velocity</span>
                <span className="text-[9px] font-mono border border-foreground/20 px-1.5 leading-none uppercase text-muted-foreground py-0.5">v1.0</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono tracking-widest block leading-none mt-0.5">Delivery Engine</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-mono tracking-wider uppercase text-muted-foreground">
            <a href="#features" className="underline-grow hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#workflow" className="underline-grow hover:text-foreground transition-colors duration-200">Workflow</a>
            <a
              href="http://localhost:8000/docs"
              target="_blank" rel="noopener noreferrer"
              className="underline-grow hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
            >
              <span>API Ref</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button className="rounded-none font-mono text-[11px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 h-9 px-5 border border-foreground gap-1.5 transition-all">
                <span>Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center pt-28 pb-24 lg:pt-36 lg:pb-32 px-6 max-w-6xl mx-auto w-full border-x border-foreground/8">

        {/* Status pill */}
        <div className="animate-fade-up inline-flex items-center gap-2.5 px-4 py-2 border border-foreground/15 bg-foreground/[0.03] text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-12">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground animate-pulse shrink-0" />
          <span>Pipeline Online · Build: Stable</span>
        </div>

        {/* Headline — the signature typographic statement */}
        <h1 className="animate-fade-up-1 text-[clamp(3rem,10vw,7.5rem)] font-black tracking-[-0.04em] leading-[0.88] uppercase text-foreground mb-8 max-w-4xl">
          Move features<br />
          <span className="text-foreground/35">from idea</span><br />
          to prod.
        </h1>

        {/* Thin rule — second-read moment */}
        <div className="animate-fade-up-2 w-24 h-[1px] bg-foreground/30 mb-8" />

        <p className="animate-fade-up-2 text-muted-foreground text-base lg:text-lg max-w-2xl mb-12 leading-relaxed font-sans font-normal">
          Velocity orchestrates the entire software delivery lifecycle —
          from requirement gathering and PRD generation to AI PR audits and automated releases.
        </p>

        <div className="animate-fade-up-3 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-none h-12 px-8 font-mono text-[11px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 border border-foreground transition-all gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-none h-12 px-8 font-mono text-[11px] uppercase tracking-widest border border-foreground/30 hover:border-foreground hover:bg-foreground/5 transition-all gap-2 text-muted-foreground hover:text-foreground"
            >
              <span>Read API Docs</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </a>
        </div>

        {/* Corner labels — engineering blueprint detail */}
        <div className="absolute left-5 bottom-6 text-[9px] font-mono text-foreground/20 uppercase tracking-widest hidden lg:block">
          SYS // ENG_PIPELINE_ACTIVE
        </div>
        <div className="absolute right-5 bottom-6 text-[9px] font-mono text-foreground/20 uppercase tracking-widest hidden lg:block">
          LOC // VELOCITY_MONOREPO
        </div>
      </section>

      {/* ── Interactive Pipeline Mockup ────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-16 max-w-6xl mx-auto w-full border-x border-t border-foreground/8">
        <div className="code-surface overflow-hidden">
          {/* Terminal chrome bar */}
          <div className="border-b border-foreground/10 px-5 py-3 flex items-center justify-between bg-foreground/[0.02]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/10 border border-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/10 border border-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/10 border border-foreground/10" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground ml-2 hidden sm:block">velocity-app/features/stripe-checkout</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <Terminal className="h-3 w-3" />
              <span className="terminal-cursor">PIPELINE_SYNCED</span>
            </div>
          </div>

          {/* Workspace body */}
          <div className="p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Pipeline sidebar */}
            <div className="space-y-1 lg:col-span-1 lg:border-r border-foreground/8 lg:pr-6 hidden lg:block">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground block mb-3 px-2">
                Delivery Pipeline
              </span>
              {pipelineSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 transition-all text-left border ${
                    activeStep === step.id
                      ? "bg-foreground text-background border-foreground font-bold"
                      : step.status === "completed"
                      ? "text-muted-foreground border-transparent hover:border-foreground/15 hover:bg-foreground/3"
                      : "text-muted-foreground/40 border-transparent"
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold shrink-0 opacity-60">0{step.id + 1}</span>
                  <span className="text-xs font-sans truncate">{step.title}</span>
                </button>
              ))}
            </div>

            {/* Dynamic content panel */}
            <div className="lg:col-span-3 space-y-4 font-mono min-h-[280px]">
              {activeStep === 0 && (
                <div className="space-y-4 animate-fade-up">
                  <div className="border border-foreground/10 px-4 py-3 bg-foreground/[0.02]">
                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Discovery Intake Chat</span>
                    <h4 className="font-bold text-sm mt-1 font-sans">Feature: Email notifications on task assignments</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { q: "Should notifications fire for all task status updates, or only when a task is newly assigned?", a: "> Only when newly assigned or assignee changes." },
                      { q: "Should the notification email contain task description details, or just the title and links?", a: "> Title, assignee name, and a direct link to the task workspace." },
                    ].map((qa, i) => (
                      <div key={i} className="px-4 py-3 border border-foreground/8 bg-foreground/[0.015]">
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{qa.q}</p>
                        <p className="mt-1.5 text-foreground text-[11px]">{qa.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3 animate-fade-up">
                  <div className="border border-foreground/10 px-4 py-3 bg-foreground/[0.02] flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Typesafe Specification // PRD</span>
                      <h4 className="font-bold text-sm mt-0.5 font-sans">PRD-TASK-EMAIL-NOTIF.md</h4>
                    </div>
                    <Badge className="bg-foreground text-background border-none rounded-none text-[9px] px-2 py-0.5 font-mono">APPROVED</Badge>
                  </div>
                  <div className="px-4 py-4 border border-foreground/8 bg-foreground/[0.015] text-[11px] h-52 overflow-y-auto leading-relaxed text-muted-foreground select-text">
                    {`# PRD: Email Notifications on Task Assignments\n\n## 1. Product Requirements\n- FR-1: Trigger an email to the assignee whenever a task is created with an assignee or when the assignee changes.\n- FR-2: Emails must contain: task name, assignee name, and direct workspace URL.\n- FR-3: Provide a user configuration toggle to disable email alerts.\n\n## 2. Technical Scope\n- Integrate Nodemailer service configuration.\n- Bind listeners to Prisma model hooks for Task update events.`}
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4 animate-fade-up">
                  <div className="border border-foreground/10 px-4 py-3 bg-foreground/[0.02]">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Granular Task Breakdown</span>
                    <h4 className="font-bold text-sm mt-0.5 font-sans">Tasks generated from PRD</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {[
                      { id: "TASK-01", status: "TODO", title: "Setup Mailer Service", dim: false, done: false },
                      { id: "TASK-02", status: "IN PROGRESS", title: "Bind Prisma Update Listener", dim: false, done: false },
                      { id: "TASK-03", status: "DONE", title: "Create Email Toggle UI", dim: true, done: true },
                    ].map((t) => (
                      <div key={t.id} className={`border border-foreground/10 px-3 py-3 bg-foreground/[0.015] ${t.dim ? "opacity-50" : ""}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] text-muted-foreground font-mono">{t.id}</span>
                          <span className={`text-[9px] font-bold font-mono ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.status}</span>
                        </div>
                        <p className={`font-bold text-xs font-sans ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4 animate-fade-up">
                  <div className="flex items-center justify-between border border-foreground/10 px-4 py-3 bg-foreground/[0.02]">
                    <div>
                      <span className="text-[9px] text-muted-foreground block mb-0.5 uppercase tracking-wider">Automated Compliance Review</span>
                      <h3 className="font-bold text-sm font-sans">AI Code Review Findings</h3>
                    </div>
                    <Badge className="bg-foreground text-background rounded-none font-bold uppercase text-[9px] py-0.5 px-2 font-mono">Changes Requested</Badge>
                  </div>
                  <div className="border border-foreground/8 text-[11px] leading-relaxed">
                    <div className="px-4 py-2 border-b border-foreground/8 text-muted-foreground flex items-center justify-between bg-foreground/[0.01]">
                      <span>apps/api/src/routes/checkout.ts</span>
                      <span className="border border-foreground/20 px-1.5 py-0.5 text-[9px] uppercase font-bold">modified</span>
                    </div>
                    <div className="px-4 py-3 space-y-0.5 bg-foreground/[0.015]">
                      <div className="text-muted-foreground py-0.5">06  export const checkoutRouter = router(&#123;</div>
                      <div className="bg-red-500/8 text-red-500 px-2 py-0.5 border-l-2 border-red-500">-07    createSession: publicProcedure</div>
                      <div className="bg-foreground/5 text-foreground px-2 py-0.5 border-l-2 border-foreground">+07    createSession: protectedProcedure <span className="text-muted-foreground">// Auth Enforced</span></div>
                      <div className="text-muted-foreground py-0.5">08      .input(z.object(&#123; planId: z.string() &#125;))</div>
                      <div className="mt-3 mx-0 p-3 border-2 border-foreground/20 bg-foreground/3 text-foreground space-y-1.5">
                        <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[9px]">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>AI Audit — Requirement Check // SEC-04</span>
                        </div>
                        <p className="text-muted-foreground text-[10px] leading-relaxed font-sans font-normal">
                          Security warning: this route lacks authentication checks, failing constraint SEC-04.
                          Switch from <code className="text-foreground">publicProcedure</code> to <code className="text-foreground">protectedProcedure</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4 animate-fade-up">
                  <div className="border border-foreground/10 px-4 py-3 bg-foreground/[0.02] flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Production Deployment</span>
                      <h4 className="font-bold text-sm mt-0.5 font-sans">Release Sign-off Ready</h4>
                    </div>
                    <Badge className="bg-foreground text-background border-none rounded-none text-[9px] px-2 py-0.5 font-mono animate-pulse">DEPLOY_READY</Badge>
                  </div>
                  <div className="border border-foreground/8 px-6 py-8 bg-foreground/[0.015] text-center space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto font-sans font-normal">
                      All checks passed. Auto-generated release changelogs are compiled and deployment hooks are verified.
                    </p>
                    <Button className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 h-10 px-7 border border-foreground">
                      Sign-off & Deploy to Staging
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Timeline ──────────────────────────────────────────── */}
      <section id="workflow" className="relative z-10 px-6 lg:px-10 py-28 border-t border-foreground/8 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="mb-20">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.14em] flex items-center gap-2 mb-4">
              <span className="inline-block w-5 h-[1px] bg-muted-foreground/40" />
              02 // Life Cycle Steps
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-[-0.04em] uppercase text-foreground max-w-lg leading-[0.9]">
              Structured<br />engineering<br />flow.
            </h2>
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-foreground/8">
            {workflowSteps.map((step, i) => (
              <div
                key={step.n}
                className="bg-background p-6 lg:p-7 group hover:bg-foreground/[0.02] transition-colors duration-200 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <span className="text-[11px] font-mono font-black text-foreground/25 block mb-5">[{step.n}]</span>
                  <h3 className="font-bold text-sm uppercase tracking-tight font-sans mb-3 group-hover:text-foreground transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed font-sans font-normal">{step.body}</p>
                </div>
                <div className="mt-5 w-6 h-[1px] bg-foreground/20 group-hover:w-12 group-hover:bg-foreground/60 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 lg:px-10 py-28 border-t border-foreground/8 max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="mb-20">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.14em] flex items-center gap-2 mb-4">
            <span className="inline-block w-5 h-[1px] bg-muted-foreground/40" />
            01 // Engine Features
          </span>
          <h2 className="text-4xl lg:text-6xl font-black tracking-[-0.04em] uppercase text-foreground max-w-xl leading-[0.9]">
            Built-in<br />capabilities.
          </h2>
        </div>

        {/* Bento grid — gapless except for hairline borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/8">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className={`bg-background group hover:bg-foreground/[0.025] transition-colors duration-200 p-7 flex flex-col justify-between min-h-[200px] ${card.wide ? "lg:col-span-2" : ""}`}
            >
              <div className="space-y-4">
                {/* Icon */}
                <div className="h-9 w-9 border border-foreground/12 flex items-center justify-center text-muted-foreground group-hover:border-foreground/40 group-hover:text-foreground transition-all duration-200">
                  {card.icon}
                </div>
                <div>
                  <h4 className="font-bold text-base uppercase tracking-tight font-sans text-foreground mb-2">{card.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-sans font-normal">{card.desc}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[9px] font-mono text-foreground/25 uppercase tracking-[0.12em]">// {card.tag}</span>
                <div className="w-0 h-[1px] bg-foreground/30 group-hover:w-8 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-36 border-t border-foreground/8 text-center w-full">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.14em]">
              // START SHIPPING
            </span>
            <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-[-0.04em] leading-[0.88] text-foreground">
              Ready to<br />
              <span className="text-foreground/30">ship with</span><br />
              confidence?
            </h2>
          </div>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed font-sans font-normal">
            Configure projects, write PRD plans, and let the AI compliance checker verify code changes against original goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="rounded-none h-12 px-10 font-mono text-[11px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 border border-foreground transition-all gap-2 group"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-foreground/8 py-7 px-6 lg:px-10 w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-foreground text-background flex items-center justify-center font-black text-[9px] tracking-tighter shrink-0">
              VL
            </div>
            <span className="text-xs text-muted-foreground font-mono">© 2026 Velocity. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8 text-[11px] font-mono text-muted-foreground">
            <span>Turborepo · tRPC · Prisma</span>
            <a
              href="http://localhost:8000/docs"
              target="_blank" rel="noopener noreferrer"
              className="underline-grow hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <span>OpenAPI Spec</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
