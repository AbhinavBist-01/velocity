"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Plus, Github, ArrowRight, Kanban, Clock, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";

export default function Dashboard() {
  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.shipflow.getProjects.useQuery();
  const createProjectMutation = trpc.shipflow.createProject.useMutation({
    onSuccess: () => {
      utils.shipflow.getProjects.invalidate();
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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">SF</span>
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">ShipFlow AI</h1>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Delivery Engine</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <Clock className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium transition-all">
              <Kanban className="h-4 w-4" />
              <span>Projects</span>
            </div>
          </nav>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Pair Programming Active</p>
          <p className="leading-normal">Move features from idea to prod with AI guidance.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              Deliver Features Faster
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your product discovery, PRD generation, tasks, AI reviews, and approvals.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium py-5 px-6 rounded-xl">
                <Plus className="h-5 w-5" />
                <span>New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-card border border-border rounded-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    Set up your workspace and connect it to a repository to begin the feature flow.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Name</label>
                    <Input
                      id="name"
                      placeholder="e.g. My SaaS Platform"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border-input/60 focus:border-primary transition-all py-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the app purpose..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-input/60 focus:border-primary transition-all min-h-[90px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="repo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GitHub Repository</label>
                    <div className="relative">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="repo"
                        placeholder="github.com/username/project-repo"
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        className="pl-10 rounded-xl border-input/60 focus:border-primary transition-all py-5"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6 gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl font-medium border-border/80"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="rounded-xl font-medium"
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading projects...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="border border-dashed border-border/80 rounded-3xl p-16 text-center max-w-xl mx-auto flex flex-col items-center gap-6 mt-8">
            <div className="p-4 rounded-2xl bg-muted/80 text-muted-foreground">
              <Kanban className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">No Projects Configured</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                Kick off the ShipFlow lifecycle. Add your first project, define requirements, generate branches, run reviews, and ship features.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 font-medium px-6 py-5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Project</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:border-primary/50 transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden relative border-border/80 shadow-md bg-card">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary/30 to-primary group-hover:opacity-100 opacity-60 transition-opacity" />
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted border border-border/40 py-1.5 px-3 rounded-full">
                      <Github className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[140px]">{project.githubRepo.replace("https://", "").replace("github.com/", "")}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors mb-2.5 truncate">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="p-6 border-t border-border/40 bg-card">
                  <Link href={`/projects/${project.id}`} className="w-full">
                    <Button variant="secondary" className="w-full gap-2 rounded-xl py-4 font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <span>Open Workspace</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
