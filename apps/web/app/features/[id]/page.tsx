"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Play, RefreshCw, Send,
  ChevronRight, Kanban, GitPullRequest, ShieldCheck, Check,
  AlertTriangle, Eye, ShieldAlert, Sparkles, Code, FileText, Lock
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading feature pipeline...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Feature Not Found</h2>
        <Link href="/">
          <Button variant="outline" className="gap-2 rounded-xl mt-2">
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

  const getStepStatusClass = (stepName: string) => {
    const statusOrder = ["intake", "prd_generation", "tasks_breakdown", "pr_review", "pr_approved", "shipped"];
    const currentIdx = statusOrder.indexOf(feature.status);
    const stepIdx = statusOrder.indexOf(stepName);

    if (feature.status === "educated") {
      return "text-muted-foreground";
    }

    if (currentIdx > stepIdx) {
      return "border-emerald-500 text-emerald-500 bg-emerald-500/10";
    } else if (currentIdx === stepIdx) {
      return "border-primary text-primary bg-primary/10 font-bold ring-2 ring-primary/20 animate-pulse";
    } else {
      return "border-border text-muted-foreground bg-muted/40";
    }
  };

  // Helper to render PRD markup cleanly
  const renderPrdBody = (text: string) => {
    return (
      <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4 font-mono whitespace-pre-wrap select-text">
        {text}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Confetti Banner */}
      {showConfetti && (
        <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-center text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="h-5 w-5 text-yellow-300" />
          <span>CELEBRATION: FEATURE SUCCESSFULLY SHIPPED TO PRODUCTION!</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="border-b border-border/60 bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${project.id}`} className="p-2 hover:bg-muted rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{project.name}</span>
              <span className="text-muted-foreground text-xs font-semibold">/</span>
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">{feature.status}</span>
            </div>
            <h1 className="font-extrabold text-xl tracking-tight mt-0.5">{feature.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 bg-muted/50 border border-border/40 py-1.5 px-4 rounded-xl text-xs font-medium">
            <span>Progress: {getProgressPercentage()}%</span>
            <Progress value={getProgressPercentage()} className="h-2 w-32" />
          </div>
        </div>
      </header>

      {/* Page Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Steps */}
        <aside className="w-80 border-r border-border bg-card p-6 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Pipeline</div>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold ${getStepStatusClass("intake")}`}>
                  {feature.status === "educated" || getProgressPercentage() > 15 ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">Product Discovery</h3>
                  <span className="text-[11px] text-muted-foreground">Gather Context</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold ${getStepStatusClass("prd_generation")}`}>
                  {getProgressPercentage() > 35 ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">Requirements (PRD)</h3>
                  <span className="text-[11px] text-muted-foreground">Approve document</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold ${getStepStatusClass("tasks_breakdown")}`}>
                  {getProgressPercentage() > 55 ? <Check className="h-4 w-4" /> : "3"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">Tasks & Planning</h3>
                  <span className="text-[11px] text-muted-foreground">Engineering tickets</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold ${getStepStatusClass("pr_review")}`}>
                  {getProgressPercentage() > 75 ? <Check className="h-4 w-4" /> : "4"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">AI PR Code Review</h3>
                  <span className="text-[11px] text-muted-foreground">Automated checks</span>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 items-start">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold ${getStepStatusClass("pr_approved")}`}>
                  {getProgressPercentage() > 90 ? <Check className="h-4 w-4" /> : "5"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">Release & Ship</h3>
                  <span className="text-[11px] text-muted-foreground">Lead PM approval</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1.5 text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-spin" />
              <span>ShipFlow AI Active</span>
            </div>
            <p className="leading-relaxed">Platform tracks intake source, checks existing offerings, breaks down PRD requirements, and runs inline AI review checks.</p>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {/* Phase 1: Educated Feature (Bandwidth Saved) */}
          {feature.status === "educated" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="border-amber-500/40 bg-amber-500/[0.02] rounded-2xl shadow-lg">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3 mb-4 text-amber-500">
                    <ShieldAlert className="h-8 w-8 animate-pulse" />
                    <CardTitle className="text-2xl font-bold">Existing offering detected</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    Our AI Delivery Engine scanned your request and detected that this capability already exists in your platform! We recommend educating the customer or team members rather than building duplicate services.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-4 bg-muted/30 border-y border-border/40 text-base leading-relaxed text-muted-foreground">
                  <p className="font-bold text-foreground mb-1">Educate Response Suggestion:</p>
                  <p className="bg-card p-4 rounded-xl border border-border/60 text-foreground font-mono text-sm leading-normal">
                    {feature.educationContent}
                  </p>
                </CardContent>
                <CardFooter className="p-6 flex flex-col sm:flex-row gap-3">
                  <Link href={`/projects/${project.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto rounded-xl py-4 border-border/80">
                      Close Request (Bandwidth Saved)
                    </Button>
                  </Link>
                  <Button
                    onClick={() => forceProceedMutation.mutate({ featureId })}
                    disabled={forceProceedMutation.isPending}
                    className="w-full sm:w-auto rounded-xl py-4"
                  >
                    {forceProceedMutation.isPending ? "Proceeding..." : "Override & Proceed to Build Custom"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Phase 2: Intake - Question / Context Gathering */}
          {feature.status === "intake" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-extrabold">Requirement Discovery Chat</h2>
                <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                  Let's gather some missing details about the requirement to write a high-integrity PRD.
                </p>
              </div>

              <Card className="border-border/80 rounded-2xl shadow-md">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Customer Request Source</CardTitle>
                  <div className="p-4 rounded-xl bg-muted/60 border border-border/40 mt-2 text-sm leading-relaxed text-muted-foreground">
                    "{feature.description}"
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span>AI Agent Clarifications Required</span>
                  </div>

                  {(feature.missingContext as any[]).map((ctx, idx) => (
                    <div key={idx} className="space-y-2">
                      <label htmlFor={`q-${idx}`} className="text-sm font-semibold text-foreground leading-normal block">
                        Q{idx + 1}: {ctx.question}
                      </label>
                      <Input
                        id={`q-${idx}`}
                        placeholder="Type your response or clarifications..."
                        value={answers[idx]}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        className="rounded-xl border-input/60 focus:border-primary transition-all py-5 text-sm"
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="p-6 border-t border-border/40 bg-muted/10 flex justify-end">
                  <Button
                    onClick={submitIntake}
                    disabled={submitAnswersMutation.isPending}
                    className="gap-2 rounded-xl py-4 font-semibold shadow-md"
                  >
                    {submitAnswersMutation.isPending ? "Generating PRD..." : "Submit Answers & Generate PRD"}
                    <Send className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Phase 3: PRD Review & Approval */}
          {feature.status === "prd_generation" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Structured PRD Review</h2>
                  <p className="text-muted-foreground text-sm">Review, edit, and approve the generated requirements document.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPrd(!isEditingPrd)}
                    className="rounded-xl border-border/80"
                  >
                    {isEditingPrd ? "Cancel Edit" : "Edit Document"}
                  </Button>
                </div>
              </div>

              <Card className="border-border/80 rounded-2xl shadow-md overflow-hidden">
                <CardContent className="p-6 bg-card">
                  {isEditingPrd ? (
                    <Textarea
                      value={prdText}
                      onChange={(e) => setPrdText(e.target.value)}
                      className="min-h-[500px] font-mono text-sm leading-relaxed rounded-xl focus:border-primary transition-all"
                    />
                  ) : (
                    renderPrdBody(prdText)
                  )}
                </CardContent>
                <CardFooter className="p-6 border-t border-border/40 bg-muted/10 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Verify Goals, Scope, Edge cases and success metrics before sign-off.</span>
                  <Button
                    onClick={() => approvePrdMutation.mutate({ featureId, prdContent: prdText })}
                    disabled={approvePrdMutation.isPending}
                    className="gap-2 rounded-xl py-4 font-semibold shadow-md"
                  >
                    {approvePrdMutation.isPending ? "Generating Tasks..." : "Approve PRD & Generate Tasks"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Phase 4: Tasks Breakdown & Planning */}
          {feature.status === "tasks_breakdown" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Engineering Planning</h2>
                  <p className="text-muted-foreground text-sm">The PRD requirements have been mapped to component-level developer tickets.</p>
                </div>
                <Button
                  onClick={() => initializeBranchMutation.mutate({ featureId })}
                  disabled={initializeBranchMutation.isPending}
                  className="gap-2 rounded-xl py-4 font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  {initializeBranchMutation.isPending ? "Initializing Branch..." : "Initialize Branch & Pull Request"}
                  <GitPullRequest className="h-4 w-4" />
                </Button>
              </div>

              {/* Kanban-like list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To Do</span>
                    <Badge variant="outline" className="text-[10px] font-bold py-0">{tasks.filter(t => t.status === "todo").length}</Badge>
                  </div>
                  
                  {tasks.filter(t => t.status === "todo").map(t => (
                    <Card key={t.id} className="border-border/80 shadow-sm rounded-xl p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="secondary" className={`text-[9px] uppercase font-bold py-0 px-1.5 ${
                            t.priority === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                          }`}>
                            {t.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "in_progress" })}
                            className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-sm leading-tight text-foreground">{t.title}</h4>
                        <p className="text-muted-foreground text-xs leading-normal mt-1">{t.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* In Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Progress</span>
                    <Badge variant="outline" className="text-[10px] font-bold py-0">{tasks.filter(t => t.status === "in_progress").length}</Badge>
                  </div>
                  
                  {tasks.filter(t => t.status === "in_progress").map(t => (
                    <Card key={t.id} className="border-primary/30 bg-primary/[0.01] shadow-sm rounded-xl p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="secondary" className="text-[9px] uppercase font-bold py-0 px-1.5 bg-primary/10 text-primary border-primary/20">
                            {t.priority}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "todo" })}
                              className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "done" })}
                              className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <Check className="h-4 w-4 text-emerald-500" />
                            </Button>
                          </div>
                        </div>
                        <h4 className="font-bold text-sm leading-tight text-foreground">{t.title}</h4>
                        <p className="text-muted-foreground text-xs leading-normal mt-1">{t.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Done */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Done</span>
                    <Badge variant="outline" className="text-[10px] font-bold py-0">{tasks.filter(t => t.status === "done").length}</Badge>
                  </div>
                  
                  {tasks.filter(t => t.status === "done").map(t => (
                    <Card key={t.id} className="border-border/60 bg-muted/10 shadow-sm rounded-xl p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="secondary" className="text-[9px] uppercase font-bold py-0 px-1.5 bg-neutral-500/10 text-neutral-400 border-neutral-500/20">
                            {t.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: "in_progress" })}
                            className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-sm leading-tight text-muted-foreground line-through">{t.title}</h4>
                        <p className="text-muted-foreground text-xs leading-normal mt-1">{t.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Phase 5: Code Diff & AI PR Review */}
          {feature.status === "pr_review" && pullRequest && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="gap-1 bg-cyan-500/10 border-cyan-500/20 text-cyan-500 text-[10px] uppercase font-bold py-0.5 px-2">
                      <GitPullRequest className="h-3.5 w-3.5" />
                      <span>PR #{feature.prNumber}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">Branch: {feature.branchName}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{pullRequest.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {!aiReview ? (
                    <Button
                      onClick={() => runAiReviewMutation.mutate({ featureId })}
                      disabled={runAiReviewMutation.isPending}
                      className="gap-2 rounded-xl py-4 font-semibold shadow-md"
                    >
                      {runAiReviewMutation.isPending ? "Running Review..." : "Run AI Code Review"}
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                    </Button>
                  ) : aiReview.status === "changes_requested" ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => submitFixesMutation.mutate({ featureId })}
                        disabled={submitFixesMutation.isPending}
                        className="gap-1.5 rounded-xl text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 font-semibold"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Submit Code Fixes</span>
                      </Button>
                      <Button
                        onClick={() => runAiReviewMutation.mutate({ featureId })}
                        disabled={runAiReviewMutation.isPending}
                        className="gap-1 rounded-xl text-xs py-2 h-9 border border-border/80"
                        variant="outline"
                      >
                        Re-review
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => approveReleaseMutation.mutate({ featureId })}
                      disabled={approveReleaseMutation.isPending}
                      className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Approve Release</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* AI Report Card */}
              {aiReview && (
                <Card className={`rounded-xl shadow-sm border-l-4 overflow-hidden ${
                  aiReview.status === "changes_requested" ? "border-l-amber-500 border-border/80 bg-amber-500/[0.01]" : "border-l-emerald-500 border-border/80 bg-emerald-500/[0.01]"
                }`}>
                  <CardHeader className="p-5 pb-3 flex flex-row items-center gap-3">
                    {aiReview.status === "changes_requested" ? (
                      <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                    )}
                    <div>
                      <CardTitle className="text-base font-bold">AI Assistant Review Report</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Status: <span className="font-bold">{aiReview.status.replace("_", " ")}</span></CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 text-sm leading-relaxed text-muted-foreground">
                    {aiReview.summary}
                  </CardContent>
                </Card>
              )}

              {/* Code Diff Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Files Tree */}
                <div className="space-y-2 lg:col-span-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Changed Files</div>
                  {(pullRequest.diffData as any[]).map((f) => (
                    <button
                      key={f.filepath}
                      onClick={() => setSelectedFile(f.filepath)}
                      className={`w-full text-left p-3 rounded-lg text-xs font-semibold font-mono flex items-center justify-between border transition-all ${
                        selectedFile === f.filepath
                          ? "bg-secondary text-foreground border-border/60"
                          : "text-muted-foreground hover:bg-muted/40 border-transparent"
                      }`}
                    >
                      <span className="truncate">{f.filepath}</span>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${f.status === "added" ? "bg-emerald-500" : "bg-blue-500"}`} />
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
                      <Card key={f.filepath} className="border-border/80 rounded-xl overflow-hidden shadow-md">
                        <div className="bg-muted px-4 py-2 border-b border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
                          <span>{f.filepath}</span>
                          <span className="uppercase text-[9px] font-bold bg-background px-2 py-0.5 rounded border border-border/50">{f.status}</span>
                        </div>
                        <div className="p-4 bg-card font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed select-text space-y-3">
                          {/* We parse and render the diff lines */}
                          {f.diff.split("\n").map((line: string, idx: number) => {
                            const isAdded = line.startsWith("+");
                            const isRemoved = line.startsWith("-");
                            
                            // Check if a comment belongs immediately after this line (dummy line match)
                            const matchedComment = commentsForFile.find(c => {
                              // Simulating showing the warning inline. If file is feature.ts:
                              // line 9 for error (protectedProcedure orgetConfig)
                              // line 10 for warning (rateLimiter or useRateLimiter)
                              if (selectedFile === "apps/api/src/routes/feature.ts") {
                                if (c.line === 9 && (line.includes("getConfig") || line.includes("protectedProcedure"))) return true;
                                if (c.line === 10 && (line.includes("rateLimiter") || line.includes("enabled: true"))) return true;
                              }
                              return false;
                            });

                            return (
                              <React.Fragment key={idx}>
                                <div className={`px-2 py-0.5 rounded flex gap-4 ${
                                  isAdded ? "bg-emerald-500/10 text-emerald-400" :
                                  isRemoved ? "bg-red-500/10 text-red-400" : ""
                                }`}>
                                  <span className="w-6 shrink-0 text-muted-foreground select-none text-right">{idx + 1}</span>
                                  <span>{line}</span>
                                </div>

                                {matchedComment && (
                                  <div className={`my-2 mx-10 p-4 rounded-lg border text-sm leading-relaxed ${
                                    matchedComment.type === "error" 
                                      ? "bg-red-500/[0.02] border-red-500/30 text-red-500" 
                                      : matchedComment.type === "warning" 
                                      ? "bg-amber-500/[0.02] border-amber-500/30 text-amber-500" 
                                      : "bg-emerald-500/[0.02] border-emerald-500/30 text-emerald-500"
                                  }`}>
                                    <div className="font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                                      {matchedComment.type === "error" ? <AlertCircle className="h-4 w-4" /> : matchedComment.type === "warning" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                      <span>AI Review Comment ({matchedComment.requirementId})</span>
                                    </div>
                                    <p className="text-foreground">{matchedComment.text}</p>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Phase 6: Release & Shipped Celebration */}
          {(feature.status === "pr_approved" || feature.status === "shipped") && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-6">
                {feature.status === "shipped" ? (
                  <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block mb-3 animate-bounce">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                ) : (
                  <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-3 animate-pulse">
                    <ShieldCheck className="h-12 w-12" />
                  </div>
                )}
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {feature.status === "shipped" ? "Feature Shipped Successfully!" : "Lead PM Sign-off"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                  {feature.status === "shipped" 
                    ? "The feature has passed all pipeline steps and is running in production." 
                    : "The pull request passed code reviews and is ready for release."}
                </p>
              </div>

              <Card className="border-border/80 rounded-2xl shadow-md overflow-hidden">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-base font-bold">Release Readiness Report</CardTitle>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Product Requirements (PRD)</span>
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">Approved</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Kanban className="h-4 w-4" />
                        <span>Engineering Tasks Completed</span>
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">100% Done</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>AI Code Review Checks</span>
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">Passed</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-4 border-t border-border/40 bg-muted/10">
                  {feature.status === "shipped" ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        <span>Auto-Generated Release Notes</span>
                      </h4>
                      <div className="bg-card p-4 rounded-xl border border-border/60 text-sm leading-normal text-muted-foreground select-text font-mono whitespace-pre-wrap">
                        {releaseNotes || feature.prdContent ? `## Released: ${feature.title}\n\nAll tasks verified. Secure configurations with rate-limiters deployed.` : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed text-muted-foreground flex items-start gap-3 p-4 rounded-xl bg-card border border-border/40">
                      <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground mb-0.5 text-xs uppercase tracking-wider">Formal Sign-off Required</p>
                        <p>As lead reviewer/project manager, please verify the automated audit details above before initiating deployment.</p>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-6 border-t border-border/40 bg-card flex justify-end">
                  {feature.status === "shipped" ? (
                    <Link href={`/projects/${project.id}`} className="w-full">
                      <Button className="w-full rounded-xl py-4 font-semibold">
                        Back to Workspace
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => shipFeatureMutation.mutate({ featureId })}
                      disabled={shipFeatureMutation.isPending}
                      className="w-full rounded-xl py-4 font-semibold shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {shipFeatureMutation.isPending ? "Deploying Release..." : "Sign-off & Deploy to Production"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
