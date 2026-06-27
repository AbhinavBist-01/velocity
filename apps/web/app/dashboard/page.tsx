"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { 
  Plus, Github, ArrowRight, Kanban, Terminal, ChevronRight, ChevronLeft, LogOut,
  GitPullRequest, GitMerge, FileCode, Tag, GitCommit, GitBranch, RefreshCw, 
  BarChart2, TrendingUp, Calendar, AlertCircle, ShieldCheck, Info
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
  const [activeTab, setActiveTab] = useState<"projects" | "github">("projects");

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
  const createProjectMutation = trpc.velocity.createProject.useMutation({
    onSuccess: () => {
      utils.velocity.getProjects.invalidate();
      setIsCreateOpen(false);
      setName(""); setDescription(""); setRepo("");
      setNewRepoName(""); setNewRepoDesc("");
      toast.success("Project created successfully!");
    },
    onError: (err) => { toast.error(`Error: ${err.message}`); }
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
    { id: "github"   as const, label: "GitHub Hub", icon: <Github className="h-4 w-4 shrink-0" /> },
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
        <div className="space-y-3">
          {!isCollapsed && (
            <div className="border-l-2 border-l-foreground/10 pl-3 py-1">
              <p className={`${LABEL_CLS} mb-1`}>// PAIR_PROG_ACTIVE</p>
              <p className="text-[11px] text-muted-foreground font-sans leading-snug">Idea to prod, with AI guidance.</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center transition-all border border-transparent hover:border-red-500/30 hover:text-red-500 hover:bg-red-500/5 text-muted-foreground ${
              isCollapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2.5 px-3 py-2.5 w-full text-[11px] font-mono uppercase tracking-wider"
            }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {activeTab === "projects" ? (
          <div className="p-8 lg:p-12 max-w-7xl">

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
                  <Button className={`${BTN_MONO} h-10 px-5 gap-2 shrink-0 mt-1`}>
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
                                  className={`py-2 text-[10px] font-mono uppercase tracking-wider transition-all ${
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
                        className={`${BTN_GHOST} h-9 px-5`}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProjectMutation.isPending || isCreatingRepo}
                        className={`${BTN_MONO} h-9 px-5`}
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
                  className={`${BTN_MONO} h-10 px-8 gap-2`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Your First Project</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/8">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group bg-background hover:bg-foreground/[0.02] transition-colors duration-200 flex flex-col overflow-hidden relative"
                  >
                    {/* Left accent rule — appears on hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Repo badge */}
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground border border-foreground/10 py-1 px-2.5 mb-5">
                          <Github className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {project.githubRepo.replace("https://", "").replace("github.com/", "")}
                          </span>
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
                            className="w-full justify-between rounded-none h-10 px-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-transparent group/btn transition-all"
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
        ) : (
          /* ── GitHub Hub ─────────────────────────────────────────────── */
          <div className="p-8 lg:p-12">

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
                  className={`${BTN_MONO} w-full h-11 gap-2`}
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
      </main>
    </div>
  );
}
