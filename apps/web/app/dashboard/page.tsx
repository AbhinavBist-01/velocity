"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { 
  Plus, Github, ArrowRight, Kanban, Clock, Terminal, ChevronRight, ChevronLeft, LogOut,
  GitPullRequest, GitMerge, FileCode, CheckCircle, Tag, GitCommit, GitBranch, RefreshCw, 
  BarChart2, TrendingUp, Users, Calendar, AlertCircle, Edit, Trash2, ShieldCheck, Info
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { useLogout, useUser } from "~/hooks/api/auth";
import { authClient } from "~/lib/auth-client";
import { Badge } from "~/components/ui/badge";

export default function Dashboard() {
  const utils = trpc.useUtils();
  const { user } = useUser();
  const { logout } = useLogout();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
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

  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"projects" | "github">("projects");

  // GitHub Console Simulation States
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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load repositories");
        return res.json();
      })
      .then((data) => {
        setGithubRepos(data);
        if (data.length > 0) {
          const exists = data.some((r: any) => r.fullName === selectedRepo);
          if (!exists) {
            setSelectedRepo(data[0].fullName);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoadingRepos(false);
      });
  };

  React.useEffect(() => {
    if (session) {
      fetchGithubRepos();
    }
  }, [session]);
  
  // Issue & PR Forms State
  const [issueTitle, setIssueTitle] = useState("");
  const [issueBody, setIssueBody] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBranch, setPrBranch] = useState("feature/home-page-redesign");
  const [releaseTag, setReleaseTag] = useState("v1.3.0");
  const [reviewComment, setReviewComment] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  
  // Diff Compare Branches State
  const [compareBase, setCompareBase] = useState("main");
  const [compareHead, setCompareHead] = useState("feature/home-page-redesign");

  const { data: projects, isLoading } = trpc.velocity.getProjects.useQuery();
  const createProjectMutation = trpc.velocity.createProject.useMutation({
    onSuccess: () => {
      utils.velocity.getProjects.invalidate();
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setRepo("");
      setNewRepoName("");
      setNewRepoDesc("");
      toast.success("Project created successfully!");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.warning("Please fill out name and description.");
      return;
    }

    let targetRepo = repo;

    if (repoMethod === "select") {
      if (!repo) {
        toast.warning("Please select a repository.");
        return;
      }
      targetRepo = repo;
    } else if (repoMethod === "create") {
      if (!newRepoName) {
        toast.warning("Please enter a name for the new repository.");
        return;
      }
      setIsCreatingRepo(true);
      try {
        const createRes = await fetch("/api/github/repos/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newRepoName,
            description: newRepoDesc || description,
            isPrivate: newRepoPrivate,
          }),
        });

        if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(errData.error || "Failed to create GitHub repository");
        }

        const newRepo = await createRes.json();
        targetRepo = newRepo.fullName;
        toast.success(`Repository ${newRepo.fullName} created on GitHub!`);
        
        // Refresh repo lists in background
        fetchGithubRepos();
      } catch (err: any) {
        toast.error(`GitHub repo creation failed: ${err.message}`);
        setIsCreatingRepo(false);
        return;
      } finally {
        setIsCreatingRepo(false);
      }
    } else {
      if (!repo) {
        toast.warning("Please enter a repository path.");
        return;
      }
      targetRepo = repo;
    }

    createProjectMutation.mutate({
      name,
      description,
      githubRepo: targetRepo,
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono bg-grid-dots relative">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-16 px-2 py-6" : "w-64 p-6"} border-r border-border bg-card/85 backdrop-blur-md flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-300 relative`}>
        <div>
          <div className="flex items-center justify-center mb-8 relative w-full">
            <Link href="/" className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} w-full`}>
              <div className="h-9 w-9 bg-foreground text-background flex items-center justify-center font-black text-sm tracking-tighter shrink-0">
                VL
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold text-xs uppercase tracking-wider leading-tight">Velocity</h1>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest block font-medium">Delivery Engine</span>
                  {user && (
                    <span className="text-[8px] text-primary/80 uppercase tracking-wider block font-semibold mt-0.5 max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                  )}
                </div>
              )}
            </Link>
            <button
              onClick={toggleSidebar}
              className="absolute -right-5 top-1.5 p-1 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 z-20"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          <nav className="space-y-2 text-xs uppercase tracking-wider w-full">
            <button
              onClick={() => setActiveTab("projects")}
              title="Projects"
              className={`flex items-center transition-all duration-200 border ${
                activeTab === "projects"
                  ? "border-foreground bg-foreground text-background font-bold"
                  : "border-transparent text-muted-foreground hover:border-border"
              } ${
                isCollapsed 
                  ? "h-10 w-10 justify-center mx-auto p-0" 
                  : "px-3 py-2.5 gap-3 w-full text-left"
              }`}
            >
              <Kanban className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Projects</span>}
            </button>
            <button
              onClick={() => setActiveTab("github")}
              title="GitHub Operations"
              className={`flex items-center transition-all duration-200 border ${
                activeTab === "github"
                  ? "border-foreground bg-foreground text-background font-bold"
                  : "border-transparent text-muted-foreground hover:border-border"
              } ${
                isCollapsed 
                  ? "h-10 w-10 justify-center mx-auto p-0" 
                  : "px-3 py-2.5 gap-3 w-full text-left"
              }`}
            >
              <Github className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>GitHub Hub</span>}
            </button>
          </nav>
        </div>

        <div className="space-y-4 w-full">
          {!isCollapsed && (
            <div className="p-4 border border-border bg-background/50 text-[10px] text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground mb-1 uppercase tracking-widest">// PAIR_PROG_ACTIVE</p>
              <p>Move features from idea to prod with typesafe AI guidance hooks.</p>
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

      {/* Main Content */}
      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto border-l border-border/40">
        {activeTab === "projects" ? (
          <>
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b border-border/60 pb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <span>System Cockpit</span>
                  <span>/</span>
                  <span>Workspace Registry</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase text-foreground">
                  Deliver Features Faster
                </h1>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed max-w-2xl font-sans">
                  Manage your product discovery, PRD specifications, tasks, AI reviews, and production releases in a stark unified dashboard.
                </p>
              </div>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800 py-6 px-6 border-2 border-foreground gap-2 transition-all shrink-0">
                    <Plus className="h-4 w-4" />
                    <span>New Project</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-card border-2 border-foreground rounded-none p-6 font-mono text-foreground">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-lg font-bold uppercase tracking-tight">Create New Project</DialogTitle>
                      <DialogDescription className="text-muted-foreground text-xs font-sans mt-1">
                        Set up your workspace and connect it to a repository to begin the feature flow.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Project Name</label>
                        <Input
                          id="name"
                          placeholder="e.g. My SaaS Platform"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm py-5"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Description</label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of the app purpose..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm min-h-[90px]"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">GitHub Repository Source</label>
                        
                        {session ? (
                          <>
                            {/* Tab Selectors */}
                            <div className="grid grid-cols-3 gap-1 border border-border p-1 bg-muted/30">
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
                                  className={`py-1.5 text-[9px] uppercase tracking-wider font-bold transition-all ${
                                    repoMethod === method
                                      ? "bg-foreground text-background"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {method === "select" && "Select Synced"}
                                  {method === "create" && "Create New"}
                                  {method === "manual" && "Manual Link"}
                                </button>
                              ))}
                            </div>

                            {/* Conditional Inputs */}
                            {repoMethod === "select" && (
                              <div className="space-y-1">
                                <select
                                  value={repo}
                                  onChange={(e) => setRepo(e.target.value)}
                                  className="w-full border border-border bg-background text-xs font-mono p-3 focus-visible:outline-none focus-visible:border-foreground"
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
                                <p className="text-[8px] text-muted-foreground font-sans mt-0.5 px-1">
                                  Lists your GitHub repositories. Choose one to associate.
                                </p>
                              </div>
                            )}

                            {repoMethod === "create" && (
                              <div className="space-y-3 p-3 border border-border bg-card/40">
                                <div className="space-y-1">
                                  <label htmlFor="newRepoName" className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground block">New Repository Name</label>
                                  <Input
                                    id="newRepoName"
                                    placeholder="my-new-awesome-project"
                                    value={newRepoName}
                                    onChange={(e) => setNewRepoName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"))}
                                    className="rounded-none border-border bg-background text-xs py-3"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label htmlFor="newRepoDesc" className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground block">Description (Optional)</label>
                                  <Input
                                    id="newRepoDesc"
                                    placeholder="Repository description..."
                                    value={newRepoDesc}
                                    onChange={(e) => setNewRepoDesc(e.target.value)}
                                    className="rounded-none border-border bg-background text-xs py-3"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="checkbox"
                                    id="newRepoPrivate"
                                    checked={newRepoPrivate}
                                    onChange={(e) => setNewRepoPrivate(e.target.checked)}
                                    className="accent-foreground size-3.5 rounded-none border border-border cursor-pointer"
                                  />
                                  <label htmlFor="newRepoPrivate" className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground selection:bg-transparent cursor-pointer">
                                    Private Repository (Recommended)
                                  </label>
                                </div>
                              </div>
                            )}

                            {repoMethod === "manual" && (
                              <div className="relative">
                                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="repo"
                                  placeholder="username/project-repo"
                                  value={repo}
                                  onChange={(e) => setRepo(e.target.value)}
                                  className="pl-10 rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm py-5"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="relative">
                              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  id="repo"
                                  placeholder="username/project-repo"
                                  value={repo}
                                  onChange={(e) => setRepo(e.target.value)}
                                  className="pl-10 rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm py-5"
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground font-sans leading-relaxed">
                              💡 Link your GitHub account in the **GitHub Developer Deck** sidebar tab to select synced repositories or create them directly.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className="rounded-none font-mono text-xs uppercase tracking-widest border border-border"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProjectMutation.isPending || isCreatingRepo}
                        className="rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800"
                      >
                        {createProjectMutation.isPending || isCreatingRepo 
                          ? (isCreatingRepo ? "Creating Repo..." : "Creating Project...") 
                          : "Create Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </header>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Spinner className="h-6 w-6 text-foreground" />
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold animate-pulse">Loading projects...</p>
              </div>
            ) : !projects || projects.length === 0 ? (
              <div className="border border-border bg-card rounded-none p-16 text-center max-w-xl mx-auto flex flex-col items-center gap-6 mt-8">
                <div className="p-4 border border-border bg-background">
                  <Kanban className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase mb-2">No Projects Configured</h2>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-md mx-auto font-sans">
                    Kick off the Velocity lifecycle. Add your first project, define requirements, generate branches, run reviews, and ship features.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="gap-2 font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800 border-2 border-foreground py-6 px-8 rounded-none transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Project</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="group border border-border hover:border-foreground bg-card transition-all duration-300 rounded-none flex flex-col justify-between overflow-hidden relative"
                  >
                    <div className="w-full h-1 bg-foreground/20 group-hover:bg-foreground transition-all duration-300" />
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground bg-background border border-border py-1 px-2.5">
                            <Github className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[150px] uppercase">{project.githubRepo.replace("https://", "").replace("github.com/", "")}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-black uppercase text-foreground mb-3 truncate group-hover:text-primary transition-all">
                          {project.name}
                        </h3>
                        <p className="text-muted-foreground text-xs font-sans leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/60">
                        <Link href={`/projects/${project.id}`} className="w-full block">
                          <Button variant="secondary" className="w-full justify-between rounded-none py-5 px-4 font-mono text-xs uppercase tracking-wider bg-background text-foreground border border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all group/btn">
                            <span>Open Workspace</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* GitHub Hub Console */
          <div className="space-y-6">
            <header className="border-b border-border/60 pb-6 mb-6">
              <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted-foreground uppercase tracking-widest">
                <span>Developer Console</span>
                <span>/</span>
                <span>GitHub Orchestrator</span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
                <Github className="h-8 w-8 text-foreground shrink-0" />
                <span>GitHub Core Developer Deck</span>
              </h1>
              <p className="text-muted-foreground text-sm font-sans mt-1">
                Execute Git operations, trigger Pull Requests, perform comparative diff audits, and review repository contribution stats.
              </p>
            </header>

            {isSessionPending ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Spinner className="h-6 w-6 text-foreground" />
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold animate-pulse">Checking GitHub Credentials...</p>
              </div>
            ) : !session ? (
              /* GitHub SignIn Request Screen */
              <div className="max-w-md mx-auto border border-border bg-card p-8 rounded-none text-center shadow-xl space-y-6 mt-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
                <div className="size-16 mx-auto bg-foreground/5 border border-border flex items-center justify-center rounded-none relative">
                  <Github className="h-8 w-8 text-foreground" />
                  <AlertCircle className="h-4 w-4 text-red-500 absolute -top-1.5 -right-1.5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-md font-bold uppercase tracking-tight text-foreground">GitHub Account Not Linked</h2>
                  <p className="text-muted-foreground text-xs font-sans leading-relaxed">
                    To trigger pull request files analytics, review git logs, and perform repo sync operations, you must link your GitHub profile first.
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await authClient.signIn.social({
                        provider: "github",
                        callbackURL: window.location.href,
                      });
                    } catch (e: any) {
                      toast.error(`GitHub login failed: ${e.message || e}`);
                    }
                  }}
                  className="w-full rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800 py-6 border border-foreground flex items-center justify-center gap-2"
                >
                  <Github className="h-4 w-4 fill-background text-background shrink-0" />
                  <span>Link GitHub Profile</span>
                </Button>
              </div>
            ) : (
              /* GitHub Connected Workspace Hub */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Side: Repos & Actions Menu */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Connected Profile */}
                  <Card className="border-border rounded-none bg-card/50">
                    <CardHeader className="p-4 border-b border-border">
                      <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">GitHub Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center gap-3">
                      {session.user.image ? (
                        <img src={session.user.image} alt="Avatar" className="h-8 w-8 border border-border rounded-none shrink-0" />
                      ) : (
                        <div className="h-8 w-8 border border-border bg-muted flex items-center justify-center text-xs shrink-0 font-bold">GH</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs uppercase text-foreground leading-tight truncate">{session.user.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate leading-relaxed">{session.user.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Repository Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
                      Select Repository {isLoadingRepos && "(Loading...)"}
                    </label>
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-full border border-border rounded-none bg-background text-xs font-mono p-3 focus-visible:outline-none focus-visible:border-foreground"
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

                  {/* Subtabs Menu */}
                  <nav className="flex flex-col space-y-1 font-mono text-xs uppercase">
                    {[
                      { id: "pr", label: "PR & Issues", icon: <GitPullRequest className="h-3.5 w-3.5" /> },
                      { id: "review", label: "Code Review", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
                      { id: "diff", label: "Diff Analysis", icon: <FileCode className="h-3.5 w-3.5" /> },
                      { id: "ops", label: "Push & Pull", icon: <RefreshCw className="h-3.5 w-3.5" /> },
                      { id: "analytics", label: "Analytics Board", icon: <BarChart2 className="h-3.5 w-3.5" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedSubTab(tab.id as any)}
                        className={`flex items-center gap-3 px-3 py-3 border text-left transition-all ${
                          selectedSubTab === tab.id
                            ? "border-foreground bg-foreground text-background font-bold"
                            : "border-border hover:border-foreground bg-card/25"
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Right Side: Active Workspace Console */}
                <div className="lg:col-span-3">
                  <Card className="border-border bg-card rounded-none h-full min-h-[550px] flex flex-col justify-between relative overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/20 p-5 flex flex-row items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xs uppercase font-bold text-foreground">
                          {selectedSubTab === "pr" && "PR & Issue Lifecycle Manager"}
                          {selectedSubTab === "review" && "GitHub Review Auditor"}
                          {selectedSubTab === "diff" && "Git Diff Comparative Suite"}
                          {selectedSubTab === "ops" && "Remote Push & Sync Operations"}
                          {selectedSubTab === "analytics" && "Repository Activity Analytics"}
                        </CardTitle>
                        <CardDescription className="text-[10px] text-muted-foreground font-sans mt-0.5">
                          Active Target: <span className="font-mono text-foreground font-bold">{selectedRepo}</span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-foreground text-background rounded-none text-[8px] uppercase tracking-wider font-bold">
                        Connected
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-6 flex-1 overflow-y-auto space-y-6">
                      {/* TAB 1: PR & ISSUES */}
                      {selectedSubTab === "pr" && (
                        <div className="space-y-6">
                          {/* Create Issue */}
                          <div className="border border-border p-4 bg-muted/5 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                              <Info className="h-3.5 w-3.5" />
                              <span>createIssue()</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input 
                                placeholder="Issue Title" 
                                value={issueTitle}
                                onChange={(e) => setIssueTitle(e.target.value)}
                                className="rounded-none border-border bg-background sm:col-span-1 text-xs"
                              />
                              <Input 
                                placeholder="Issue Body / Description" 
                                value={issueBody}
                                onChange={(e) => setIssueBody(e.target.value)}
                                className="rounded-none border-border bg-background sm:col-span-2 text-xs"
                              />
                            </div>
                            <Button 
                              onClick={() => {
                                if (!issueTitle.trim()) {
                                  toast.error("Issue title is required");
                                  return;
                                }
                                toast.success(`[GitHub] createIssue() status: 201 Created. Issue #108: "${issueTitle}" opened successfully.`);
                                setIssueTitle("");
                                setIssueBody("");
                              }}
                              className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-foreground text-background hover:bg-neutral-800"
                            >
                              Execute createIssue()
                            </Button>
                          </div>

                          {/* Create PR */}
                          <div className="border border-border p-4 bg-muted/5 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                              <GitPullRequest className="h-3.5 w-3.5" />
                              <span>createPullRequest()</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input 
                                placeholder="PR Title" 
                                value={prTitle}
                                onChange={(e) => setPrTitle(e.target.value)}
                                className="rounded-none border-border bg-background sm:col-span-2 text-xs"
                              />
                              <Input 
                                placeholder="From Branch" 
                                value={prBranch}
                                onChange={(e) => setPrBranch(e.target.value)}
                                className="rounded-none border-border bg-background sm:col-span-1 text-xs"
                              />
                            </div>
                            <Button 
                              onClick={() => {
                                if (!prTitle.trim()) {
                                  toast.error("PR title is required");
                                  return;
                                }
                                toast.success(`[GitHub] createPullRequest() status: 200 OK. PR #45 opened from "${prBranch}" to "main".`);
                                setPrTitle("");
                              }}
                              className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-foreground text-background hover:bg-neutral-800"
                            >
                              Execute createPullRequest()
                            </Button>
                          </div>

                          {/* Merge & Release Actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-border p-4 bg-muted/5 space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                                <GitMerge className="h-3.5 w-3.5" />
                                <span>mergePullRequest()</span>
                              </h3>
                              <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
                                Merges the active PR #45 into branch main, committing all generated code.
                              </p>
                              <Button 
                                onClick={() => {
                                  toast.success("[GitHub] mergePullRequest() status: 200 SUCCESS. Commit merged: d3c4b9a into main.");
                                }}
                                className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-foreground text-background hover:bg-neutral-800"
                              >
                                Execute mergePullRequest()
                              </Button>
                            </div>

                            <div className="border border-border p-4 bg-muted/5 space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                                <Tag className="h-3.5 w-3.5" />
                                <span>createRelease()</span>
                              </h3>
                              <div className="flex items-center gap-2">
                                <Input 
                                  value={releaseTag}
                                  onChange={(e) => setReleaseTag(e.target.value)}
                                  className="rounded-none border-border bg-background text-xs max-w-[120px]"
                                />
                                <Button 
                                  onClick={() => {
                                    toast.success(`[GitHub] createRelease() status: 201 Created. Tag ${releaseTag} published to production.`);
                                  }}
                                  className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-foreground text-background hover:bg-neutral-800"
                                >
                                  Execute createRelease()
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: CODE REVIEW FLOW */}
                      {selectedSubTab === "review" && (
                        <div className="space-y-6">
                          <div className="border border-border p-4 bg-muted/5 space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Code Review Audit Flow</span>
                              </h3>
                              <span className="text-[10px] font-mono text-muted-foreground">listPullRequests() & getPullRequestFiles()</span>
                            </div>

                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between p-2 border border-border/80 bg-background text-[11px]">
                                <div className="flex items-center gap-2 font-bold">
                                  <span className="text-emerald-500">PR #45</span>
                                  <span>feat: add a home page layout</span>
                                </div>
                                <span className="text-[9px] border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2 py-0.5 font-bold uppercase">OPEN</span>
                              </div>
                              <div className="pl-4 text-[10px] space-y-1 text-muted-foreground">
                                <p className="font-bold">// Changed Files in PR #45 (getPullRequestFiles()):</p>
                                <p className="flex items-center gap-1.5">
                                  <FileCode className="h-3.5 w-3.5 text-foreground shrink-0" />
                                  <span>apps/web/app/page.tsx (status: modified)</span>
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <FileCode className="h-3.5 w-3.5 text-foreground shrink-0" />
                                  <span>packages/database/schema.ts (status: modified)</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border border-border p-4 bg-muted/5 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                              <span>createReview() & approveReview()</span>
                            </h3>
                            <div className="space-y-3">
                              <Textarea 
                                placeholder="Enter review comments / audit details..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="rounded-none border-border bg-background text-xs font-mono"
                                rows={2}
                              />
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  onClick={() => {
                                    if (!reviewComment.trim()) {
                                      toast.error("Please add a review comment first");
                                      return;
                                    }
                                    toast.success(`[GitHub] createReview() executed. Changes requested on PR #45: "${reviewComment}"`);
                                    setReviewComment("");
                                  }}
                                  className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20"
                                >
                                  Request Changes
                                </Button>
                                <Button 
                                  onClick={() => {
                                    toast.success("[GitHub] approveReview() executed. PR #45 approved and ready for merge.");
                                  }}
                                  className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Approve PR #45
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: DIFF ANALYSIS */}
                      {selectedSubTab === "diff" && (
                        <div className="space-y-6">
                          {/* Comparative Config */}
                          <div className="border border-border p-4 bg-muted/5 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                              <GitBranch className="h-3.5 w-3.5" />
                              <span>compareBranches() & getPullRequestDiffStats()</span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1 bg-background border border-border px-2 py-1">
                                <span className="text-[9px] uppercase text-muted-foreground">Base:</span>
                                <input 
                                  value={compareBase}
                                  onChange={(e) => setCompareBase(e.target.value)}
                                  className="bg-transparent border-none focus:outline-none w-[60px] text-xs"
                                />
                              </div>
                              <span className="text-muted-foreground">←</span>
                              <div className="flex items-center gap-1 bg-background border border-border px-2 py-1">
                                <span className="text-[9px] uppercase text-muted-foreground">Head:</span>
                                <input 
                                  value={compareHead}
                                  onChange={(e) => setCompareHead(e.target.value)}
                                  className="bg-transparent border-none focus:outline-none w-[160px] text-xs"
                                />
                              </div>
                              <Button 
                                onClick={() => {
                                  toast.success(`[GitHub] compared branches successfully. Found: 3 commits, 2 files changed.`);
                                }}
                                className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-foreground text-background hover:bg-neutral-800"
                              >
                                Run compareBranches()
                              </Button>
                            </div>
                          </div>

                          {/* Diff Output Panel */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                              <span>getPullRequestDiff() & getFileDiff() output:</span>
                              <span className="text-emerald-500 font-bold">+128 lines / -12 lines</span>
                            </div>
                            <pre className="border border-border bg-black/60 p-4 text-[10px] font-mono text-emerald-400/90 whitespace-pre overflow-x-auto leading-relaxed h-[200px]">
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

                      {/* TAB 4: PUSH/PULL OPERATIONS */}
                      {selectedSubTab === "ops" && (
                        <div className="space-y-6">
                          <div className="border border-border p-4 bg-muted/5 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2 text-foreground">
                              <GitCommit className="h-3.5 w-3.5" />
                              <span>pushCommit()</span>
                            </h3>
                            <div className="flex items-center gap-2">
                              <Input 
                                placeholder="Commit message (e.g. feat: integrate home page)" 
                                value={commitMessage}
                                onChange={(e) => setCommitMessage(e.target.value)}
                                className="rounded-none border-border bg-background text-xs"
                              />
                              <Button 
                                onClick={() => {
                                  if (!commitMessage.trim()) {
                                    toast.error("Commit message is required");
                                    return;
                                  }
                                  toast.success(`[Git] pushCommit() SUCCESS. Pushed commit 4c89b2a to remote ref: heads/${compareHead}`);
                                  setCommitMessage("");
                                }}
                                className="rounded-none text-[10px] uppercase font-mono tracking-wider bg-foreground text-background hover:bg-neutral-800 shrink-0"
                              >
                                pushCommit()
                              </Button>
                            </div>
                          </div>

                          {/* Remote operations triggers */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-border p-4 bg-muted/5 space-y-3">
                              <h4 className="text-[11px] font-bold uppercase flex items-center gap-1.5 text-foreground">
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>fetchLatestCommits()</span>
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-sans">
                                Checks for remote revisions on main.
                              </p>
                              <Button 
                                onClick={() => {
                                  toast.success("[Git] fetchLatestCommits(): Workspace is fully synced with origin.");
                                }}
                                variant="outline"
                                className="rounded-none text-[10px] uppercase font-mono tracking-wider border-border hover:border-foreground"
                              >
                                Fetch
                              </Button>
                            </div>

                            <div className="border border-border p-4 bg-muted/5 space-y-3">
                              <h4 className="text-[11px] font-bold uppercase flex items-center gap-1.5 text-foreground">
                                <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                                <span>pullLatestChanges()</span>
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-sans">
                                Pulls latest origin commits to local repo.
                              </p>
                              <Button 
                                onClick={() => {
                                  toast.success("[Git] pullLatestChanges(): Pull complete. 0 files modified.");
                                }}
                                variant="outline"
                                className="rounded-none text-[10px] uppercase font-mono tracking-wider border-border hover:border-foreground"
                              >
                                Pull
                              </Button>
                            </div>

                            <div className="border border-border p-4 bg-muted/5 space-y-3">
                              <h4 className="text-[11px] font-bold uppercase flex items-center gap-1.5 text-foreground">
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>syncForkedRepository()</span>
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-sans">
                                Sync upstream updates.
                              </p>
                              <Button 
                                onClick={() => {
                                  toast.success("[GitHub] syncForkedRepository(): Upstream main synced.");
                                }}
                                variant="outline"
                                className="rounded-none text-[10px] uppercase font-mono tracking-wider border-border hover:border-foreground"
                              >
                                Sync Fork
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 5: ANALYTICS */}
                      {selectedSubTab === "analytics" && (
                        <div className="space-y-6">
                          {/* Top row stats: getCloneStats() and getViewStats() */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="border border-border p-4 bg-muted/5 rounded-none text-center">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">getCloneStats() Clones</p>
                              <p className="text-2xl font-black text-foreground mt-1">284</p>
                              <span className="text-[8px] text-emerald-500 font-bold font-mono">14-Day Traffic</span>
                            </div>
                            <div className="border border-border p-4 bg-muted/5 rounded-none text-center">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">getCloneStats() Cloners</p>
                              <p className="text-2xl font-black text-foreground mt-1">94</p>
                              <span className="text-[8px] text-muted-foreground font-bold font-mono">Unique Profiles</span>
                            </div>
                            <div className="border border-border p-4 bg-muted/5 rounded-none text-center">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">getViewStats() Pageviews</p>
                              <p className="text-2xl font-black text-foreground mt-1">1,294</p>
                              <span className="text-[8px] text-emerald-500 font-bold font-mono">Views (14 Days)</span>
                            </div>
                            <div className="border border-border p-4 bg-muted/5 rounded-none text-center">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">getViewStats() Visitors</p>
                              <p className="text-2xl font-black text-foreground mt-1">394</p>
                              <span className="text-[8px] text-muted-foreground font-bold font-mono">Unique Hosts</span>
                            </div>
                          </div>

                          {/* getContributionStats() and getCodeFrequency() */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Commits Bar Chart */}
                            <div className="border border-border p-4 bg-muted/5 space-y-3">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <BarChart2 className="h-3.5 w-3.5" />
                                <span>getContributionStats() - Commits (Last 7 Days)</span>
                              </h4>
                              <div className="h-32 flex items-end gap-2 pt-4">
                                {[12, 19, 3, 5, 2, 24, 15].map((val, idx) => (
                                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div 
                                      className="w-full bg-foreground hover:bg-neutral-800 transition-all cursor-pointer"
                                      style={{ height: `${(val / 25) * 100}px` }}
                                      title={`${val} commits`}
                                    />
                                    <span className="text-[8px] text-muted-foreground uppercase">Day {idx + 1}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Code Frequency (Additions vs Deletions) */}
                            <div className="border border-border p-4 bg-muted/5 space-y-3">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>getCodeFrequency() - Volume (Last 14 Days)</span>
                              </h4>
                              <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px]">
                                    <span className="text-emerald-500 font-bold uppercase">Additions</span>
                                    <span>+12,482 lines</span>
                                  </div>
                                  <div className="w-full h-2.5 bg-muted/20 border border-border">
                                    <div className="bg-emerald-500 h-full w-[76%]" />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px]">
                                    <span className="text-red-500 font-bold uppercase">Deletions</span>
                                    <span>-3,921 lines</span>
                                  </div>
                                  <div className="w-full h-2.5 bg-muted/20 border border-border">
                                    <div className="bg-red-500 h-full w-[24%]" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* getPunchCard() */}
                          <div className="border border-border p-4 bg-muted/5 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>getPunchCard() - Commit Frequency Density</span>
                            </h4>
                            <div className="overflow-x-auto pt-2">
                              <div className="min-w-[480px] grid grid-rows-7 gap-1 font-mono text-[9px]">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dIdx) => (
                                  <div key={day} className="flex items-center gap-1.5">
                                    <span className="w-8 text-muted-foreground font-bold uppercase shrink-0">{day}</span>
                                    <div className="flex-1 flex gap-1">
                                      {Array.from({ length: 24 }).map((_, hIdx) => {
                                        // Fake punch card density
                                        const val = (dIdx * hIdx) % 5;
                                        const colorClass = 
                                          val === 4 ? "bg-emerald-500" :
                                          val === 3 ? "bg-emerald-600/80" :
                                          val === 2 ? "bg-emerald-700/60" :
                                          val === 1 ? "bg-emerald-800/30" : "bg-muted/10";
                                        return (
                                          <div 
                                            key={hIdx} 
                                            className={`flex-1 aspect-square border border-border/20 ${colorClass}`}
                                            title={`${day} @ ${hIdx}:00 -> commits density: ${val}`}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between text-[8px] text-muted-foreground uppercase pt-2 max-w-[480px] ml-10">
                                <span>12 AM</span>
                                <span>6 AM</span>
                                <span>12 PM</span>
                                <span>6 PM</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="border-t border-border bg-muted/10 p-3 text-[9px] text-muted-foreground font-mono flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Ready for git callbacks on selectedRepo. Listening to webhook payloads...</span>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
