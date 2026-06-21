"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Play, RefreshCw, Send,
  ChevronRight, Kanban, GitPullRequest, ShieldCheck, Check,
  AlertTriangle, Eye, ShieldAlert, Sparkles, Code, FileText, Lock, Terminal
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";

export default function FeaturePipeline() {
  const params = useParams();
  const router = useRouter();
  const featureId = params.id as string;
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.shipflow.getFeatureDetails.useQuery({ id: featureId });
  
  const submitAnswersMutation = trpc.shipflow.submitIntakeAnswers.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Requirements saved! PRD generated.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const forceProceedMutation = trpc.shipflow.forceProceedFeature.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Proceeding with intake questions.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const approvePrdMutation = trpc.shipflow.approvePrd.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("PRD Approved! Actionable engineering tasks created.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const updateTaskMutation = trpc.shipflow.updateTaskStatus.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
    },
    onError: (err) => {
      toast.error(`Error updating task: ${err.message}`);
    }
  });

  const initializeBranchMutation = trpc.shipflow.initializeBranch.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("GitHub branch created! Pull Request initialized.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const runAiReviewMutation = trpc.shipflow.runAiReview.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("AI Code Review completed.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const submitFixesMutation = trpc.shipflow.submitFixes.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Developer code fixes submitted! Re-reviewing...");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const approveReleaseMutation = trpc.shipflow.approveRelease.useMutation({
    onSuccess: () => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Lead reviewer approved release.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const shipFeatureMutation = trpc.shipflow.shipFeature.useMutation({
    onSuccess: (res) => {
      utils.shipflow.getFeatureDetails.invalidate({ id: featureId });
      setReleaseNotes(res.releaseNotes);
      setShowConfetti(true);
      toast.success("🎉 FEATURE SHIPPED TO PRODUCTION!");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  // State
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [prdText, setPrdText] = useState("");
  const [isEditingPrd, setIsEditingPrd] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Sync PRD content when data loads
  useEffect(() => {
    if (data?.feature?.prdContent) {
      setPrdText(data.feature.prdContent);
    }
    if (data?.pullRequest?.diffData) {
      const files = data.pullRequest.diffData as any[];
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0].filepath);
      }
    }
  }, [data, selectedFile]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground font-mono">
        <Spinner className="h-6 w-6 text-foreground" />
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold animate-pulse">Loading feature pipeline...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center bg-background text-foreground font-mono">
        <ShieldAlert className="h-10 w-10 text-foreground" />
        <h2 className="text-lg font-bold uppercase">Feature Not Found</h2>
        <Link href="/">
          <Button variant="outline" className="rounded-none border-border font-mono text-xs uppercase tracking-wider mt-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const { feature, project, tasks, pullRequest, aiReview } = data;

  const handleAnswerChange = (idx: number, val: string) => {
    const updated = [...answers];
    updated[idx] = val;
    setAnswers(updated);
  };

  const submitIntake = () => {
    submitAnswersMutation.mutate({
      featureId,
      answers,
    });
  };

  const getProgressPercentage = () => {
    switch (feature.status) {
      case "educated": return 100;
      case "intake": return 15;
      case "prd_generation": return 35;
      case "tasks_breakdown": return 55;
      case "pr_review": return 75;
      case "pr_approved": return 90;
      case "shipped": return 100;
      default: return 0;
    }
  };

  const getStepStatusIndicator = (stepName: string) => {
    const statusOrder = ["intake", "prd_generation", "tasks_breakdown", "pr_review", "pr_approved", "shipped"];
    const currentIdx = statusOrder.indexOf(feature.status);
    const stepIdx = statusOrder.indexOf(stepName);

    if (feature.status === "educated") {
      return "[x] CLSD";
    }

    if (currentIdx > stepIdx) {
      return "[x] DONE";
    } else if (currentIdx === stepIdx) {
      return "[*] ACTV";
    } else {
      return "[ ] PNDG";
    }
  };

  const getStepRowClass = (stepName: string) => {
    const statusOrder = ["intake", "prd_generation", "tasks_breakdown", "pr_review", "pr_approved", "shipped"];
    const currentIdx = statusOrder.indexOf(feature.status);
    const stepIdx = statusOrder.indexOf(stepName);

    if (currentIdx === stepIdx) {
      return "border-foreground bg-foreground/5 text-foreground font-black";
    }
    return "border-transparent text-muted-foreground/60";
  };

  const renderPrdBody = (text: string) => {
    return (
      <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4 font-mono whitespace-pre-wrap select-text text-foreground">
        {text}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-mono bg-grid-dots relative">
      {/* Confetti Banner */}
      {showConfetti && (
        <div className="w-full bg-foreground py-3 text-center text-background text-xs font-black tracking-widest flex items-center justify-center gap-2 animate-pulse">
          <Terminal className="h-4 w-4 shrink-0" />
          <span>[ RELEASE SUCCESS ] FEATURE SHIPPED TO PRODUCTION PIPELINE</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="border-b border-border bg-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${project.id}`} className="p-2 border border-border hover:border-foreground bg-background transition-all">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <span>{project.name}</span>
              <span>/</span>
              <span className="font-bold text-foreground border border-foreground/30 px-2 py-0.2 bg-background">{feature.status}</span>
            </div>
            <h1 className="font-black text-xl tracking-tight uppercase mt-1">{feature.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 bg-background border border-border py-2 px-4 text-xs">
            <span className="font-bold">Progress: {getProgressPercentage()}%</span>
            <Progress value={getProgressPercentage()} className="h-1.5 w-32 rounded-none bg-border [&>div]:bg-foreground" />
          </div>
        </div>
      </header>

      {/* Page Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Steps */}
        <aside className="w-80 border-r border-border bg-card p-6 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">// Delivery Pipeline</div>
            
            <div className="space-y-2">
              {[
                { name: "intake", label: "Discovery Intake" },
                { name: "prd_generation", label: "Requirements Spec" },
                { name: "tasks_breakdown", label: "Planning Checklist" },
                { name: "pr_review", label: "AI Code Review" },
                { name: "pr_approved", label: "Release Readiness" },
                { name: "shipped", label: "Shipped to Prod" }
              ].map((step, idx) => (
                <div key={step.name} className={`flex items-center justify-between p-2.5 border text-xs ${getStepRowClass(step.name)}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-60">0{idx + 1}</span>
                    <span>{step.label}</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono">{getStepStatusIndicator(step.name)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border border-border bg-background text-[10px] text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2 mb-1.5 text-foreground font-bold uppercase tracking-widest">
              <Terminal className="h-3.5 w-3.5 text-foreground" />
              <span>ShipFlow Engine</span>
            </div>
            <p>Monitors code paths, cross-references acceptance criteria, and blocks deployment if specs aren't fulfilled.</p>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 border-l border-border/40">
          
          {/* Phase 1: Educated Feature (Bandwidth Saved) */}
          {feature.status === "educated" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-2 border-foreground bg-foreground/[0.02] p-6 space-y-6">
                <div className="flex items-center gap-3 text-foreground border-b border-border pb-4">
                  <ShieldAlert className="h-8 w-8 shrink-0" />
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Existing offering detected</h2>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">// duplicate_avoidance_engine</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-xs leading-relaxed font-sans">
                  Our AI Delivery Engine scanned your request and detected that this capability already exists in your platform. We recommend educating the customer or team members rather than building duplicate services.
                </p>

                <div className="p-4 border border-border bg-background space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-foreground">Suggested response:</p>
                  <p className="font-mono text-xs leading-relaxed text-foreground select-text whitespace-pre-wrap">
                    {feature.educationContent}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href={`/projects/${project.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto rounded-none py-4 border-border text-xs uppercase tracking-wider font-mono">
                      Close Request (Save Bandwidth)
                    </Button>
                  </Link>
                  <Button
                    onClick={() => forceProceedMutation.mutate({ featureId })}
                    disabled={forceProceedMutation.isPending}
                    className="w-full sm:w-auto rounded-none py-4 bg-foreground text-background hover:bg-neutral-800 text-xs uppercase tracking-wider font-mono"
                  >
                    {forceProceedMutation.isPending ? "Proceeding..." : "Override & Proceed to Build Custom"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Intake - Question / Context Gathering */}
          {feature.status === "intake" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center space-y-2 border-b border-border pb-6">
                <Terminal className="h-8 w-8 mx-auto text-foreground animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-tight">Requirement Discovery</h2>
                <p className="text-muted-foreground text-xs font-sans max-w-md mx-auto">
                  Provide clarifications on the items below. The engine will compile your answers into a typesafe spec sheet.
                </p>
              </div>

              <div className="border border-border bg-card p-6 space-y-6">
                <div className="space-y-2 border-b border-border pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">// Customer Request Source</span>
                  <div className="p-4 border border-border bg-background text-xs leading-relaxed text-muted-foreground select-text font-sans">
                    "{feature.description}"
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <span>Clarifications Required</span>
                  </div>

                  {(feature.missingContext as any[]).map((ctx, idx) => (
                    <div key={idx} className="space-y-2">
                      <label htmlFor={`q-${idx}`} className="text-xs font-bold text-foreground leading-normal block">
                        [ Q0{idx + 1} ] {ctx.question}
                      </label>
                      <Input
                        id={`q-${idx}`}
                        placeholder="Type response parameters..."
                        value={answers[idx]}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        className="rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-xs py-5 font-mono"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <Button
                    onClick={submitIntake}
                    disabled={submitAnswersMutation.isPending}
                    className="gap-2 rounded-none py-5 px-6 bg-foreground text-background hover:bg-neutral-800 text-xs uppercase tracking-widest font-mono"
                  >
                    {submitAnswersMutation.isPending ? "Generating PRD..." : "Submit Answers & Generate PRD"}
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: PRD Review & Approval */}
          {feature.status === "prd_generation" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Structured PRD Review</h2>
                  <p className="text-muted-foreground text-xs font-sans mt-0.5">Review, refine, and sign-off the product requirements documentation.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingPrd(!isEditingPrd)}
                  className="rounded-none border-border text-xs uppercase tracking-wider font-mono self-start sm:self-center"
                >
                  {isEditingPrd ? "Cancel Edit" : "Edit Specification"}
                </Button>
              </div>

              <div className="border border-border bg-card overflow-hidden">
                <div className="p-6 bg-card border-b border-border/60">
                  {isEditingPrd ? (
                    <Textarea
                      value={prdText}
                      onChange={(e) => setPrdText(e.target.value)}
                      className="min-h-[500px] font-mono text-xs leading-relaxed rounded-none border-border bg-background focus:ring-0 focus:border-foreground"
                    />
                  ) : (
                    renderPrdBody(prdText)
                  )}
                </div>
                
                <div className="p-6 bg-background flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-[10px] text-muted-foreground font-mono leading-relaxed max-w-md">// Validate scope boundaries, metrics, and technical dependencies prior to signing off.</span>
                  <Button
                    onClick={() => approvePrdMutation.mutate({ featureId, prdContent: prdText })}
                    disabled={approvePrdMutation.isPending}
                    className="gap-2 rounded-none py-5 px-6 bg-foreground text-background hover:bg-neutral-800 text-xs uppercase tracking-widest font-mono shrink-0"
                  >
                    {approvePrdMutation.isPending ? "Generating Tasks..." : "Approve PRD & Break down tasks"}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 4: Tasks Breakdown & Planning */}
          {feature.status === "tasks_breakdown" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Engineering Planning</h2>
                  <p className="text-muted-foreground text-xs font-sans mt-0.5">The PRD requirements have been mapped to component-level developer tickets.</p>
                </div>
                <Button
                  onClick={() => initializeBranchMutation.mutate({ featureId })}
                  disabled={initializeBranchMutation.isPending}
                  className="gap-2 rounded-none py-5 px-6 bg-foreground text-background hover:bg-neutral-800 text-xs uppercase tracking-widest font-mono shrink-0 self-start sm:self-center"
                >
                  {initializeBranchMutation.isPending ? "Initializing Branch..." : "Initialize Branch & Pull Request"}
                  <GitPullRequest className="h-4 w-4" />
                </Button>
              </div>

              {/* Kanban-like list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                {/* To Do */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground">01 / To Do</span>
                    <span className="border border-border/80 px-2 py-0.5 text-[10px] text-muted-foreground">{tasks.filter(t => t.status === "todo").length}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === "todo").map(t => (
                      <div key={t.id} className="border border-border bg-card p-4 space-y-3 relative group hover:border-foreground transition-all">
                        <div className="flex items-center justify-between">
                          <span className={`border px-1.5 py-0.2 text-[9px] uppercase font-bold ${
                            t.priority === "high" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                          }`}>
                            {t.priority}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "in_progress" })}
                            className="h-5 w-5 rounded-none border border-border hover:border-foreground hover:bg-foreground hover:text-background text-muted-foreground"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-xs uppercase text-foreground leading-tight">{t.title}</h4>
                        <p className="text-muted-foreground text-[10px] font-sans leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                    <span className="font-bold uppercase tracking-wider text-foreground">02 / In Progress</span>
                    <span className="border border-foreground px-2 py-0.5 text-[10px] text-foreground font-bold">{tasks.filter(t => t.status === "in_progress").length}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === "in_progress").map(t => (
                      <div key={t.id} className="border border-foreground bg-foreground/[0.02] p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="border border-foreground bg-foreground text-background px-1.5 py-0.2 text-[9px] uppercase font-bold">
                            {t.priority}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "todo" })}
                              className="h-5 w-5 rounded-none border border-border hover:border-foreground hover:bg-foreground hover:text-background text-muted-foreground"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "done" })}
                              className="h-5 w-5 rounded-none border border-foreground hover:bg-foreground hover:text-background text-foreground"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <h4 className="font-bold text-xs uppercase text-foreground leading-tight">{t.title}</h4>
                        <p className="text-muted-foreground text-[10px] font-sans leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Done */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground/60">03 / Done</span>
                    <span className="border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground/60">{tasks.filter(t => t.status === "done").length}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === "done").map(t => (
                      <div key={t.id} className="border border-border/40 bg-muted/10 p-4 space-y-3 relative opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="border border-border/40 text-muted-foreground/60 px-1.5 py-0.2 text-[9px] uppercase font-bold">
                            {t.priority}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "in_progress" })}
                            className="h-5 w-5 rounded-none border border-border/40 hover:border-foreground hover:bg-foreground hover:text-background text-muted-foreground/60"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-xs uppercase text-muted-foreground/60 line-through leading-tight">{t.title}</h4>
                        <p className="text-muted-foreground text-[10px] font-sans line-through leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 5: Code Diff & AI PR Review */}
          {feature.status === "pr_review" && pullRequest && (
            <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="rounded-none border-foreground bg-foreground text-background text-[9px] uppercase font-bold py-0.5 px-2.5">
                      <GitPullRequest className="h-3 w-3 shrink-0" />
                      <span>PR #{feature.prNumber}</span>
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Branch: {feature.branchName}</span>
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{pullRequest.title}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!aiReview ? (
                    <Button
                      onClick={() => runAiReviewMutation.mutate({ featureId })}
                      disabled={runAiReviewMutation.isPending}
                      className="gap-2 rounded-none py-5 px-6 bg-foreground text-background hover:bg-neutral-800 text-xs uppercase tracking-widest font-mono"
                    >
                      {runAiReviewMutation.isPending ? "Running Audit..." : "Run AI Code Review"}
                      <Sparkles className="h-3.5 w-3.5 text-background" />
                    </Button>
                  ) : aiReview.status === "changes_requested" ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => submitFixesMutation.mutate({ featureId })}
                        disabled={submitFixesMutation.isPending}
                        className="gap-1.5 rounded-none border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background font-bold py-5 px-4"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Submit Code Fixes</span>
                      </Button>
                      <Button
                        onClick={() => runAiReviewMutation.mutate({ featureId })}
                        disabled={runAiReviewMutation.isPending}
                        className="rounded-none border border-border bg-card py-5 px-3 hover:border-foreground"
                      >
                        Re-review
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => approveReleaseMutation.mutate({ featureId })}
                      disabled={approveReleaseMutation.isPending}
                      className="gap-1.5 rounded-none bg-foreground text-background hover:bg-neutral-800 font-bold py-5 px-6 border border-foreground"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Approve Release</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* AI Report Card */}
              {aiReview && (
                <div className={`border-2 p-5 ${
                  aiReview.status === "changes_requested" 
                    ? "border-foreground bg-foreground/[0.01]" 
                    : "border-foreground bg-foreground/5"
                }`}>
                  <div className="flex items-start gap-3 mb-4">
                    {aiReview.status === "changes_requested" ? (
                      <AlertCircle className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider">// AI Audit Report Summary</h3>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest block mt-0.5">Status: {aiReview.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed font-sans select-text">
                    {aiReview.summary}
                  </p>
                </div>
              )}

              {/* Code Diff Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Files Tree */}
                <div className="space-y-2 lg:col-span-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">// Changed Files</div>
                  {(pullRequest.diffData as any[]).map((f) => (
                    <button
                      key={f.filepath}
                      onClick={() => setSelectedFile(f.filepath)}
                      className={`w-full text-left p-3 rounded-none text-[10px] font-mono flex items-center justify-between border transition-all ${
                        selectedFile === f.filepath
                          ? "bg-foreground text-background border-foreground font-bold"
                          : "text-muted-foreground hover:bg-card border-transparent hover:border-border"
                      }`}
                    >
                      <span className="truncate">{f.filepath}</span>
                      <span className={`h-1.5 w-1.5 rounded-none shrink-0 ${f.status === "added" ? "bg-foreground" : "bg-muted-foreground"}`} />
                    </button>
                  ))}
                </div>

                {/* Diff Viewer */}
                <div className="lg:col-span-3 space-y-4">
                  {(pullRequest.diffData as any[]).filter(f => f.filepath === selectedFile).map((f) => {
                    const commentsForFile = aiReview?.comments 
                      ? (aiReview.comments as any[]).filter(c => c.filepath === selectedFile)
                      : [];

                    return (
                      <div key={f.filepath} className="border border-border bg-card overflow-hidden">
                        <div className="bg-muted/60 px-4 py-2.5 border-b border-border/80 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span>{f.filepath}</span>
                          <span className="uppercase text-[9px] font-bold border border-border/60 bg-background px-2 py-0.5">{f.status}</span>
                        </div>
                        <div className="p-4 bg-background font-mono text-[10px] overflow-x-auto whitespace-pre leading-relaxed select-text space-y-1.5">
                          {f.diff.split("\n").map((line: string, idx: number) => {
                            const isAdded = line.startsWith("+");
                            const isRemoved = line.startsWith("-");
                            
                            const matchedComment = commentsForFile.find(c => {
                              if (selectedFile === "apps/api/src/routes/feature.ts") {
                                if (c.line === 9 && (line.includes("getConfig") || line.includes("protectedProcedure"))) return true;
                                if (c.line === 10 && (line.includes("rateLimiter") || line.includes("enabled: true"))) return true;
                              }
                              return false;
                            });

                            return (
                              <React.Fragment key={idx}>
                                <div className={`px-2 py-0.5 flex gap-4 ${
                                  isAdded ? "bg-foreground/5 text-foreground border-l-2 border-foreground" :
                                  isRemoved ? "bg-muted text-muted-foreground/60 border-l-2 border-muted-foreground/30" : ""
                                }`}>
                                  <span className="w-6 shrink-0 text-muted-foreground/50 select-none text-right">{idx + 1}</span>
                                  <span>{line}</span>
                                </div>

                                {matchedComment && (
                                  <div className="my-3 mx-6 p-4 border-2 border-foreground bg-card text-xs leading-relaxed text-foreground space-y-1.5">
                                    <div className="font-bold flex items-center gap-1.5 text-[9px] uppercase tracking-wider">
                                      <AlertTriangle className="h-4 w-4 text-foreground" />
                                      <span>[ AI CODE AUDIT FINDINGS // {matchedComment.requirementId} ]</span>
                                    </div>
                                    <p className="text-muted-foreground text-[10.5px] font-sans leading-relaxed">{matchedComment.text}</p>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Phase 6: Release & Shipped Celebration */}
          {(feature.status === "pr_approved" || feature.status === "shipped") && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in font-mono text-xs">
              <div className="text-center space-y-2 border-b border-border pb-6">
                {feature.status === "shipped" ? (
                  <div className="h-12 w-12 border border-foreground bg-foreground text-background flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Check className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="h-12 w-12 border border-foreground bg-card text-foreground flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                )}
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {feature.status === "shipped" ? "Feature Shipped Successfully" : "Reviewer PM Sign-off"}
                </h2>
                <p className="text-muted-foreground text-xs font-sans max-w-sm mx-auto">
                  {feature.status === "shipped" 
                    ? "The feature has passed all pipeline audits and is active in production." 
                    : "The pull request successfully compiled and is ready for release."}
                </p>
              </div>

              <div className="border border-border bg-card overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">// Release Checklist Verification</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border border-border p-3 bg-background">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-foreground" />
                        <span>Product Specification Document (PRD)</span>
                      </span>
                      <span className="font-bold text-[10px] uppercase text-foreground bg-background px-2 py-0.5 border border-border">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between border border-border p-3 bg-background">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Kanban className="h-4 w-4 text-foreground" />
                        <span>Engineering Sub-tasks (100% Done)</span>
                      </span>
                      <span className="font-bold text-[10px] uppercase text-foreground bg-background px-2 py-0.5 border border-border">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between border border-border p-3 bg-background">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Code className="h-4 w-4 text-foreground" />
                        <span>AI Code Review Compliance Checks</span>
                      </span>
                      <span className="font-bold text-[10px] uppercase text-foreground bg-background px-2 py-0.5 border border-border">PASSED</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-4 border-t border-border bg-background">
                  {feature.status === "shipped" ? (
                    <div className="space-y-3">
                      <h4 className="font-bold text-[10px] uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Terminal className="h-4 w-4 text-foreground" />
                        <span>Auto-Generated Release Notes</span>
                      </h4>
                      <div className="bg-card p-4 border border-border text-xs leading-relaxed text-muted-foreground select-text font-mono whitespace-pre-wrap">
                        {releaseNotes || feature.prdContent ? `## Released: ${feature.title}\n\nAll tasks verified. Secure configurations with rate-limiters deployed.` : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed text-muted-foreground flex items-start gap-3 p-4 border border-border bg-card">
                      <Lock className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-foreground text-[10px] uppercase tracking-wider">Formal PM Release Authorization</p>
                        <p className="font-sans text-xs">Verify that staging outputs conform to original specification docs before proceeding with the production merge.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border bg-card">
                  {feature.status === "shipped" ? (
                    <Link href={`/projects/${project.id}`} className="w-full block">
                      <Button className="w-full rounded-none py-5 font-bold uppercase text-xs tracking-widest bg-foreground text-background hover:bg-neutral-800">
                        Back to Workspace
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => shipFeatureMutation.mutate({ featureId })}
                      disabled={shipFeatureMutation.isPending}
                      className="w-full rounded-none py-5 font-bold uppercase text-xs tracking-widest bg-foreground text-background hover:bg-neutral-800 border-2 border-foreground"
                    >
                      {shipFeatureMutation.isPending ? "Deploying Release..." : "Sign-off & Deploy to Production"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
