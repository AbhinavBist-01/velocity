"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Play, RefreshCw, Send,
  ChevronRight, ChevronLeft, Kanban, GitPullRequest, ShieldCheck, Check,
  AlertTriangle, Eye, ShieldAlert, Sparkles, Code, FileText, Lock, Terminal,
  Plus, Trash2, Edit3, X, ArrowLeftRight, LogOut
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { useLogout } from "~/hooks/api/auth";

export default function FeaturePipeline() {
  const params = useParams();
  const router = useRouter();
  const featureId = params.id as string;
  const utils = trpc.useUtils();
  const { logout } = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const { data, isLoading } = trpc.velocity.getFeatureDetails.useQuery({ id: featureId });
  
  const submitAnswersMutation = trpc.velocity.submitIntakeAnswers.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Requirements saved! PRD generated.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const forceProceedMutation = trpc.velocity.forceProceedFeature.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Proceeding with intake questions.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const approvePrdMutation = trpc.velocity.approvePrd.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("PRD Approved! Actionable engineering tasks created.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const updateTaskMutation = trpc.velocity.updateTaskStatus.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
    },
    onError: (err) => {
      toast.error(`Error updating task status: ${err.message}`);
    }
  });

  const createTaskMutation = trpc.velocity.createTask.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Task created successfully.");
      setShowCreateModal(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
    },
    onError: (err) => {
      toast.error(`Error creating task: ${err.message}`);
    }
  });

  const updateTaskDetailsMutation = trpc.velocity.updateTask.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Task updated successfully.");
      setEditingTask(null);
    },
    onError: (err) => {
      toast.error(`Error updating task: ${err.message}`);
    }
  });

  const deleteTaskMutation = trpc.velocity.deleteTask.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Task deleted.");
    },
    onError: (err) => {
      toast.error(`Error deleting task: ${err.message}`);
    }
  });

  const approveTasksPlanMutation = trpc.velocity.approveTasksPlan.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Plan approved successfully!");
    },
    onError: (err) => {
      toast.error(`Error approving plan: ${err.message}`);
    }
  });

  const initializeBranchMutation = trpc.velocity.initializeBranch.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("GitHub branch created! Pull Request initialized.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const runAiReviewMutation = trpc.velocity.runAiReview.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("AI Code Review completed.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const submitFixesMutation = trpc.velocity.submitFixes.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Developer code fixes submitted! Re-reviewing...");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const approveReleaseMutation = trpc.velocity.approveRelease.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Lead reviewer approved release.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const rejectReleaseMutation = trpc.velocity.rejectRelease.useMutation({
    onSuccess: () => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      toast.success("Release rejected. Returned to developer queue.");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const shipFeatureMutation = trpc.velocity.shipFeature.useMutation({
    onSuccess: (res) => {
      utils.velocity.getFeatureDetails.invalidate({ id: featureId });
      setReleaseNotes(res.releaseNotes);
      setShowConfetti(true);
      toast.success("🎉 FEATURE SHIPPED TO PRODUCTION!");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  // State
  const [answers, setAnswers] = useState<string[]>([]);
  const [prdText, setPrdText] = useState("");
  const [isEditingPrd, setIsEditingPrd] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Kanban State
  const [activeDragColumn, setActiveDragColumn] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("medium");

  // Human Review Deck States
  const [verifiedPrd, setVerifiedPrd] = useState(false);
  const [verifiedTasks, setVerifiedTasks] = useState(false);
  const [verifiedPr, setVerifiedPr] = useState(false);
  const [verifiedAiHistory, setVerifiedAiHistory] = useState(false);
  const [verifiedIssues, setVerifiedIssues] = useState(false);

  const startEditingTask = (t: any) => {
    setEditingTask(t);
    setEditTaskTitle(t.title);
    setEditTaskDescription(t.description);
    setEditTaskPriority(t.priority);
  };

  // Sync PRD content when data loads
  useEffect(() => {
    if (data?.feature?.prdContent) {
      setPrdText(data.feature.prdContent);
    }
    if (data?.feature?.missingContext) {
      const mc = data.feature.missingContext as any[];
      setAnswers(prev => {
        if (prev.length === mc.length) return prev;
        return mc.map(item => item.answer || "");
      });
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

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    if (feature.status !== "tasks_breakdown") return;
    e.preventDefault();
    setActiveDragColumn(colStatus);
  };

  const handleDragLeave = () => {
    setActiveDragColumn(null);
  };

  const handleDrop = (e: React.DragEvent, colStatus: string) => {
    setActiveDragColumn(null);
    if (feature.status !== "tasks_breakdown") return;
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTaskMutation.mutate({ taskId, status: colStatus });
    }
  };

  const getProgressPercentage = () => {
    switch (feature.status) {
      case "educated": return 100;
      case "intake": return 15;
      case "prd_generation": return 35;
      case "tasks_breakdown": return 50;
      case "plan_approved": return 65;
      case "pr_review":
      case "fix_needed": return 75;
      case "pr_approved": return 90;
      case "shipped": return 100;
      default: return 0;
    }
  };

  const getStepStatusIndicator = (stepName: string) => {
    const statusOrder = ["intake", "prd_generation", "tasks_breakdown", "pr_review", "pr_approved", "shipped"];
    let currentStatus = feature.status;
    if (currentStatus === "plan_approved") {
      currentStatus = "tasks_breakdown";
    }
    if (currentStatus === "fix_needed") {
      currentStatus = "pr_review";
    }
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepName);

    if (feature.status === "educated") {
      return "[x] CLSD";
    }

    if (feature.status === "plan_approved" && stepName === "tasks_breakdown") {
      return "[x] DONE";
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
    let currentStatus = feature.status;
    if (currentStatus === "plan_approved") {
      currentStatus = "tasks_breakdown";
    }
    if (currentStatus === "fix_needed") {
      currentStatus = "pr_review";
    }
    const currentIdx = statusOrder.indexOf(currentStatus);
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
        <aside className={`${isCollapsed ? "w-16 px-2 py-6" : "w-80 p-6"} border-r border-border bg-card/85 backdrop-blur-md flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-300 relative`}>
          <div>
            <div className="flex items-center justify-center mb-6 relative w-full">
              {!isCollapsed && <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-full text-left">// Delivery Pipeline</div>}
              {isCollapsed && <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center w-full">// Pipe</div>}
              <button
                onClick={toggleSidebar}
                className="absolute -right-5 top-[-4px] p-1 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 z-20"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </button>
            </div>
            
            <div className="space-y-2 w-full">
              {[
                { name: "intake", label: "Discovery Intake" },
                { name: "prd_generation", label: "Requirements Spec" },
                { name: "tasks_breakdown", label: "Planning Checklist" },
                { name: "pr_review", label: "AI Code Review" },
                { name: "pr_approved", label: "Release Readiness" },
                { name: "shipped", label: "Shipped to Prod" }
              ].map((step, idx) => (
                <div
                  key={step.name}
                  title={step.label}
                  className={`flex items-center transition-all duration-200 border ${
                    isCollapsed 
                      ? "h-10 w-10 justify-center mx-auto p-0" 
                      : "justify-between p-2.5 text-xs"
                  } ${getStepRowClass(step.name)}`}
                >
                  <div className={`flex items-center ${isCollapsed ? "" : "gap-2"}`}>
                    <span className="text-[10px] opacity-60">0{idx + 1}</span>
                    {!isCollapsed && <span>{step.label}</span>}
                  </div>
                  {!isCollapsed && <span className="text-[10px] font-bold font-mono">{getStepStatusIndicator(step.name)}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 w-full">
            {!isCollapsed && (
              <div className="p-4 border border-border bg-background/50 text-[10px] text-muted-foreground leading-relaxed">
                <div className="flex items-center gap-2 mb-1.5 text-foreground font-bold uppercase tracking-widest">
                  <Terminal className="h-3.5 w-3.5 text-foreground" />
                  <span>Velocity Engine</span>
                </div>
                <p>Monitors code paths, cross-references acceptance criteria, and blocks deployment if specs aren't fulfilled.</p>
              </div>
            )}

            <button
              onClick={() => logout()}
              title="Logout"
              className={`flex items-center transition-all duration-200 border border-transparent hover:border-destructive hover:text-destructive hover:bg-destructive/10 font-mono text-xs uppercase tracking-wider ${
                isCollapsed 
                  ? "h-10 w-10 justify-center mx-auto p-0 text-muted-foreground" 
                  : "px-3 py-2.5 gap-3 w-full text-left"
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
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
                        value={answers[idx] || ""}
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
          {(feature.status === "tasks_breakdown" || feature.status === "plan_approved") && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Kanban className="h-5 w-5 text-foreground animate-pulse" />
                    <span>Engineering Board</span>
                    {feature.status === "plan_approved" && (
                      <Badge className="bg-emerald-600/10 text-emerald-500 border-emerald-600/20 text-[9px] uppercase tracking-wider rounded-none font-bold py-0.5 px-2.5">
                        Approved
                      </Badge>
                    )}
                  </h2>
                  <p className="text-muted-foreground text-xs font-sans mt-0.5">
                    {feature.status === "tasks_breakdown" 
                      ? "Review, organize, add, edit, or drag-and-drop tasks to finalize the scope before development."
                      : "The engineering scope is finalized. Launch the git environment to write code."
                    }
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  {feature.status === "tasks_breakdown" ? (
                    <>
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        variant="outline"
                        className="gap-2 rounded-none py-5 px-4 border-border text-xs uppercase tracking-widest font-mono shrink-0 hover:border-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task</span>
                      </Button>
                      <Button
                        onClick={() => approveTasksPlanMutation.mutate({ featureId })}
                        disabled={approveTasksPlanMutation.isPending}
                        className="gap-2 rounded-none py-5 px-6 bg-foreground text-background hover:bg-neutral-800 text-xs uppercase tracking-widest font-mono shrink-0"
                      >
                        {approveTasksPlanMutation.isPending ? "Approving Plan..." : "Approve Plan & Proceed"}
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => initializeBranchMutation.mutate({ featureId })}
                      disabled={initializeBranchMutation.isPending}
                      className="gap-2 rounded-none py-5 px-6 bg-emerald-600 text-white hover:bg-emerald-700 text-xs uppercase tracking-widest font-mono shrink-0 border border-emerald-500"
                    >
                      {initializeBranchMutation.isPending ? "Initializing Branch..." : "Initialize Branch & Start Coding"}
                      <GitPullRequest className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Kanban columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                {[
                  { id: "todo", label: "01 / To Do", colorClass: "text-muted-foreground" },
                  { id: "in_progress", label: "02 / In Progress", colorClass: "text-foreground" },
                  { id: "done", label: "03 / Done", colorClass: "text-muted-foreground/60" }
                ].map((col) => {
                  const columnTasks = tasks.filter((t) => t.status === col.id);
                  const isDragActive = activeDragColumn === col.id;
                  
                  return (
                    <div 
                      key={col.id} 
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`space-y-4 p-2 transition-all border ${
                        isDragActive 
                          ? "border-dashed border-foreground bg-foreground/[0.03]" 
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                        <span className={`font-bold uppercase tracking-wider ${col.colorClass}`}>{col.label}</span>
                        <span className="border border-border/80 px-2 py-0.5 text-[10px] text-muted-foreground">{columnTasks.length}</span>
                      </div>
                      
                      <div className="space-y-3 min-h-[350px] flex flex-col justify-start">
                        {columnTasks.map((t) => (
                          <div 
                            key={t.id} 
                            draggable={feature.status === "tasks_breakdown"}
                            onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                            className={`border bg-card p-4 space-y-3 relative group transition-all ${
                              feature.status === "tasks_breakdown" 
                                ? "hover:border-foreground cursor-grab active:cursor-grabbing" 
                                : "opacity-85"
                            } ${t.status === "done" ? "border-border/45 opacity-70 bg-muted/5" : "border-border"}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`border px-1.5 py-0.2 text-[9px] uppercase font-bold shrink-0 ${
                                t.priority === "high" ? "border-red-500 text-red-500 bg-red-500/5" : t.priority === "medium" ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-border text-muted-foreground"
                              }`}>
                                {t.priority}
                              </span>
                              
                              {/* Edit / Delete / Move Buttons */}
                              {feature.status === "tasks_breakdown" ? (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 rounded-none border border-border text-muted-foreground hover:text-foreground hover:bg-background"
                                    onClick={() => startEditingTask(t)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 rounded-none border border-border text-red-500 hover:text-red-600 hover:bg-background"
                                    onClick={() => {
                                      if (confirm(`Delete task "${t.title}"?`)) {
                                        deleteTaskMutation.mutate({ taskId: t.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Lock className="h-3 w-3 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            
                            <h4 className={`font-bold text-xs uppercase text-foreground leading-tight ${t.status === "done" ? "line-through text-muted-foreground/60" : ""}`}>{t.title}</h4>
                            <p className={`text-muted-foreground text-[10px] font-sans leading-relaxed ${t.status === "done" ? "line-through" : ""}`}>{t.description}</p>
                            
                            {/* Directional Move Buttons */}
                            {feature.status === "tasks_breakdown" && (
                              <div className="flex justify-end gap-1.5 pt-1">
                                {t.status !== "todo" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: t.status === "done" ? "in_progress" : "todo" })}
                                    className="h-5 w-5 rounded-none border border-border hover:border-foreground hover:bg-foreground hover:text-background text-muted-foreground"
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </Button>
                                )}
                                {t.status !== "done" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateTaskMutation.mutate({ taskId: t.id, status: t.status === "todo" ? "in_progress" : "done" })}
                                    className="h-5 w-5 rounded-none border border-border hover:border-foreground hover:bg-foreground hover:text-background text-muted-foreground"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {columnTasks.length === 0 && (
                          <div className="border border-dashed border-border/40 p-8 text-center text-muted-foreground/40 font-sans text-[10px] rounded-none uppercase tracking-wider">
                            Empty Column
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Task Modal */}
              {showCreateModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="border border-border bg-card p-6 w-full max-w-md font-mono text-xs space-y-4 shadow-2xl relative">
                    <Button 
                      variant="ghost"
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 rounded-none border border-border text-muted-foreground hover:text-foreground hover:bg-background"
                      onClick={() => setShowCreateModal(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Kanban className="h-4 w-4 text-foreground" />
                      <h3 className="text-sm font-bold uppercase tracking-tight">Create Developer Ticket</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Ticket Title</label>
                        <Input 
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g. Implement user login routes"
                          className="rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground bg-background text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Description</label>
                        <Textarea 
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          placeholder="Describe acceptance criteria & details..."
                          rows={3}
                          className="rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground bg-background text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Priority</label>
                        <select 
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value)}
                          className="w-full border border-border rounded-none bg-background text-xs font-mono p-2 focus-visible:outline-none focus-visible:border-foreground"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-border pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateModal(false)}
                        className="rounded-none text-[10px] uppercase font-mono tracking-wider border-border hover:border-foreground"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          if (!newTaskTitle.trim()) {
                            toast.error("Title is required");
                            return;
                          }
                          createTaskMutation.mutate({
                            featureId,
                            title: newTaskTitle,
                            description: newTaskDescription,
                            priority: newTaskPriority
                          });
                        }}
                        disabled={createTaskMutation.isPending}
                        className="rounded-none text-[10px] bg-foreground text-background hover:bg-neutral-800 uppercase font-mono tracking-wider"
                      >
                        {createTaskMutation.isPending ? "Creating..." : "Create Ticket"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Task Modal */}
              {editingTask && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="border border-border bg-card p-6 w-full max-w-md font-mono text-xs space-y-4 shadow-2xl relative">
                    <Button 
                      variant="ghost"
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 rounded-none border border-border text-muted-foreground hover:text-foreground hover:bg-background"
                      onClick={() => setEditingTask(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Edit3 className="h-4 w-4 text-foreground" />
                      <h3 className="text-sm font-bold uppercase tracking-tight">Edit Developer Ticket</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Ticket Title</label>
                        <Input 
                          value={editTaskTitle}
                          onChange={(e) => setEditTaskTitle(e.target.value)}
                          className="rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground bg-background text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Description</label>
                        <Textarea 
                          value={editTaskDescription}
                          onChange={(e) => setEditTaskDescription(e.target.value)}
                          rows={3}
                          className="rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground bg-background text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Priority</label>
                        <select 
                          value={editTaskPriority}
                          onChange={(e) => setEditTaskPriority(e.target.value)}
                          className="w-full border border-border rounded-none bg-background text-xs font-mono p-2 focus-visible:outline-none focus-visible:border-foreground"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-border pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingTask(null)}
                        className="rounded-none text-[10px] uppercase font-mono tracking-wider border-border hover:border-foreground"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          if (!editTaskTitle.trim()) {
                            toast.error("Title is required");
                            return;
                          }
                          updateTaskDetailsMutation.mutate({
                            taskId: editingTask.id,
                            title: editTaskTitle,
                            description: editTaskDescription,
                            priority: editTaskPriority
                          });
                        }}
                        disabled={updateTaskDetailsMutation.isPending}
                        className="rounded-none text-[10px] bg-foreground text-background hover:bg-neutral-800 uppercase font-mono tracking-wider"
                      >
                        {updateTaskDetailsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase 5: Code Diff & AI PR Review */}
          {(feature.status === "pr_review" || feature.status === "fix_needed") && pullRequest && (
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
                    <div className="text-[10px] font-bold border border-foreground/30 bg-card text-foreground px-4 py-3 uppercase tracking-wider">
                      Awaiting Human Review
                    </div>
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

              {/* Human Reviewer Verification Deck */}
              {aiReview && (
                <Card className="border-2 border-foreground bg-card rounded-none shadow-md overflow-hidden">
                  <CardHeader className="border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-foreground animate-pulse" />
                      <div>
                        <CardTitle className="text-sm font-black uppercase tracking-wider">Lead Reviewer Verification Deck</CardTitle>
                        <CardDescription className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">
                          // human_signoff_verification_protocol_v1.0
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      As the lead human reviewer, you must verify the five dimensions of the delivery checklist below. Checking all items will authorize and unlock the release sign-off controls.
                    </p>

                    <div className="space-y-4">
                      {/* 1. PRD */}
                      <div className="border border-border p-4 bg-background/50 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={verifiedPrd}
                            onChange={(e) => setVerifiedPrd(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 accent-foreground cursor-pointer rounded-none border-border"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase text-foreground">[ VERIFY-01 ] PRD Requirements Spec</span>
                            <span className="text-[10px] text-muted-foreground block font-sans mt-0.5">Ensure all functional objectives in the product specification are satisfied.</span>
                          </div>
                        </label>
                        <details className="text-[10.5px] text-muted-foreground pl-7.5">
                          <summary className="cursor-pointer hover:text-foreground underline">View PRD Document</summary>
                          <div className="mt-3 p-3 bg-card border border-border max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed">
                            {feature.prdContent}
                          </div>
                        </details>
                      </div>

                      {/* 2. Tasks */}
                      <div className="border border-border p-4 bg-background/50 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={verifiedTasks}
                            onChange={(e) => setVerifiedTasks(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 accent-foreground cursor-pointer rounded-none border-border"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase text-foreground">[ VERIFY-02 ] Engineering Tasks Checklist</span>
                            <span className="text-[10px] text-muted-foreground block font-sans mt-0.5">Confirm status and validation of all sub-tickets on the engineering board.</span>
                          </div>
                        </label>
                        <details className="text-[10.5px] text-muted-foreground pl-7.5">
                          <summary className="cursor-pointer hover:text-foreground underline">View Tasks Status ({tasks.filter(t => t.status === "done").length}/{tasks.length} Completed)</summary>
                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pl-2">
                            {tasks.map(t => (
                              <div key={t.id} className="flex items-center gap-2 text-xs">
                                <span className={`px-1.5 py-0.2 border text-[8.5px] font-bold ${
                                  t.status === "done" ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-border text-muted-foreground"
                                }`}>
                                  {t.status.toUpperCase()}
                                </span>
                                <span className={t.status === "done" ? "line-through text-muted-foreground/60" : "text-foreground"}>
                                  {t.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>

                      {/* 3. Pull Request */}
                      <div className="border border-border p-4 bg-background/50 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={verifiedPr}
                            onChange={(e) => setVerifiedPr(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 accent-foreground cursor-pointer rounded-none border-border"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase text-foreground">[ VERIFY-03 ] Pull Request Files & Diffs</span>
                            <span className="text-[10px] text-muted-foreground block font-sans mt-0.5">Ensure code modifications follow system boundaries and target the correct branch.</span>
                          </div>
                        </label>
                        <details className="text-[10.5px] text-muted-foreground pl-7.5">
                          <summary className="cursor-pointer hover:text-foreground underline">View Changed Files ({(pullRequest.diffData as any[]).length} files)</summary>
                          <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pl-2">
                            <p className="text-[10px] text-foreground"><span className="text-muted-foreground">Title:</span> {pullRequest.title}</p>
                            <p className="text-[10px] text-foreground mb-2"><span className="text-muted-foreground">Branch:</span> {feature.branchName}</p>
                            {(pullRequest.diffData as any[]).map(f => (
                              <div key={f.filepath} className="text-xs text-muted-foreground flex items-center justify-between border-b border-border/40 pb-1">
                                <span>{f.filepath}</span>
                                <Badge className="text-[8px] rounded-none py-0 px-1 border border-border uppercase">{f.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>

                      {/* 4. AI Review History */}
                      <div className="border border-border p-4 bg-background/50 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={verifiedAiHistory}
                            onChange={(e) => setVerifiedAiHistory(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 accent-foreground cursor-pointer rounded-none border-border"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase text-foreground">[ VERIFY-04 ] AI Review History & Findings</span>
                            <span className="text-[10px] text-muted-foreground block font-sans mt-0.5">Audit the findings report generated by the Pinecone RAG AI reviewer.</span>
                          </div>
                        </label>
                        <details className="text-[10.5px] text-muted-foreground pl-7.5">
                          <summary className="cursor-pointer hover:text-foreground underline">View AI Compliance Details ({aiReview.status.toUpperCase()})</summary>
                          <div className="mt-3 p-3 bg-card border border-border space-y-2 text-xs font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${aiReview.status === "passed" ? "bg-emerald-500" : "bg-red-500"}`} />
                              <span className="font-bold">AI Review Status: {aiReview.status.toUpperCase()}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-[11px]">{aiReview.summary}</p>
                          </div>
                        </details>
                      </div>

                      {/* 5. Outstanding Issues */}
                      <div className="border border-border p-4 bg-background/50 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={verifiedIssues}
                            onChange={(e) => setVerifiedIssues(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 accent-foreground cursor-pointer rounded-none border-border"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase text-foreground">[ VERIFY-05 ] Outstanding Issues Summary</span>
                            <span className="text-[10px] text-muted-foreground block font-sans mt-0.5">Verify that all blocking vulnerabilities are resolved and non-blocking warnings are acceptable.</span>
                          </div>
                        </label>
                        <details className="text-[10.5px] text-muted-foreground pl-7.5">
                          <summary className="cursor-pointer hover:text-foreground underline">View Issues List ({(aiReview.comments as any[]).length} total findings)</summary>
                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pl-2">
                            {(aiReview.comments as any[]).map((c, i) => (
                              <div key={i} className="text-xs p-2 border border-border/60 bg-muted/10 space-y-1">
                                <div className="flex items-center gap-2 justify-between">
                                  <span className={`text-[8px] font-bold px-1.5 py-0.2 border uppercase ${
                                    c.type === "blocking" ? "border-red-500 text-red-500 bg-red-500/5" : "border-amber-500 text-amber-500 bg-amber-500/5"
                                  }`}>
                                    {c.type}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">{c.filepath} (Line {c.line})</span>
                                </div>
                                <p className="text-[10.5px] font-sans text-foreground leading-normal">{c.text}</p>
                              </div>
                            ))}
                            {(aiReview.comments as any[]).length === 0 && (
                              <p className="text-muted-foreground text-xs font-sans">No outstanding issues found by AI. Code review clean.</p>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border p-6 bg-muted/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] text-muted-foreground font-sans text-center sm:text-left leading-relaxed">
                      {!verifiedPrd || !verifiedTasks || !verifiedPr || !verifiedAiHistory || !verifiedIssues ? (
                        <span className="text-red-500/80 font-bold block">⚠️ Please check all 5 items to unlock authorization controls.</span>
                      ) : (
                        <span className="text-emerald-500 font-bold block">✓ Release Authorization Unlocked</span>
                      )}
                      Select Approve to merge to production queue, or Reject to return to Fix-Needed queue.
                    </div>
                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                      <Button
                        variant="destructive"
                        onClick={() => rejectReleaseMutation.mutate({ featureId })}
                        disabled={rejectReleaseMutation.isPending}
                        className="rounded-none py-5 px-6 uppercase text-xs tracking-wider font-mono font-bold flex-1 sm:flex-initial"
                      >
                        {rejectReleaseMutation.isPending ? "Rejecting..." : "Reject Release"}
                      </Button>
                      <Button
                        onClick={() => approveReleaseMutation.mutate({ featureId })}
                        disabled={
                          !verifiedPrd || 
                          !verifiedTasks || 
                          !verifiedPr || 
                          !verifiedAiHistory || 
                          !verifiedIssues || 
                          approveReleaseMutation.isPending
                        }
                        className="rounded-none py-5 px-6 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-neutral-800 disabled:bg-neutral-800 disabled:text-muted-foreground/80 border border-emerald-500 uppercase text-xs tracking-wider font-mono font-bold flex-1 sm:flex-initial"
                      >
                        {approveReleaseMutation.isPending ? "Approving..." : "Approve Release"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
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
