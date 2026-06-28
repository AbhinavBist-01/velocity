"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { 
  Plus, Github, ArrowRight, Kanban, Terminal, ChevronRight, ChevronLeft, LogOut,
  GitPullRequest, GitMerge, FileCode, Tag, GitCommit, GitBranch, RefreshCw, 
  BarChart2, TrendingUp, Calendar, AlertCircle, ShieldCheck, Info,
  Workflow, Bot, Activity, Webhook, Settings, Rocket, Moon, Sun, HelpCircle, User, BookOpen, Clock,
  Cpu, CheckCircle2, XCircle, Search, Sliders, ExternalLink, Key, Lock, Network, Database, Trash2
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { useLogout, useUser } from "~/hooks/api/auth";
import { authClient } from "~/lib/auth-client";
import { Badge } from "~/components/ui/badge";
import { useTheme } from "next-themes";

/* ─────────────────────────────────────────────────────────────────────────
   Shared label style — consistent with landing page section labels
───────────────────────────────────────────────────────────────────────── */
const LABEL_CLS = "text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-muted-foreground";
const PANEL_CLS = "border border-foreground/10 bg-foreground/[0.02] p-5 space-y-4";
const PANEL_HDR = "text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b border-foreground/10 pb-3 text-foreground";
const BTN_MONO  = "rounded-none font-mono text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 border border-foreground transition-all";
const BTN_GHOST = "rounded-none font-mono text-[10px] uppercase tracking-widest border border-foreground/20 hover:border-foreground text-muted-foreground hover:text-foreground transition-all";

export default function Dashboard() {
  const utils = trpc.useUtils();
  const { user } = useUser();
  const { logout } = useLogout();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<
    "projects" | "github" | "pipeline" | "reviews" | "activity" | "webhooks" | "deployments" | "settings"
  >("projects");

  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Webhook Simulation States
  const [webhookRepo, setWebhookRepo] = useState("");
  const [webhookAction, setWebhookAction] = useState<"opened" | "synchronize">("opened");
  const [webhookPrTitle, setWebhookPrTitle] = useState("feat: add schema authorization logic");
  const [webhookBranch, setWebhookBranch] = useState("feature/schema-auth");
  const [webhookPrNum, setWebhookPrNum] = useState("1");
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [webhookSimResult, setWebhookSimResult] = useState<any>(null);

  // Deployment Simulation States
  const [deployEnv, setDeployEnv] = useState<"staging" | "production">("staging");
  const [deployProgress, setDeployProgress] = useState<number | null>(null);
  const [deployLog, setDeployLog] = useState<string[]>([]);
  const [deployHistory, setDeployHistory] = useState<{
    id: string;
    env: string;
    status: "live" | "building" | "failed";
    commit: string;
    branch: string;
    triggeredBy: string;
    timestamp: string;
  }[]>([
    { id: "dep-1", env: "production", status: "live", commit: "feat: add Pinecone RAG capability", branch: "main", triggeredBy: "AI pipeline", timestamp: "15 mins ago" },
    { id: "dep-2", env: "staging", status: "live", commit: "fix: bypass missing context queries", branch: "feature/prd-context", triggeredBy: "Abhinav Bist", timestamp: "2 hours ago" },
    { id: "dep-3", env: "staging", status: "failed", commit: "feat: direct workspace commit", branch: "feature/direct-commit", triggeredBy: "Abhinav Bist", timestamp: "5 hours ago" }
  ]);

  // App Settings States
  const [settingsGeminiKey, setSettingsGeminiKey] = useState("••••••••••••••••••••");
  const [settingsPineconeKey, setSettingsPineconeKey] = useState("••••-••••-••••-••••");
  const [settingsWebhookSecret, setSettingsWebhookSecret] = useState("••••••••••••••••");
  const [settingsPromptTemplate, setSettingsPromptTemplate] = useState("Perform strict security audits, credential scans, and requirement check validation.");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Webhook Event Logs
  const [webhookEvents, setWebhookEvents] = useState<{
    id: string;
    event: string;
    repo: string;
    pr: string;
    status: "processed" | "failed" | "ignored";
    timestamp: string;
  }[]>([
    { id: "we-1", event: "pull_request.synchronize", repo: "abhinavbist/velocity", pr: "PR #1 (feature/schema-auth)", status: "processed", timestamp: "8 mins ago" },
    { id: "we-2", event: "pull_request.opened", repo: "abhinavbist/velocity", pr: "PR #1 (feature/schema-auth)", status: "processed", timestamp: "25 mins ago" },
    { id: "we-3", event: "ping", repo: "abhinavbist/velocity", pr: "N/A", status: "processed", timestamp: "3 hours ago" }
  ]);

  // Activity Feed Mock Search
  const [activitySearch, setActivitySearch] = useState("");

  // AI Review search filter
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewFilter, setReviewFilter] = useState<"all" | "passed" | "changes_requested" | "pending">("all");

  // GitHub Console State
  const [selectedRepo, setSelectedRepo] = useState("abhinavbist/velocity");
  const [selectedSubTab, setSelectedSubTab] = useState<"pr" | "review" | "diff" | "ops" | "analytics">("pr");
  const [githubRepos, setGithubRepos] = useState<{ id: number; name: string; fullName: string; url: string; private: boolean }[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoMethod, setRepoMethod] = useState<"select" | "create" | "manual">("select");
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  const fetchGithubRepos = () => {
    setIsLoadingRepos(true);
    fetch("/api/github/repos")
      .then(res => { if (!res.ok) throw new Error("Failed to load repositories"); return res.json(); })
      .then(data => {
        setGithubRepos(data);
        if (data.length > 0) {
          const exists = data.some((r: any) => r.fullName === selectedRepo);
          if (!exists) setSelectedRepo(data[0].fullName);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingRepos(false));
  };

  React.useEffect(() => { if (session) fetchGithubRepos(); }, [session]);

  const [activePulls, setActivePulls] = useState<{ id: number; number: number; title: string; state: string; branch: string; sha: string; user: string; url: string }[]>([]);
  const [isLoadingPulls, setIsLoadingPulls] = useState(false);
  const [selectedPrNumber, setSelectedPrNumber] = useState<number | null>(null);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [prFiles, setPrFiles] = useState<{ filepath: string; status: string; additions?: number; deletions?: number }[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  React.useEffect(() => {
    if (session && selectedRepo && activeTab === "github") {
      setIsLoadingPulls(true);
      fetch(`/api/github/pulls?repo=${encodeURIComponent(selectedRepo)}`)
        .then(res => { if (!res.ok) throw new Error("Failed to load pull requests"); return res.json(); })
        .then(data => {
          setActivePulls(data);
          setSelectedPrNumber(data.length > 0 ? data[0].number : null);
        })
        .catch(err => { console.error(err); setActivePulls([]); setSelectedPrNumber(null); })
        .finally(() => setIsLoadingPulls(false));
    }
  }, [session, selectedRepo, activeTab]);

  React.useEffect(() => {
    if (session && selectedRepo && selectedPrNumber && activeTab === "github") {
      setIsLoadingFiles(true);
      fetch(`/api/github/pulls/files?repo=${encodeURIComponent(selectedRepo)}&number=${selectedPrNumber}`)
        .then(res => { if (!res.ok) throw new Error("Failed to load PR files"); return res.json(); })
        .then(data => setPrFiles(data))
        .catch(err => { console.error(err); setPrFiles([]); })
        .finally(() => setIsLoadingFiles(false));
    } else {
      setPrFiles([]);
    }
  }, [session, selectedRepo, selectedPrNumber, activeTab]);

  // Form states
  const [issueTitle, setIssueTitle] = useState("");
  const [issueBody, setIssueBody] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBranch, setPrBranch] = useState("feature/home-page-redesign");
  const [releaseTag, setReleaseTag] = useState("v1.3.0");
  const [reviewComment, setReviewComment] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [compareBase, setCompareBase] = useState("main");
  const [compareHead, setCompareHead] = useState("feature/home-page-redesign");

  const { data: projects, isLoading } = trpc.velocity.getProjects.useQuery();
  const { data: allFeatures, isLoading: isLoadingAllFeatures } = trpc.velocity.getAllFeatures.useQuery();
  const { data: allAiReviews, isLoading: isLoadingAllAiReviews } = trpc.velocity.getAllAiReviews.useQuery();
  
  const createProjectMutation = trpc.velocity.createProject.useMutation({
    onSuccess: () => {
      utils.velocity.getProjects.invalidate();
      utils.velocity.getAllFeatures.invalidate();
      utils.velocity.getAllAiReviews.invalidate();
      setIsCreateOpen(false);
      setName(""); setDescription(""); setRepo("");
      setNewRepoName(""); setNewRepoDesc("");
      toast.success("Project created successfully!");
    },
    onError: (err) => { toast.error(`Error: ${err.message}`); }
  });

  const deleteProjectMutation = trpc.velocity.deleteProject.useMutation({
    onSuccess: () => {
      utils.velocity.getProjects.invalidate();
      utils.velocity.getAllFeatures.invalidate();
      utils.velocity.getAllAiReviews.invalidate();
      toast.success("Project deleted successfully!");
    },
    onError: (err) => { toast.error(`Delete failed: ${err.message}`); }
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) { toast.warning("Please fill out name and description."); return; }

    let targetRepo = repo;

    if (repoMethod === "select") {
      if (!repo) { toast.warning("Please select a repository."); return; }
      targetRepo = repo;
    } else if (repoMethod === "create") {
      if (!newRepoName) { toast.warning("Please enter a name for the new repository."); return; }
      setIsCreatingRepo(true);
      try {
        const createRes = await fetch("/api/github/repos/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newRepoName, description: newRepoDesc || description, isPrivate: newRepoPrivate }),
        });
        if (!createRes.ok) { const errData = await createRes.json(); throw new Error(errData.error || "Failed to create GitHub repository"); }
        const newRepo = await createRes.json();
        targetRepo = newRepo.fullName;
        toast.success(`Repository ${newRepo.fullName} created on GitHub!`);
        fetchGithubRepos();
      } catch (err: any) {
        toast.error(`GitHub repo creation failed: ${err.message}`);
        setIsCreatingRepo(false);
        return;
      } finally { setIsCreatingRepo(false); }
    } else {
      if (!repo) { toast.warning("Please enter a repository path."); return; }
      targetRepo = repo;
    }

    createProjectMutation.mutate({ name, description, githubRepo: targetRepo });
  };

  /* ─── Sidebar nav items ─────────────────────────────────── */
  const navItems = [
    { id: "projects" as const, label: "Projects", icon: <Kanban className="h-4 w-4 shrink-0" /> },
    { id: "pipeline" as const, label: "Pipeline", icon: <Workflow className="h-4 w-4 shrink-0" /> },
    { id: "reviews" as const, label: "AI Reviews", icon: <Bot className="h-4 w-4 shrink-0" /> },
    { id: "activity" as const, label: "Activity", icon: <Activity className="h-4 w-4 shrink-0" /> },
    { id: "github"   as const, label: "GitHub Hub", icon: <Github className="h-4 w-4 shrink-0" /> },
    { id: "webhooks" as const, label: "Webhooks", icon: <Webhook className="h-4 w-4 shrink-0" /> },
    { id: "deployments" as const, label: "Deployments", icon: <Rocket className="h-4 w-4 shrink-0" /> },
    { id: "settings" as const, label: "Settings", icon: <Settings className="h-4 w-4 shrink-0" /> },
  ];

  const subTabs = [
    { id: "pr"        as const, label: "PR & Issues",       icon: <GitPullRequest className="h-3.5 w-3.5" /> },
    { id: "review"    as const, label: "Code Review",       icon: <ShieldCheck    className="h-3.5 w-3.5" /> },
    { id: "diff"      as const, label: "Diff Analysis",     icon: <FileCode       className="h-3.5 w-3.5" /> },
    { id: "ops"       as const, label: "Push & Pull",       icon: <RefreshCw      className="h-3.5 w-3.5" /> },
    { id: "analytics" as const, label: "Analytics",         icon: <BarChart2      className="h-3.5 w-3.5" /> },
  ];

  const consoleTitles: Record<string, string> = {
    pr: "PR & Issue Lifecycle",
    review: "GitHub Review Auditor",
    diff: "Git Diff Comparative Suite",
    ops: "Remote Push & Sync",
    analytics: "Repository Analytics",
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans relative">
      {/* Subtle dot grid */}
      <div className="fixed inset-0 bg-grid-dots opacity-30 pointer-events-none z-0" />

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`${isCollapsed ? "w-14 px-2 py-6" : "w-64 p-5"} border-r border-foreground/8 bg-background/95 backdrop-blur-md flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-300 relative z-10`}>
        <div>
          {/* Logo row */}
          <div className="flex items-center justify-between mb-8 w-full">
            <Link href="/" className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
              <div className="h-8 w-8 bg-foreground text-background flex items-center justify-center font-black text-xs tracking-tighter shrink-0">
                VL
              </div>
              {!isCollapsed && (
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] font-bold leading-none">Velocity</div>
                  <div className="text-[9px] text-muted-foreground font-mono tracking-widest mt-0.5">Delivery Engine</div>
                  {user && (
                    <div className="text-[9px] text-foreground/50 font-mono mt-0.5 truncate max-w-[120px]">{user.fullName}</div>
                  )}
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 border border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-foreground transition-all"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-full mb-6 p-1.5 border border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-foreground transition-all"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}

          {/* Nav */}
          <nav className="space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center transition-all duration-150 w-full border-l-2 ${
                  activeTab === item.id
                    ? "border-l-foreground bg-foreground/8 text-foreground font-bold"
                    : "border-l-transparent text-muted-foreground hover:border-l-foreground/20 hover:text-foreground hover:bg-foreground/3"
                } ${isCollapsed ? "justify-center h-10 w-10 mx-auto border-l-0 border border-foreground/8" : "gap-3 px-3 py-2.5 text-[11px] font-mono uppercase tracking-wider"}`}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom area */}
        <div className="space-y-2.5">
          {!isCollapsed && (
            <div className="border-l-2 border-l-foreground/10 pl-3 py-1 mb-2">
              <p className={`${LABEL_CLS} mb-1`}>// PAIR_PROG_ACTIVE</p>
              <p className="text-[11px] text-muted-foreground font-sans leading-snug">Idea to prod, with AI guidance.</p>
            </div>
          )}

          {/* Theme, Help & Profile row */}
          <div className={`flex items-center gap-1.5 ${isCollapsed ? "flex-col justify-center" : "px-1 justify-between"}`}>
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle Theme"
              className="p-2 border border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-foreground hover:bg-foreground/3 transition-all shrink-0 aspect-square flex items-center justify-center cursor-pointer"
            >
              {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>

            {/* Help / Docs */}
            <button
              onClick={() => setIsHelpOpen(true)}
              title="Documentation & Guide"
              className="p-2 border border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-foreground hover:bg-foreground/3 transition-all shrink-0 aspect-square flex items-center justify-center cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>

            {/* Profile */}
            <button
              onClick={() => setIsProfileOpen(true)}
              title="Profile & Connected Accounts"
              className="p-2 border border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-foreground hover:bg-foreground/3 transition-all shrink-0 aspect-square flex items-center justify-center cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => logout()}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center transition-all border border-transparent hover:border-red-500/30 hover:text-red-500 hover:bg-red-500/5 text-muted-foreground cursor-pointer ${
              isCollapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2.5 px-3 py-2 w-full text-[11px] font-mono uppercase tracking-wider"
            }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* ── Projects Tab ────────────────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div className="p-8 lg:p-12 max-w-7xl animate-in fade-in duration-200">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 pb-10 border-b border-foreground/8">
              <div>
                <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                  <span>System Cockpit</span>
                  <span className="opacity-40">/</span>
                  <span>Workspace Registry</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-[-0.04em] uppercase text-foreground leading-[0.9]">
                  Deliver Features<br />Faster.
                </h1>
                <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-xl font-sans font-normal">
                  Manage product discovery, PRD specs, engineering tasks, AI reviews, and production releases in one unified workspace.
                </p>
              </div>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className={`${BTN_MONO} h-10 px-5 gap-2 shrink-0 mt-1 cursor-pointer`}>
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Project</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-background border border-foreground/20 rounded-none p-7 font-sans text-foreground">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-base font-bold uppercase tracking-tight font-sans">Create New Project</DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground font-sans mt-1 leading-relaxed">
                        Set up a workspace and connect it to a repository to begin the feature flow.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className={LABEL_CLS}>Project Name</label>
                        <Input
                          id="name"
                          placeholder="e.g. My SaaS Platform"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="rounded-none border-foreground/20 bg-background focus:border-foreground text-sm h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="description" className={LABEL_CLS}>Description</label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of the app purpose..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="rounded-none border-foreground/20 bg-background focus:border-foreground text-sm min-h-[80px] resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={LABEL_CLS}>GitHub Repository Source</label>

                        {session ? (
                          <>
                            {/* Method selector */}
                            <div className="grid grid-cols-3 gap-px bg-foreground/10">
                              {(["select", "create", "manual"] as const).map((method) => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => {
                                    setRepoMethod(method);
                                    if (method === "select" && githubRepos.length > 0 && !repo) {
                                      setRepo(githubRepos[0]?.fullName || "");
                                    }
                                  }}
                                  className={`py-2 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                    repoMethod === method
                                      ? "bg-foreground text-background font-bold"
                                      : "bg-background text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {method === "select" && "Select"}
                                  {method === "create" && "Create"}
                                  {method === "manual" && "Manual"}
                                </button>
                              ))}
                            </div>

                            {repoMethod === "select" && (
                              <div className="space-y-1">
                                <select
                                  value={repo}
                                  onChange={(e) => setRepo(e.target.value)}
                                  className="w-full border border-foreground/20 bg-background text-sm font-mono p-2.5 focus-visible:outline-none focus-visible:border-foreground"
                                >
                                  {githubRepos.length > 0 ? (
                                    githubRepos.map((r) => (
                                      <option key={r.id} value={r.fullName}>
                                        {r.fullName} {r.private ? "🔒" : "🌐"}
                                      </option>
                                    ))
                                  ) : (
                                    <option value="">No repositories found</option>
                                  )}
                                </select>
                                <p className="text-[10px] text-muted-foreground font-sans px-0.5">Lists your synced GitHub repositories.</p>
                              </div>
                            )}

                            {repoMethod === "create" && (
                              <div className="space-y-3 p-4 border border-foreground/10 bg-foreground/[0.02]">
                                <div className="space-y-1.5">
                                  <label htmlFor="newRepoName" className={LABEL_CLS}>New Repository Name</label>
                                  <Input
                                    id="newRepoName"
                                    placeholder="my-new-project"
                                    value={newRepoName}
                                    onChange={(e) => setNewRepoName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"))}
                                    className="rounded-none border-foreground/20 bg-background text-sm h-9"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label htmlFor="newRepoDesc" className={LABEL_CLS}>Description (Optional)</label>
                                  <Input
                                    id="newRepoDesc"
                                    placeholder="Repository description..."
                                    value={newRepoDesc}
                                    onChange={(e) => setNewRepoDesc(e.target.value)}
                                    className="rounded-none border-foreground/20 bg-background text-sm h-9"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="newRepoPrivate"
                                    checked={newRepoPrivate}
                                    onChange={(e) => setNewRepoPrivate(e.target.checked)}
                                    className="accent-foreground size-3.5 cursor-pointer"
                                  />
                                  <label htmlFor="newRepoPrivate" className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground cursor-pointer">
                                    Private Repository (Recommended)
                                  </label>
                                </div>
                              </div>
                            )}

                            {repoMethod === "manual" && (
                              <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                  id="repo"
                                  placeholder="username/project-repo"
                                  value={repo}
                                  onChange={(e) => setRepo(e.target.value)}
                                  className="pl-9 rounded-none border-foreground/20 bg-background text-sm h-10"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="relative">
                              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                id="repo"
                                placeholder="username/project-repo"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                                className="pl-9 rounded-none border-foreground/20 bg-background text-sm h-10"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
                              Link your GitHub account in the GitHub Hub tab to select or create repositories directly.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="mt-7 gap-2 sm:gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className={`${BTN_GHOST} h-9 px-5 cursor-pointer`}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProjectMutation.isPending || isCreatingRepo}
                        className={`${BTN_MONO} h-9 px-5 cursor-pointer`}
                      >
                        {createProjectMutation.isPending || isCreatingRepo
                          ? (isCreatingRepo ? "Creating Repo..." : "Creating...")
                          : "Create Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </header>

            {/* Project List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Spinner className="h-6 w-6 text-foreground" />
                <p className={`${LABEL_CLS} animate-pulse`}>Loading projects...</p>
              </div>
            ) : !projects || projects.length === 0 ? (
              <div className="border border-foreground/10 p-20 text-center max-w-lg mx-auto flex flex-col items-center gap-7 mt-4">
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02]">
                  <Kanban className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight mb-3">No Projects Configured</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto font-sans font-normal">
                    Kick off the Velocity lifecycle. Add your first project, define requirements, generate branches, run reviews, and ship features.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className={`${BTN_MONO} h-10 px-8 gap-2 cursor-pointer`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Your First Project</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group bg-background hover:bg-foreground/[0.02] transition-colors duration-200 flex flex-col overflow-hidden relative border border-foreground/10"
                  >
                    {/* Left accent rule — appears on hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Repo badge and delete button row */}
                        <div className="flex items-center justify-between gap-4 mb-5">
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground border border-foreground/10 py-1 px-2.5">
                            <Github className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {project.githubRepo.replace("https://", "").replace("github.com/", "")}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (confirm(`Are you sure you want to delete project "${project.name}"? This will delete all associated features, tasks, and reviews.`)) {
                                deleteProjectMutation.mutate({ id: project.id });
                              }
                            }}
                            className="p-1.5 border border-foreground/10 hover:border-red-500/30 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                            title="Delete Project"
                            disabled={deleteProjectMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-2.5 truncate">
                          {project.name}
                        </h3>
                        <p className="text-muted-foreground text-sm font-sans leading-relaxed line-clamp-3 font-normal">
                          {project.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 pt-5 border-t border-foreground/8">
                        <Link href={`/projects/${project.id}`} className="w-full block">
                          <Button
                            variant="ghost"
                            className="w-full justify-between rounded-none h-10 px-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-transparent group/btn transition-all cursor-pointer"
                          >
                            <span>Open Workspace</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Pipeline Tab (Active Features Kanban) ─────────────────────── */}
        {activeTab === "pipeline" && (
          <div className="p-8 lg:p-12 animate-in fade-in duration-200">
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>Workflow Board</span>
                <span className="opacity-40">/</span>
                <span>Feature Pipeline</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9]">
                Feature Delivery<br />Pipeline
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Visual engineering board. Monitor features across five development stages from initial request to production shipping.
              </p>
            </header>

            {isLoadingAllFeatures ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Spinner className="h-6 w-6 text-foreground" />
                <p className={`${LABEL_CLS} animate-pulse`}>Syncing workflow state...</p>
              </div>
            ) : !allFeatures || allFeatures.length === 0 ? (
              <div className="border border-foreground/10 p-20 text-center max-w-lg mx-auto flex flex-col items-center gap-7 mt-4">
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02]">
                  <Workflow className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight mb-3">No Features Active</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto font-sans font-normal">
                    Create a feature inside any of your project workspaces to see the delivery pipeline come alive.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {[
                  {
                    title: "01 // Intake",
                    desc: "Context gathering",
                    items: allFeatures.filter(f => f.status === "intake")
                  },
                  {
                    title: "02 // Specs & PRD",
                    desc: "Scope validation",
                    items: allFeatures.filter(f => ["prd_review", "prd_approved", "educated"].includes(f.status))
                  },
                  {
                    title: "03 // Coding",
                    desc: "Branch & code generation",
                    items: allFeatures.filter(f => ["tasks_breakdown", "plan_approved"].includes(f.status))
                  },
                  {
                    title: "04 // Review & Audit",
                    desc: "AI-powered review checks",
                    items: allFeatures.filter(f => ["pr_review", "fixes_submitted", "release_review", "release_approved", "release_rejected"].includes(f.status))
                  },
                  {
                    title: "05 // Shipped",
                    desc: "Live in production",
                    items: allFeatures.filter(f => f.status === "shipped")
                  }
                ].map((col, idx) => (
                  <div key={idx} className="flex flex-col min-w-[250px] border border-foreground/10 bg-foreground/[0.01] p-4 space-y-4">
                    <div className="border-b border-foreground/10 pb-2">
                      <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-foreground">{col.title}</h3>
                      <p className="text-[10px] font-sans text-muted-foreground mt-0.5">{col.desc} ({col.items.length})</p>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                      {col.items.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-foreground/5 text-muted-foreground text-[10px] font-mono">
                          EMPTY_STAGE
                        </div>
                      ) : (
                        col.items.map((feat) => (
                          <div key={feat.id} className="border border-foreground/10 bg-background p-4 hover:border-foreground/30 transition-all space-y-3 relative group">
                            <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div>
                              <span className="text-[9px] font-mono uppercase text-muted-foreground block truncate">{feat.projectName}</span>
                              <h4 className="text-xs font-bold uppercase tracking-tight text-foreground mt-0.5 line-clamp-1">{feat.title}</h4>
                            </div>
                            <p className="text-[10px] font-sans text-muted-foreground line-clamp-2 leading-relaxed">{feat.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-foreground/5 text-[9px] font-mono">
                              <span className="bg-foreground/5 text-foreground py-0.5 px-1.5 uppercase font-semibold">
                                {feat.status.replace("_", " ")}
                              </span>
                              <Link href={`/features/${feat.id}`}>
                                <span className="hover:text-foreground text-muted-foreground underline cursor-pointer">Inspect Spec</span>
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AI Reviews Tab ──────────────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="p-8 lg:p-12 animate-in fade-in duration-200">
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>Audit Console</span>
                <span className="opacity-40">/</span>
                <span>Code Reviews</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9]">
                AI Code Reviews
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Browse detailed AI reviews performed on pull requests, displaying severity indicators and lines audit.
              </p>
            </header>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by feature or project name..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="pl-9 rounded-none border-foreground/20 focus:border-foreground text-sm h-9 bg-background"
                />
              </div>
              <div className="flex flex-wrap gap-1 bg-foreground/5 p-0.5 border border-foreground/10">
                {(["all", "passed", "changes_requested", "pending"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      reviewFilter === f
                        ? "bg-foreground text-background font-bold"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingAllAiReviews ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Spinner className="h-6 w-6 text-foreground" />
                <p className={`${LABEL_CLS} animate-pulse`}>Loading audit reports...</p>
              </div>
            ) : !allAiReviews || allAiReviews.length === 0 ? (
              <div className="border border-foreground/10 p-20 text-center max-w-lg mx-auto flex flex-col items-center gap-7 mt-4">
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02]">
                  <Bot className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight mb-3">No AI Reviews Executed</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto font-sans font-normal">
                    AI reviews will appear here once features transition into branch development and reviews are run.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {allAiReviews
                  .filter((rev) => {
                    const matchesSearch =
                      rev.featureTitle.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      rev.projectName.toLowerCase().includes(reviewSearch.toLowerCase());
                    const matchesFilter =
                      reviewFilter === "all" || rev.status === reviewFilter;
                    return matchesSearch && matchesFilter;
                  })
                  .map((rev) => (
                    <div key={rev.id} className="border border-foreground/10 bg-foreground/[0.01] hover:border-foreground/20 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`${LABEL_CLS} text-muted-foreground text-[9px]`}>{rev.projectName}</span>
                          <span className="text-foreground/20 text-[9px] font-mono">•</span>
                          <span className="text-muted-foreground text-[9px] font-mono">PR #{rev.prNumber || "Web"}</span>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-tight text-foreground">{rev.featureTitle}</h3>
                        <p className="text-[11px] font-mono text-muted-foreground">{rev.prTitle}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block size-2 rounded-full ${
                            rev.status === "passed" ? "bg-emerald-500 animate-pulse" :
                            rev.status === "changes_requested" ? "bg-red-500 animate-pulse" : "bg-amber-500 animate-pulse"
                          }`} />
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-foreground">
                            {rev.status.replace("_", " ")}
                          </span>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className={`${BTN_MONO} h-8 text-[9px] px-3 cursor-pointer`}>
                              Inspect Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[700px] bg-background border border-foreground/20 rounded-none p-7 text-foreground font-sans max-h-[85vh] overflow-y-auto">
                            <DialogHeader className="mb-6 pb-4 border-b border-foreground/10">
                              <DialogTitle className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                                <Bot className="h-5 w-5 text-foreground" />
                                <span>AI Review Report</span>
                              </DialogTitle>
                              <DialogDescription className="text-xs text-muted-foreground font-mono mt-1">
                                Feature: {rev.featureTitle} | Project: {rev.projectName}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              <div>
                                <h4 className={LABEL_CLS + " mb-2"}>Review Summary</h4>
                                <div className="p-4 border border-foreground/10 bg-foreground/[0.02] font-sans text-sm leading-relaxed whitespace-pre-wrap">
                                  {rev.summary || "No review summary available."}
                                </div>
                              </div>

                              <div>
                                <h4 className={LABEL_CLS + " mb-2"}>Line-Level Findings ({Array.isArray(rev.comments) ? rev.comments.length : 0})</h4>
                                <div className="space-y-3">
                                  {Array.isArray(rev.comments) && rev.comments.length > 0 ? (
                                    rev.comments.map((comment: any, cIdx: number) => (
                                      <div key={cIdx} className="border border-foreground/10 bg-background p-4 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-mono border-b border-foreground/5 pb-1.5">
                                          <span className="text-foreground font-bold truncate max-w-[400px]">{comment.filepath} (Line {comment.line})</span>
                                          <span className={`px-1.5 py-0.5 uppercase text-[8px] font-bold ${
                                            comment.type === "error" ? "bg-red-500/10 text-red-500" :
                                            comment.type === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                                          }`}>
                                            {comment.type}
                                          </span>
                                        </div>
                                        <p className="text-xs text-foreground/80 font-sans leading-relaxed pt-1">{comment.text}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-6 border border-dashed border-foreground/10 text-muted-foreground text-xs font-mono">
                                      NO_ISSUES_FOUND — CODE PASSED CHECKOUT
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── Activity Tab ────────────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <div className="p-8 lg:p-12 animate-in fade-in duration-200">
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>Timeline Feed</span>
                <span className="opacity-40">/</span>
                <span>System Operations</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9]">
                Activity Log
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Unified audit feed tracking system actions: features generated, reviews triggered, pull requests linked, and deploy statuses.
              </p>
            </header>

            <div className="relative w-full md:w-80 mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search activity events..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="pl-9 rounded-none border-foreground/20 focus:border-foreground text-sm h-9 bg-background"
              />
            </div>

            {/* Event Timeline */}
            <div className="relative border-l border-foreground/10 pl-6 ml-3 space-y-8 py-2">
              {[
                { type: "prd", label: "Spec Generated", text: "AI generated PRD for authentication enhancements.", user: "Gemini Pro", time: "10 mins ago", icon: <FileCode className="h-3 w-3 text-emerald-500" /> },
                { type: "pr", label: "Branch Committed", text: "Committed 2 files to branch feature/auth-updates on github.", user: "Velocity App", time: "15 mins ago", icon: <GitCommit className="h-3 w-3 text-blue-500" /> },
                { type: "review", label: "AI Review Audit", text: "AI Review triggered automatically for PR #1. Status: Passed.", user: "Gemini Flash", time: "22 mins ago", icon: <Bot className="h-3 w-3 text-purple-500" /> },
                { type: "deploy", label: "Deploy Success", text: "Deployed main branch successfully to staging server.", user: "Build Machine", time: "1 hour ago", icon: <Rocket className="h-3 w-3 text-cyan-500" /> },
                { type: "project", label: "Project Created", text: "Project 'Workspace CRM' created and linked to repository.", user: "Abhinav Bist", time: "3 hours ago", icon: <Kanban className="h-3 w-3 text-amber-500" /> }
              ]
                .filter(ev => ev.label.toLowerCase().includes(activitySearch.toLowerCase()) || ev.text.toLowerCase().includes(activitySearch.toLowerCase()))
                .map((ev, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[31px] top-1 bg-background border border-foreground/20 size-6 flex items-center justify-center rounded-none group-hover:border-foreground transition-colors">
                      {ev.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                        <span className="text-foreground font-bold uppercase">{ev.label}</span>
                        <span>•</span>
                        <span>{ev.time}</span>
                      </div>
                      <p className="text-sm font-sans text-foreground/80">{ev.text}</p>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase pt-1">
                        Triggered By: <span className="text-foreground">{ev.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── GitHub Hub Tab ──────────────────────────────────────────────── */}
        {activeTab === "github" && (
          <div className="p-8 lg:p-12 animate-in fade-in duration-200">
            {/* Header */}
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>Developer Console</span>
                <span className="opacity-40">/</span>
                <span>GitHub Orchestrator</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9] flex items-center gap-4">
                <Github className="h-9 w-9 text-foreground shrink-0" />
                <span>GitHub<br />Developer Deck</span>
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Execute Git operations, trigger pull requests, run comparative diff audits, and review repository contribution stats.
              </p>
            </header>

            {isSessionPending ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Spinner className="h-6 w-6 text-foreground" />
                <p className={`${LABEL_CLS} animate-pulse`}>Checking GitHub credentials...</p>
              </div>
            ) : !session ? (
              /* GitHub Sign-in */
              <div className="max-w-md mx-auto border border-foreground/15 bg-foreground/[0.02] p-10 text-center space-y-7 relative overflow-hidden">
                <div className="h-[2px] w-full bg-foreground absolute top-0 left-0" />
                <div className="size-14 mx-auto bg-foreground/5 border border-foreground/10 flex items-center justify-center relative">
                  <Github className="h-7 w-7 text-foreground" />
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 absolute -top-1.5 -right-1.5" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-base font-bold uppercase tracking-tight text-foreground">GitHub Account Not Linked</h2>
                  <p className="text-muted-foreground text-sm font-sans leading-relaxed font-normal">
                    To trigger pull request analytics, review git logs, and perform repo sync operations, link your GitHub profile first.
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await authClient.signIn.social({ provider: "github", callbackURL: window.location.href });
                    } catch (e: any) { toast.error(`GitHub login failed: ${e.message || e}`); }
                  }}
                  className={`${BTN_MONO} w-full h-11 gap-2 cursor-pointer`}
                >
                  <Github className="h-4 w-4 fill-background text-background shrink-0" />
                  <span>Link GitHub Profile</span>
                </Button>
              </div>
            ) : (
              /* Connected Workspace */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">

                {/* ── Left Column: Profile + Repo + Sub-tabs ── */}
                <div className="lg:col-span-1 space-y-5">

                  {/* Profile */}
                  <div className="border border-foreground/10 bg-foreground/[0.02]">
                    <div className="px-4 py-3 border-b border-foreground/8">
                      <span className={LABEL_CLS}>GitHub Profile</span>
                    </div>
                    <div className="px-4 py-4 flex items-center gap-3">
                      {session.user.image ? (
                        <img src={session.user.image} alt="Avatar" className="h-9 w-9 border border-foreground/10 shrink-0 object-cover" />
                      ) : (
                        <div className="h-9 w-9 border border-foreground/10 bg-foreground/5 flex items-center justify-center text-[11px] font-bold shrink-0">GH</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm uppercase text-foreground leading-tight truncate">{session.user.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-sans">{session.user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Repo Selector */}
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>
                      Select Repository {isLoadingRepos && <span className="opacity-60">(Loading...)</span>}
                    </label>
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-full border border-foreground/15 bg-background text-sm font-mono p-2.5 focus-visible:outline-none focus-visible:border-foreground"
                      disabled={isLoadingRepos}
                    >
                      {githubRepos.length > 0 ? (
                        githubRepos.map((repo) => (
                          <option key={repo.id} value={repo.fullName}>
                            {repo.fullName} {repo.private ? "🔒" : "🌐"}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="abhinavbist/velocity">abhinavbist/velocity (Mock)</option>
                          <option value="abhinavbist/shipflow-agent">abhinavbist/shipflow-agent (Mock)</option>
                          <option value="abhinavbist/gemini-autocoder">abhinavbist/gemini-autocoder (Mock)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Sub-tabs */}
                  <nav className="flex flex-col gap-px bg-foreground/8">
                    {subTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedSubTab(tab.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-mono uppercase tracking-wider text-left transition-all ${
                          selectedSubTab === tab.id
                            ? "bg-foreground text-background font-bold"
                            : "bg-background text-muted-foreground hover:bg-foreground/4 hover:text-foreground"
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* ── Right Column: Console Panel ── */}
                <div className="lg:col-span-3 flex flex-col border border-foreground/10 bg-background min-h-[640px]">
                  {/* Console header */}
                  <div className="border-b border-foreground/10 px-6 py-4 flex items-center justify-between bg-foreground/[0.02]">
                    <div>
                      <div className="font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                        {consoleTitles[selectedSubTab]}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        target: <span className="text-foreground">{selectedRepo}</span>
                      </div>
                    </div>
                    <Badge className="bg-foreground text-background rounded-none text-[9px] uppercase tracking-wider font-mono px-2.5 py-1">
                      Connected
                    </Badge>
                  </div>

                  {/* Console content */}
                  <div className="p-6 flex-1 overflow-y-auto space-y-6">

                    {/* TAB 1: PR & ISSUES */}
                    {selectedSubTab === "pr" && (
                      <div className="space-y-5">
                        {/* Create Issue */}
                        <div className={PANEL_CLS}>
                          <h3 className={PANEL_HDR}>
                            <Info className="h-3.5 w-3.5" />
                            <span>createIssue()</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              placeholder="Issue Title"
                              value={issueTitle}
                              onChange={(e) => setIssueTitle(e.target.value)}
                              className="rounded-none border-foreground/15 bg-background sm:col-span-1 text-sm h-9"
                            />
                            <Input
                              placeholder="Issue Body / Description"
                              value={issueBody}
                              onChange={(e) => setIssueBody(e.target.value)}
                              className="rounded-none border-foreground/15 bg-background sm:col-span-2 text-sm h-9"
                            />
                          </div>
                          <Button
                            onClick={() => {
                              if (!issueTitle.trim()) { toast.error("Issue title is required"); return; }
                              toast.success(`[GitHub] createIssue() → 201 Created. Issue #108: "${issueTitle}" opened.`);
                              setIssueTitle(""); setIssueBody("");
                            }}
                            className={`${BTN_MONO} h-9 px-5`}
                          >
                            Execute createIssue()
                          </Button>
                        </div>

                        {/* Create PR */}
                        <div className={PANEL_CLS}>
                          <h3 className={PANEL_HDR}>
                            <GitPullRequest className="h-3.5 w-3.5" />
                            <span>createPullRequest()</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              placeholder="PR Title"
                              value={prTitle}
                              onChange={(e) => setPrTitle(e.target.value)}
                              className="rounded-none border-foreground/15 bg-background sm:col-span-2 text-sm h-9"
                            />
                            <Input
                              placeholder="From Branch"
                              value={prBranch}
                              onChange={(e) => setPrBranch(e.target.value)}
                              className="rounded-none border-foreground/15 bg-background sm:col-span-1 text-sm h-9"
                            />
                          </div>
                          <Button
                            onClick={() => {
                              if (!prTitle.trim()) { toast.error("PR title is required"); return; }
                              toast.success(`[GitHub] createPullRequest() → 200 OK. PR #45 from "${prBranch}" to "main".`);
                              setPrTitle("");
                            }}
                            className={`${BTN_MONO} h-9 px-5`}
                          >
                            Execute createPullRequest()
                          </Button>
                        </div>

                        {/* Merge + Release */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/8">
                          <div className={`${PANEL_CLS} space-y-4`}>
                            <h3 className={PANEL_HDR}>
                              <GitMerge className="h-3.5 w-3.5" />
                              <span>mergePullRequest()</span>
                            </h3>
                            <p className="text-sm text-muted-foreground font-sans leading-relaxed font-normal">
                              Merges PR #45 into branch main, committing all generated code.
                            </p>
                            <Button
                              onClick={() => toast.success("[GitHub] mergePullRequest() → 200 SUCCESS. Commit merged: d3c4b9a into main.")}
                              className={`${BTN_MONO} h-9 px-5`}
                            >
                              Execute mergePullRequest()
                            </Button>
                          </div>
                          <div className={`${PANEL_CLS} space-y-4`}>
                            <h3 className={PANEL_HDR}>
                              <Tag className="h-3.5 w-3.5" />
                              <span>createRelease()</span>
                            </h3>
                            <div className="flex items-center gap-2">
                              <Input
                                value={releaseTag}
                                onChange={(e) => setReleaseTag(e.target.value)}
                                className="rounded-none border-foreground/15 bg-background text-sm h-9 max-w-[120px] font-mono"
                              />
                              <Button
                                onClick={() => toast.success(`[GitHub] createRelease() → 201 Created. Tag ${releaseTag} published.`)}
                                className={`${BTN_MONO} h-9 px-4`}
                              >
                                Execute
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: CODE REVIEW */}
                    {selectedSubTab === "review" && (
                      <div className="space-y-5">
                        <div className={PANEL_CLS}>
                          <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Code Review Audit Flow</span>
                            </h3>
                            <span className="text-[9px] font-mono text-muted-foreground">listPullRequests() · getPullRequestFiles()</span>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className={LABEL_CLS}>
                                Select Open Pull Request {isLoadingPulls && <span className="opacity-60">(Loading...)</span>}
                              </label>
                              <select
                                value={selectedPrNumber || ""}
                                onChange={(e) => setSelectedPrNumber(Number(e.target.value) || null)}
                                className="w-full border border-foreground/15 bg-background text-sm font-sans p-2.5 focus-visible:outline-none focus-visible:border-foreground"
                                disabled={isLoadingPulls || activePulls.length === 0}
                              >
                                {activePulls.length > 0 ? (
                                  activePulls.map((pr) => (
                                    <option key={pr.id} value={pr.number}>
                                      PR #{pr.number}: {pr.title} (by @{pr.user})
                                    </option>
                                  ))
                                ) : (
                                  <option value="">No open pull requests found</option>
                                )}
                              </select>
                            </div>
                            <div className="pl-3 text-xs space-y-1.5 text-muted-foreground border-l-2 border-foreground/10 py-1">
                              <p className={`${LABEL_CLS} text-foreground`}>// Changed Files (getPullRequestFiles()):</p>
                              {isLoadingFiles ? (
                                <p className="animate-pulse text-[11px]">Loading modified files...</p>
                              ) : prFiles.length > 0 ? (
                                prFiles.map((file, i) => (
                                  <p key={i} className="flex items-center gap-2 truncate text-[11px]">
                                    <FileCode className="h-3.5 w-3.5 text-foreground shrink-0" />
                                    <span className="truncate">{file.filepath}</span>
                                    <span className="text-[9px] px-1.5 bg-foreground/8 uppercase shrink-0 font-mono">{file.status}</span>
                                    {file.additions !== undefined && <span className="text-emerald-500 shrink-0 font-bold text-[10px]">+{file.additions}</span>}
                                    {file.deletions !== undefined && <span className="text-red-500 shrink-0 font-bold text-[10px]">-{file.deletions}</span>}
                                  </p>
                                ))
                              ) : (
                                <p className="text-[11px] italic">No changed files detected.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* AI RAG */}
                        <div className={PANEL_CLS}>
                          <h3 className={PANEL_HDR}>
                            <span>Generate AI Review — RAG (Pinecone + Gemini)</span>
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed font-sans font-normal">
                            Fetches the PR's unified diff from GitHub, chunks and vector-indexes it in Pinecone, runs retrieval query matches, analyzes with Gemini, and submits inline comments back to GitHub.
                          </p>
                          <Button
                            onClick={async () => {
                              if (!selectedPrNumber) { toast.warning("Please select a pull request first"); return; }
                              setIsGeneratingReview(true);
                              try {
                                const res = await fetch("/api/github/pulls/review", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ repoFullName: selectedRepo, prNumber: selectedPrNumber }),
                                });
                                if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Failed to generate AI review"); }
                                const review = await res.json();
                                toast.success(`[AI Auditor] Review generated. Status: ${review.status.toUpperCase()}. Comments submitted to GitHub.`);
                              } catch (err: any) {
                                toast.error(`AI Audit failed: ${err.message}`);
                              } finally { setIsGeneratingReview(false); }
                            }}
                            disabled={isGeneratingReview || !selectedPrNumber}
                            className={`${BTN_MONO} w-full h-10`}
                          >
                            {isGeneratingReview ? "Running RAG & AI Audit..." : "Run AI RAG Audit & Submit"}
                          </Button>
                        </div>

                        {/* Manual Review */}
                        <div className={PANEL_CLS}>
                          <h3 className={PANEL_HDR}>
                            <span>Manual Review & Sign-Off Override</span>
                          </h3>
                          <Textarea
                            placeholder="Enter review comments / audit details..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="rounded-none border-foreground/15 bg-background text-sm font-sans resize-none"
                            rows={3}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => {
                                if (!reviewComment.trim()) { toast.error("Please add a review comment first"); return; }
                                toast.success(`[GitHub] createReview() on PR #${selectedPrNumber || 45}: "${reviewComment}"`);
                                setReviewComment("");
                              }}
                              disabled={!selectedPrNumber}
                              className="rounded-none text-[10px] uppercase font-mono tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-9 px-4"
                            >
                              Request Changes
                            </Button>
                            <Button
                              onClick={() => toast.success(`[GitHub] approveReview() PR #${selectedPrNumber || 45} approved.`)}
                              disabled={!selectedPrNumber}
                              className="rounded-none text-[10px] uppercase font-mono tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 h-9 px-4"
                            >
                              Approve PR #{selectedPrNumber || 45}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: DIFF ANALYSIS */}
                    {selectedSubTab === "diff" && (
                      <div className="space-y-5">
                        <div className={PANEL_CLS}>
                          <h3 className={PANEL_HDR}>
                            <GitBranch className="h-3.5 w-3.5" />
                            <span>compareBranches() · getPullRequestDiffStats()</span>
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 border border-foreground/15 px-2.5 py-1.5 bg-background">
                              <span className={`${LABEL_CLS} mr-1`}>Base:</span>
                              <input
                                value={compareBase}
                                onChange={(e) => setCompareBase(e.target.value)}
                                className="bg-transparent border-none focus:outline-none w-[60px] text-xs font-mono"
                              />
                            </div>
                            <span className="text-muted-foreground text-sm">←</span>
                            <div className="flex items-center gap-1 border border-foreground/15 px-2.5 py-1.5 bg-background">
                              <span className={`${LABEL_CLS} mr-1`}>Head:</span>
                              <input
                                value={compareHead}
                                onChange={(e) => setCompareHead(e.target.value)}
                                className="bg-transparent border-none focus:outline-none w-[160px] text-xs font-mono"
                              />
                            </div>
                            <Button
                              onClick={() => toast.success("[GitHub] compareBranches() → Found: 3 commits, 2 files changed.")}
                              className={`${BTN_MONO} h-8 px-4`}
                            >
                              Run compareBranches()
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
                            <span>getPullRequestDiff() output:</span>
                            <span className="text-emerald-500 font-bold">+128 / -12 lines</span>
                          </div>
                          <pre className="border border-foreground/10 bg-foreground/[0.02] p-4 text-[10px] font-mono text-emerald-400/90 whitespace-pre overflow-x-auto leading-relaxed h-[200px]">
{`diff --git a/apps/web/app/page.tsx b/apps/web/app/page.tsx
index 8fd34b9..c298fe2 100644
--- a/apps/web/app/page.tsx
+++ b/apps/web/app/page.tsx
@@ -24,6 +24,18 @@ export default function Home() {
   return (
     <main className="min-h-screen bg-background text-foreground">
+      {/* Hero Welcome banner */}
+      <div className="py-20 border-b border-border bg-card/40">
+        <h1 className="text-4xl font-extrabold uppercase">Welcome home</h1>
+        <p className="text-muted-foreground text-sm">Active project workspace initialized.</p>
+      </div>
   );
 }`}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: PUSH/PULL */}
                    {selectedSubTab === "ops" && (
                      <div className="space-y-5">
                        <div className={PANEL_CLS}>
                          <h3 className={PANEL_HDR}>
                            <GitCommit className="h-3.5 w-3.5" />
                            <span>pushCommit()</span>
                          </h3>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Commit message (e.g. feat: integrate home page)"
                              value={commitMessage}
                              onChange={(e) => setCommitMessage(e.target.value)}
                              className="rounded-none border-foreground/15 bg-background text-sm h-9"
                            />
                            <Button
                              onClick={() => {
                                if (!commitMessage.trim()) { toast.error("Commit message is required"); return; }
                                toast.success(`[Git] pushCommit() → Pushed 4c89b2a to heads/${compareHead}`);
                                setCommitMessage("");
                              }}
                              className={`${BTN_MONO} h-9 px-4 shrink-0`}
                            >
                              pushCommit()
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/8">
                          {[
                            { icon: <RefreshCw className="h-3.5 w-3.5" />, fn: "fetchLatestCommits()", desc: "Checks for remote revisions on main.", action: () => toast.success("[Git] fetchLatestCommits() → Workspace fully synced with origin."), label: "Fetch" },
                            { icon: <ArrowRight className="h-3.5 w-3.5 rotate-90" />, fn: "pullLatestChanges()", desc: "Pulls latest origin commits to local repo.", action: () => toast.success("[Git] pullLatestChanges() → Pull complete. 0 files modified."), label: "Pull" },
                            { icon: <RefreshCw className="h-3.5 w-3.5" />, fn: "syncForkedRepository()", desc: "Sync upstream updates to fork.", action: () => toast.success("[GitHub] syncForkedRepository() → Upstream main synced."), label: "Sync Fork" },
                          ].map((item, i) => (
                            <div key={i} className={`${PANEL_CLS} space-y-3`}>
                              <h4 className="text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 text-foreground">
                                {item.icon}
                                <span>{item.fn}</span>
                              </h4>
                              <p className="text-[11px] text-muted-foreground font-sans font-normal">{item.desc}</p>
                              <Button onClick={item.action} className={`${BTN_GHOST} h-8 px-4`}>{item.label}</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 5: ANALYTICS */}
                    {selectedSubTab === "analytics" && (
                      <div className="space-y-5">
                        {/* Stat bento */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-foreground/8">
                          {[
                            { fn: "getCloneStats()", label: "Clones",    value: "284",   sub: "14-Day Traffic",  ok: true },
                            { fn: "getCloneStats()", label: "Cloners",   value: "94",    sub: "Unique Profiles", ok: false },
                            { fn: "getViewStats()",  label: "Pageviews", value: "1,294", sub: "Views (14 Days)", ok: true },
                            { fn: "getViewStats()",  label: "Visitors",  value: "394",   sub: "Unique Hosts",    ok: false },
                          ].map((stat, i) => (
                            <div key={i} className="bg-background p-5 text-center space-y-2">
                              <p className={`${LABEL_CLS} leading-tight`}>{stat.fn}<br />{stat.label}</p>
                              <p className="text-4xl font-black text-foreground leading-none">{stat.value}</p>
                              <span className={`text-[10px] font-mono block ${stat.ok ? "text-emerald-500" : "text-muted-foreground"}`}>{stat.sub}</span>
                            </div>
                          ))}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/8">
                          {/* Commits bar */}
                          <div className={`${PANEL_CLS} space-y-4`}>
                            <h4 className={PANEL_HDR}>
                              <BarChart2 className="h-3.5 w-3.5" />
                              <span>getContributionStats() — Last 7 Days</span>
                            </h4>
                            <div className="h-32 flex items-end gap-1.5 pt-4">
                              {[12, 19, 3, 5, 2, 24, 15].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                  <div
                                    className="w-full bg-foreground hover:bg-foreground/70 transition-all cursor-pointer"
                                    style={{ height: `${(val / 25) * 100}px` }}
                                    title={`${val} commits`}
                                  />
                                  <span className="text-[8px] text-muted-foreground font-mono">D{idx + 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Code frequency */}
                          <div className={`${PANEL_CLS} space-y-4`}>
                            <h4 className={PANEL_HDR}>
                              <TrendingUp className="h-3.5 w-3.5" />
                              <span>getCodeFrequency() — 14 Days</span>
                            </h4>
                            <div className="space-y-4 pt-1">
                              {[
                                { label: "Additions", value: "+12,482 lines", pct: "76%", color: "bg-emerald-500", cls: "text-emerald-500" },
                                { label: "Deletions", value: "-3,921 lines",  pct: "24%", color: "bg-red-500",     cls: "text-red-500" },
                              ].map((row, i) => (
                                <div key={i} className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className={`font-bold uppercase ${row.cls}`}>{row.label}</span>
                                    <span className="text-muted-foreground">{row.value}</span>
                                  </div>
                                  <div className="w-full h-2 bg-foreground/8 border border-foreground/8">
                                    <div className={`${row.color} h-full`} style={{ width: row.pct }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Punch card */}
                        <div className={`${PANEL_CLS} space-y-4`}>
                          <h4 className={PANEL_HDR}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>getPunchCard() — Commit Frequency Density</span>
                          </h4>
                          <div className="overflow-x-auto">
                            <div className="min-w-[480px] grid grid-rows-7 gap-1 font-mono text-[9px]">
                              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dIdx) => (
                                <div key={day} className="flex items-center gap-1.5">
                                  <span className="w-7 text-muted-foreground font-bold uppercase shrink-0">{day}</span>
                                  <div className="flex-1 flex gap-0.5">
                                    {Array.from({ length: 24 }).map((_, hIdx) => {
                                      const val = (dIdx * hIdx) % 5;
                                      const colorClass =
                                        val === 4 ? "bg-emerald-500" :
                                        val === 3 ? "bg-emerald-600/80" :
                                        val === 2 ? "bg-emerald-700/60" :
                                        val === 1 ? "bg-emerald-800/30" : "bg-foreground/6";
                                      return (
                                        <div
                                          key={hIdx}
                                          className={`flex-1 aspect-square ${colorClass}`}
                                          title={`${day} @ ${hIdx}:00 → density: ${val}`}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-[8px] text-muted-foreground font-mono uppercase pt-2 max-w-[480px] ml-9">
                              <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Console footer */}
                  <div className="border-t border-foreground/8 px-6 py-3 flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-foreground/[0.01]">
                    <Terminal className="h-3.5 w-3.5 shrink-0" />
                    <span className="terminal-cursor">Ready for git callbacks on {selectedRepo}. Listening to webhook payloads</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Webhooks Tab ────────────────────────────────────────────────── */}
        {activeTab === "webhooks" && (
          <div className="p-8 lg:p-12 animate-in fade-in duration-200">
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>Git Callbacks</span>
                <span className="opacity-40">/</span>
                <span>Webhooks Dashboard</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9]">
                Webhook Deck
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Inspect GitHub webhooks configuration, verify integration payloads, and simulate pull request callbacks.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Webhook Configuration */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`${PANEL_CLS} relative overflow-hidden`}>
                  <div className="h-[2px] w-full bg-emerald-500 absolute top-0 left-0" />
                  <h3 className={PANEL_HDR}>
                    <Network className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Configuration Payload Endpoint</span>
                  </h3>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Payload URL</span>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={typeof window !== "undefined" ? `${window.location.origin}/api/github/webhook` : "http://localhost:3000/api/github/webhook"}
                          className="font-mono text-xs rounded-none bg-background border-foreground/10 select-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">Content Type</span>
                        <div className="text-xs font-mono bg-foreground/5 border border-foreground/10 p-2 text-foreground font-bold">
                          application/json
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">Secret Status</span>
                        <div className="text-xs font-mono bg-foreground/5 border border-foreground/10 p-2 text-foreground flex items-center justify-between">
                          <span>CONFIGURED</span>
                          <Lock className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook History */}
                <div className="space-y-4">
                  <h3 className={LABEL_CLS}>Recent Webhook Event Logs</h3>
                  <div className="border border-foreground/10 bg-background divide-y divide-foreground/10">
                    {webhookEvents.map(evt => (
                      <div key={evt.id} className="p-4 flex items-center justify-between text-xs font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground uppercase">{evt.event}</span>
                            <span className="text-muted-foreground text-[10px]">{evt.timestamp}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{evt.repo} - {evt.pr}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 uppercase text-[9px] font-bold ${
                          evt.status === "processed" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        }`}>{evt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Webhook Simulation Trigger */}
              <div className={`${PANEL_CLS} relative overflow-hidden self-start`}>
                <div className="h-[2px] w-full bg-blue-500 absolute top-0 left-0" />
                <h3 className={PANEL_HDR}>
                  <Sliders className="h-3.5 w-3.5 text-blue-500" />
                  <span>Simulate GitHub Webhook</span>
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Repository Target</label>
                    <select
                      value={webhookRepo}
                      onChange={(e) => setWebhookRepo(e.target.value)}
                      className="w-full border border-foreground/20 bg-background text-xs font-mono p-2 focus:border-foreground"
                    >
                      <option value="">Select repository context</option>
                      {projects?.map(p => (
                        <option key={p.id} value={p.githubRepo}>{p.githubRepo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Webhook Event Action</label>
                    <select
                      value={webhookAction}
                      onChange={(e) => setWebhookAction(e.target.value as any)}
                      className="w-full border border-foreground/20 bg-background text-xs font-mono p-2 focus:border-foreground"
                    >
                      <option value="opened">pull_request.opened</option>
                      <option value="synchronize">pull_request.synchronize</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Branch Name</label>
                    <Input
                      value={webhookBranch}
                      onChange={(e) => setWebhookBranch(e.target.value)}
                      placeholder="e.g. feature/my-auth"
                      className="font-mono text-xs rounded-none border-foreground/20 bg-background h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>PR Title</label>
                    <Input
                      value={webhookPrTitle}
                      onChange={(e) => setWebhookPrTitle(e.target.value)}
                      placeholder="e.g. feat: add auth database"
                      className="font-mono text-xs rounded-none border-foreground/20 bg-background h-9"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      if (!webhookRepo) {
                        toast.warning("Please select a repository to simulate webhook.");
                        return;
                      }
                      setIsSimulatingWebhook(true);
                      setWebhookSimResult(null);
                      try {
                        const payloadBody = {
                          action: webhookAction,
                          pull_request: {
                            number: parseInt(webhookPrNum) || 1,
                            title: webhookPrTitle,
                            head: { ref: webhookBranch },
                            html_url: `https://github.com/${webhookRepo}/pull/${webhookPrNum}`
                          },
                          repository: {
                            full_name: webhookRepo
                          }
                        };

                        const res = await fetch("/api/github/webhook", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "x-github-event": "pull_request",
                            "x-hub-signature-256": "sha256=MOCK_CLIENT_SIMULATION"
                          },
                          body: JSON.stringify(payloadBody)
                        });
                        
                        const result = await res.json();
                        setWebhookSimResult(result);
                        
                        if (res.ok) {
                          toast.success("Webhook POST dispatched successfully!");
                          setWebhookEvents(prev => [
                            {
                              id: "we-" + Date.now(),
                              event: `pull_request.${webhookAction}`,
                              repo: webhookRepo,
                              pr: `PR #${webhookPrNum} (${webhookBranch})`,
                              status: "processed",
                              timestamp: "Just now"
                            },
                            ...prev
                          ]);
                        } else {
                          throw new Error(result.error || "Simulation response error code.");
                        }
                      } catch (err: any) {
                        console.error(err);
                        setWebhookSimResult({ error: err.message, status: "signature_fail_bypass_needed" });
                        toast.error(`Simulation returned failure: ${err.message}`);
                      } finally {
                        setIsSimulatingWebhook(false);
                      }
                    }}
                    disabled={isSimulatingWebhook}
                    className={`${BTN_MONO} w-full h-9 cursor-pointer`}
                  >
                    {isSimulatingWebhook ? "Dispatching Payload..." : "Simulate Webhook POST"}
                  </Button>

                  {webhookSimResult && (
                    <div className="pt-2">
                      <span className={LABEL_CLS}>Response Log</span>
                      <pre className="p-3 border border-foreground/10 bg-foreground/[0.03] text-[9px] font-mono max-h-36 overflow-auto mt-1 whitespace-pre-wrap">
                        {JSON.stringify(webhookSimResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Deployments Tab ────────────────────────────────────────────── */}
        {activeTab === "deployments" && (
          <div className="p-8 lg:p-12 animate-in fade-in duration-200">
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>Server Cockpit</span>
                <span className="opacity-40">/</span>
                <span>Production Environments</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9]">
                Deployments
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Trigger manual staging builds, inspect environment configurations, and audit deployment histories.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Environments */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staging environment */}
                  <div className="border border-foreground/10 p-5 bg-foreground/[0.01] space-y-4 relative">
                    <div className="absolute right-4 top-4 flex items-center gap-1.5">
                      <span className="size-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-mono font-bold uppercase text-emerald-500">LIVE</span>
                    </div>
                    <div>
                      <span className={LABEL_CLS}>Subdomain / Sandbox</span>
                      <h3 className="text-sm font-bold uppercase mt-0.5">staging.velocity.dev</h3>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground divide-y divide-foreground/5 pt-1">
                      <div className="py-1.5 flex justify-between"><span>Active Branch</span><span className="text-foreground">staging</span></div>
                      <div className="py-1.5 flex justify-between"><span>SSL Status</span><span className="text-foreground">SECURE</span></div>
                      <div className="py-1.5 flex justify-between"><span>Commit SHA</span><span className="text-foreground">a8e9f2d</span></div>
                    </div>
                  </div>

                  {/* Production environment */}
                  <div className="border border-foreground/10 p-5 bg-foreground/[0.01] space-y-4 relative">
                    <div className="absolute right-4 top-4 flex items-center gap-1.5">
                      <span className="size-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-mono font-bold uppercase text-emerald-500">LIVE</span>
                    </div>
                    <div>
                      <span className={LABEL_CLS}>Primary Domain</span>
                      <h3 className="text-sm font-bold uppercase mt-0.5">production.velocity.dev</h3>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground divide-y divide-foreground/5 pt-1">
                      <div className="py-1.5 flex justify-between"><span>Active Branch</span><span className="text-foreground">main</span></div>
                      <div className="py-1.5 flex justify-between"><span>SSL Status</span><span className="text-foreground">SECURE</span></div>
                      <div className="py-1.5 flex justify-between"><span>Commit SHA</span><span className="text-foreground">9f2e8da</span></div>
                    </div>
                  </div>
                </div>

                {/* History */}
                <div className="space-y-4">
                  <h3 className={LABEL_CLS}>Build Deployment History</h3>
                  <div className="border border-foreground/10 bg-background divide-y divide-foreground/10">
                    {deployHistory.map(dep => (
                      <div key={dep.id} className="p-4 flex items-center justify-between text-xs font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground uppercase">{dep.env}</span>
                            <span className="text-muted-foreground text-[10px]">{dep.timestamp}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Branch: {dep.branch} — "{dep.commit}"</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground">By: {dep.triggeredBy}</span>
                          <span className={`px-1.5 py-0.5 uppercase text-[9px] font-bold ${
                            dep.status === "live" ? "bg-emerald-500/10 text-emerald-500" :
                            dep.status === "building" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                          }`}>{dep.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trigger Build Simulator */}
              <div className={`${PANEL_CLS} relative overflow-hidden self-start`}>
                <div className="h-[2px] w-full bg-cyan-500 absolute top-0 left-0" />
                <h3 className={PANEL_HDR}>
                  <Cpu className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Manual Deploy Trigger</span>
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Select Environment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["staging", "production"].map((env) => (
                        <button
                          key={env}
                          onClick={() => setDeployEnv(env as any)}
                          className={`py-2 text-[10px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                            deployEnv === env
                              ? "bg-foreground text-background border-foreground font-bold"
                              : "border-foreground/10 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {env}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (deployProgress !== null) return;
                      setDeployProgress(0);
                      setDeployLog(["[deploy] Initializing build process...", "[deploy] Checking build sandbox..."]);
                      
                      const steps = [
                        { prg: 25, log: "[deploy] Syncing repository branches..." },
                        { prg: 50, log: "[deploy] Running typecheck checks (pnpm run check-types)..." },
                        { prg: 75, log: "[deploy] Running production bundler (next build)..." },
                        { prg: 100, log: `[deploy] Deployment live on ${deployEnv}.velocity.dev` }
                      ];

                      steps.forEach((step, idx) => {
                        setTimeout(() => {
                          setDeployProgress(step.prg);
                          setDeployLog(prev => [...prev, step.log]);
                          if (step.prg === 100) {
                            setTimeout(() => {
                              setDeployProgress(null);
                              setDeployHistory(prev => [
                                {
                                  id: "dep-" + Date.now(),
                                  env: deployEnv,
                                  status: "live",
                                  commit: `manual build trigger`,
                                  branch: deployEnv === "staging" ? "staging" : "main",
                                  triggeredBy: user?.fullName || "User Operator",
                                  timestamp: "Just now"
                                },
                                ...prev
                              ]);
                              toast.success(`Successfully deployed to ${deployEnv}!`);
                            }, 800);
                          }
                        }, (idx + 1) * 1000);
                      });
                    }}
                    disabled={deployProgress !== null}
                    className={`${BTN_MONO} w-full h-9 cursor-pointer`}
                  >
                    {deployProgress !== null ? "Deploying Build..." : "Trigger Build Dispatch"}
                  </Button>

                  {deployProgress !== null && (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span>Deploying Artifacts</span>
                        <span>{deployProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-foreground/10">
                        <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${deployProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {deployLog.length > 0 && (
                    <div className="pt-2">
                      <span className={LABEL_CLS}>Build Output Logs</span>
                      <div className="p-3 border border-foreground/10 bg-foreground/[0.03] text-[9px] font-mono max-h-40 overflow-auto mt-1 space-y-1">
                        {deployLog.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Tab ────────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="p-8 lg:p-12 max-w-3xl animate-in fade-in duration-200">
            <header className="border-b border-foreground/8 pb-8 mb-10">
              <div className={`${LABEL_CLS} flex items-center gap-1.5 mb-3`}>
                <span>App Registry</span>
                <span className="opacity-40">/</span>
                <span>System Configurations</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-foreground leading-[0.9]">
                Settings
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed max-w-xl font-normal">
                Manage credential settings, Pinecone vector schemas, Gemini prompt structures, and webhook configurations.
              </p>
            </header>

            <form onSubmit={(e) => {
              e.preventDefault();
              setIsSavingSettings(true);
              setTimeout(() => {
                setIsSavingSettings(false);
                toast.success("Settings updated successfully!");
              }, 1200);
            }} className="space-y-6">
              <div className={`${PANEL_CLS} relative overflow-hidden`}>
                <div className="h-[2px] w-full bg-foreground absolute top-0 left-0" />
                <h3 className={PANEL_HDR}>
                  <Key className="h-3.5 w-3.5" />
                  <span>API Integration Credentials</span>
                </h3>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Gemini Pro Key</label>
                    <Input
                      type="password"
                      value={settingsGeminiKey}
                      onChange={(e) => setSettingsGeminiKey(e.target.value)}
                      className="font-mono text-xs rounded-none border-foreground/20 bg-background h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Pinecone Access Key</label>
                    <Input
                      type="password"
                      value={settingsPineconeKey}
                      onChange={(e) => setSettingsPineconeKey(e.target.value)}
                      className="font-mono text-xs rounded-none border-foreground/20 bg-background h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>GitHub Webhook Signature Key</label>
                    <Input
                      type="password"
                      value={settingsWebhookSecret}
                      onChange={(e) => setSettingsWebhookSecret(e.target.value)}
                      className="font-mono text-xs rounded-none border-foreground/20 bg-background h-9"
                    />
                  </div>
                </div>
              </div>

              <div className={`${PANEL_CLS} relative overflow-hidden`}>
                <div className="h-[2px] w-full bg-foreground absolute top-0 left-0" />
                <h3 className={PANEL_HDR}>
                  <Bot className="h-3.5 w-3.5" />
                  <span>AI Review Prompting Matrix</span>
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>System Review Custom Rule Prompt</label>
                    <Textarea
                      value={settingsPromptTemplate}
                      onChange={(e) => setSettingsPromptTemplate(e.target.value)}
                      className="font-sans text-xs rounded-none border-foreground/20 bg-background min-h-24 resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground font-sans">Appends custom directives to Gemini reviewer queries during PR review.</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingSettings}
                className={`${BTN_MONO} w-full h-10 cursor-pointer`}
              >
                {isSavingSettings ? "Syncing configs..." : "Save Settings"}
              </Button>
            </form>
          </div>
        )}

        {/* ── Help / Docs Dialog Overlay ─────────────────────────────────── */}
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogContent className="max-w-[600px] bg-background border border-foreground/20 rounded-none p-7 text-foreground font-sans max-h-[85vh] overflow-y-auto">
            <DialogHeader className="mb-6 pb-4 border-b border-foreground/10">
              <DialogTitle className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-foreground" />
                <span>Onboarding & Documentation</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 font-mono">
                Velocity Delivery Engine v1.0.0
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 text-sm leading-relaxed text-foreground/80 font-normal">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">// RAG PIPELINE SPECIFICATION</h4>
                <p>Velocity extracts files from linked GitHub branches, divides files into 80-line chunks, and maps vectors to a Pinecone vector namespace. Gemini performs reviews referencing repository contextual lookups.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">// WEBHOOK INTEGRATION SECRETS</h4>
                <p>Register the Webhook URL located in the Webhooks tab inside your GitHub Repository Settings (Events: Pull Requests). Enter the HMAC secret value inside Settings to activate payload signature validation.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">// MANUAL TRIGGERS</h4>
                <p>If you connect repositories manually without configuring webhooks, you can still trigger manual audits using the GitHub Hub PR Action console.</p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={() => setIsHelpOpen(false)} className={`${BTN_MONO} h-9 cursor-pointer`}>
                Close Docs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── User Profile Dialog Overlay ────────────────────────────────── */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="max-w-[450px] bg-background border border-foreground/20 rounded-none p-7 text-foreground font-sans">
            <DialogHeader className="mb-6 pb-4 border-b border-foreground/10">
              <DialogTitle className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                <User className="h-5 w-5 text-foreground" />
                <span>Account Information</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 font-mono">
                Session Token Profile Settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs font-mono divide-y divide-foreground/5">
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground uppercase">Username</span>
                <span className="text-foreground font-bold">{user?.fullName || "Operator"}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground uppercase">User Email</span>
                <span className="text-foreground">{user?.email || "unknown@domain.com"}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground uppercase">OAuth Provider</span>
                <span className="text-foreground font-bold flex items-center gap-1">
                  <Github className="size-3.5" /> GITHUB
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground uppercase">OAuth Status</span>
                <span className="text-emerald-500 font-bold uppercase">AUTHORIZED (REPO ACCESS)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground uppercase">User ID (DB Key)</span>
                <span className="text-muted-foreground text-[10px] truncate max-w-[200px] select-all">{user?.id || "N/A"}</span>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={() => setIsProfileOpen(false)} className={`${BTN_MONO} h-9 cursor-pointer`}>
                Close Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
