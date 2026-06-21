"use client";

import React from "react";
import Link from "next/link";
import { 
  Zap, ArrowRight, Kanban, GitPullRequest, ShieldCheck, 
  CheckCircle2, Sparkles, Code, FileText, Lock, MessageSquare, 
  Settings, ExternalLink, Activity, AlertTriangle
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none overflow-x-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-tight">ShipFlow AI</h1>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block leading-none">Delivery Engine</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <span>API Reference</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="rounded-xl font-bold py-5 px-6 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all gap-1.5">
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
          <span>Typesafe AI-Assisted Engineering Pipeline</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
          Move features from <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">idea to production</span> in one flow.
        </h1>

        <p className="text-muted-foreground text-lg lg:text-xl max-w-3xl mb-12 leading-relaxed">
          ShipFlow AI orchestrates the entire software delivery lifecycle. Gather missing requirements, generate structured PRDs, plan engineering tickets, run automated AI PR code reviews, and ship features.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-xl py-6 px-8 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2 group">
              <span>Open Dev Dashboard</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl py-6 px-8 font-bold text-base border-border/80 hover:bg-muted/40 transition-all gap-2">
              <span>Read API Docs</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>
          </a>
        </div>
      </section>

      {/* Feature UI Pipeline Mockup preview */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="relative rounded-3xl border border-border/60 bg-card/40 p-3 lg:p-4 backdrop-blur-md shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          
          {/* Mock Browser UI */}
          <div className="rounded-2xl bg-background border border-border/50 overflow-hidden shadow-inner flex flex-col">
            {/* Header bar */}
            <div className="bg-muted/50 border-b border-border/40 p-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-red-500/20 border border-red-500/30" />
                <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                <span className="h-3.5 w-3.5 rounded-full bg-green-500/20 border border-green-500/30" />
              </div>
              <div className="px-16 py-1.5 rounded-lg bg-card/80 border border-border/30 w-96 text-center truncate">
                shipflow-app/features/stripe-checkout
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>Pipeline Sync'd</span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
              {/* Sidebar */}
              <div className="space-y-4 lg:col-span-1 border-r border-border/40 pr-6 hidden lg:block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Pipeline</span>
                <div className="space-y-3 font-semibold text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Product Discovery</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>PRD Specifications</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Kanban Planning</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Code className="h-4 w-4 text-primary animate-pulse" />
                    <span>AI PR Code Review</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg text-muted-foreground/60">
                    <Lock className="h-4 w-4" />
                    <span>Release Sign-off</span>
                  </div>
                </div>
              </div>

              {/* Diff Viewer Simulator */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between bg-muted/30 border border-border/40 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-0.5">Automated Compliance Review</span>
                    <h3 className="font-extrabold text-sm text-foreground">AI Code Review Findings</h3>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase py-0.5 px-2">Changes Requested</Badge>
                </div>

                <div className="border border-border/50 rounded-xl overflow-hidden bg-card font-mono text-[11px] leading-relaxed p-4 space-y-3 shadow-md">
                  <div className="text-muted-foreground border-b border-border/40 pb-2 mb-2 flex items-center justify-between">
                    <span>apps/api/src/routes/checkout.ts</span>
                    <span className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] uppercase font-bold text-red-500 rounded">modified</span>
                  </div>
                  
                  <div className="text-muted-foreground">06  export const checkoutRouter = router(&#123;</div>
                  <div className="bg-red-500/10 text-red-400 px-2 rounded">-07    createSession: publicProcedure</div>
                  <div className="bg-emerald-500/10 text-emerald-400 px-2 rounded">+07    createSession: protectedProcedure // Auth Enforced</div>
                  <div className="text-muted-foreground">08      .input(z.object(&#123; planId: z.string() &#125;))</div>
                  <div className="text-muted-foreground">09      .query(async (&#123; input &#125;) =&gt; &#123;</div>
                  
                  {/* Inline Warning comment card */}
                  <div className="my-3 mx-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.02] text-xs text-amber-500 space-y-1">
                    <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>AI Comment (Requirement FR-2 Security Check)</span>
                    </div>
                    <p className="text-foreground">❌ Security validation issue: This route lacks authorization checks. Any unauthenticated caller can query checkout sessions. Update the procedure to protectedProcedure.</p>
                  </div>
                  
                  <div className="text-muted-foreground">10        return stripe.createCheckoutSession(&#123; ... &#125;);</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Timeline Section */}
      <section id="workflow" className="px-6 py-24 bg-card/20 border-t border-border/40 w-full relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Life Cycle Steps</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">Structured workflow from request to prod</h2>
            <p className="text-muted-foreground text-sm mt-3">ShipFlow AI enforces atomic transitions at every step of feature implementation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shadow">1</div>
              <h3 className="font-bold text-base">Discovery & Intake</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Feature requests arrive via Email, Tickets, or Calls. The agent clarifies details with smart context questions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shadow">2</div>
              <h3 className="font-bold text-base">Generate PRD</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Compiles constraints, user stories, out-of-scope criteria, and success metrics into a typesafe markdown document.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shadow">3</div>
              <h3 className="font-bold text-base">Task Breakdown</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Parses the PRD into component-level dev tickets automatically, tracking task completion as cards.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shadow">4</div>
              <h3 className="font-bold text-base">AI Code Review</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Performs inline checkups against PRD requirements directly in the pull request diff, checking validations.
              </p>
            </div>

            {/* Step 5 */}
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shadow">5</div>
              <h3 className="font-bold text-base">PM Approval & Release</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Requires explicit Lead PM sign-off. Deploys release changes and automatically outputs markdown change summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="px-6 py-24 border-t border-border/40 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Built-in Features</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">The engine behind clean delivery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm hover:border-primary/40 transition-all p-6 space-y-3 text-left">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-lg">Context Discovery</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Asks precise follow-up questions tailored to the request complexity to secure development criteria.
            </p>
          </Card>

          {/* Card 2 */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm hover:border-primary/40 transition-all p-6 space-y-3 text-left">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-lg">Markdown PRD Writer</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generates a highly structured specifications document covering user stories, acceptance criteria, and success metrics.
            </p>
          </Card>

          {/* Card 3 */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm hover:border-primary/40 transition-all p-6 space-y-3 text-left">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
              <Kanban className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-lg">Actionable Tasks</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Splits PRD goals into separate modular engineering tasks with priorities (low, medium, high) and drag-and-drop statuses.
            </p>
          </Card>

          {/* Card 4 */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm hover:border-primary/40 transition-all p-6 space-y-3 text-left">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
              <Code className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-lg">Unified Git Diff Browser</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Displays modifications in a rich code tree, matching line changes with git diff highlights and branching.
            </p>
          </Card>

          {/* Card 5 */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm hover:border-primary/40 transition-all p-6 space-y-3 text-left">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-lg">Automated AI Code Review</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Scans pull requests for security flaws and rate-limiting issues, placing warning callouts directly on faulty code lines.
            </p>
          </Card>

          {/* Card 6 */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm hover:border-primary/40 transition-all p-6 space-y-3 text-left">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-lg">Release Celebration</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Triggers visual celebration effects on shipment, compiling automatic change notes and deployment changelogs.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="px-6 py-20 bg-muted/30 border-t border-border/40 text-center w-full relative">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Ready to ship with confidence?</h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Configure your projects, write PRD plans, and let our AI compliance checker verify code changes against original goals.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="rounded-xl py-6 px-10 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-1.5">
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-border/40 py-8 px-6 bg-card text-center text-xs text-muted-foreground font-medium w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 ShipFlow AI. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>Powered by Turborepo & tRPC</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <span>OpenAPI Specification</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
