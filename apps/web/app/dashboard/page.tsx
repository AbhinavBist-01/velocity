"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Plus, Github, ArrowRight, Kanban, Clock, Terminal, ChevronRight, ChevronLeft, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { useLogout, useUser } from "~/hooks/api/auth";

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

  const { data: projects, isLoading } = trpc.velocity.getProjects.useQuery();
  const createProjectMutation = trpc.velocity.createProject.useMutation({
    onSuccess: () => {
      utils.velocity.getProjects.invalidate();
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setRepo("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !repo) {
      toast.warning("Please fill out all fields.");
      return;
      }
    createProjectMutation.mutate({
      name,
      description,
      githubRepo: repo,
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
            <div
              title="Projects"
              className={`flex items-center transition-all duration-200 border border-foreground bg-foreground text-background font-bold ${
                isCollapsed 
                  ? "h-10 w-10 justify-center mx-auto p-0" 
                  : "px-3 py-2.5 gap-3 w-full"
              }`}
            >
              <Kanban className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Projects</span>}
            </div>
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
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto border-l border-border/40">
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

                  <div className="space-y-2">
                    <label htmlFor="repo" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">GitHub Repository</label>
                    <div className="relative">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="repo"
                        placeholder="github.com/username/project-repo"
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        className="pl-10 rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm py-5"
                      />
                    </div>
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
                    disabled={createProjectMutation.isPending}
                    className="rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800"
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
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
                {/* Structural Top Line indicator */}
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
      </main>
    </div>
  );
}
