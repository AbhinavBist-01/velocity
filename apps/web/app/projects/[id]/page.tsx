"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { 
  ArrowLeft, Plus, Github, Clock, CheckCircle, HelpCircle, 
  ChevronRight, Mail, Ticket, PhoneCall, Terminal, ShieldAlert 
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const utils = trpc.useUtils();

  const { data: details, isLoading } = trpc.shipflow.getProjectDetails.useQuery({ id: projectId });
  const createFeatureMutation = trpc.shipflow.createFeature.useMutation({
    onSuccess: (feature) => {
      utils.shipflow.getProjectDetails.invalidate({ id: projectId });
      setIsFeatureOpen(false);
      setTitle("");
      setDesc("");
      setChannel("direct");
      toast.success("Feature request submitted!");
      router.push(`/features/${feature.id}`);
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const forceProceedMutation = trpc.shipflow.forceProceedFeature.useMutation({
    onSuccess: (feature) => {
      utils.shipflow.getProjectDetails.invalidate({ id: projectId });
      toast.success("Proceeding with custom feature setup.");
      router.push(`/features/${feature.id}`);
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    }
  });

  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [channel, setChannel] = useState("direct");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) {
      toast.warning("Title and description are required.");
      return;
    }
    createFeatureMutation.mutate({
      projectId,
      title,
      description: desc,
      intakeChannel: channel,
    });
  };

  const getChannelIcon = (c: string) => {
    switch (c) {
      case "email": return <Mail className="h-3.5 w-3.5" />;
      case "support": return <Ticket className="h-3.5 w-3.5" />;
      case "call": return <PhoneCall className="h-3.5 w-3.5" />;
      default: return <Terminal className="h-3.5 w-3.5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "intake":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Intake / Context</Badge>;
      case "prd_generation":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">PRD Generation</Badge>;
      case "tasks_breakdown":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Tasks & Planning</Badge>;
      case "pr_review":
        return <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">Code & PR Review</Badge>;
      case "pr_approved":
        return <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Lead Approved</Badge>;
      case "shipped":
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Shipped</Badge>;
      case "educated":
        return <Badge variant="secondary" className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20">Educated / Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Workspace Not Found</h2>
        <Link href="/">
          <Button variant="outline" className="gap-2 rounded-xl mt-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const { project, features } = details;
  const activeFeatures = features.filter(f => f.status !== "shipped" && f.status !== "educated");
  const shippedFeatures = features.filter(f => f.status === "shipped");
  const educatedFeatures = features.filter(f => f.status === "educated");

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
              <span>Projects</span>
            </Link>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium transition-all">
              <Github className="h-4 w-4" />
              <span className="truncate">{project.name}</span>
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>

        {/* Project Profile */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/60 pb-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                {project.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border/40 py-1 px-2.5 rounded-full font-medium">
                <Github className="h-3.5 w-3.5" />
                <span>{project.githubRepo.replace("https://", "").replace("github.com/", "")}</span>
              </div>
            </div>
            <p className="text-muted-foreground max-w-3xl text-base leading-relaxed">
              {project.description}
            </p>
          </div>

          <Dialog open={isFeatureOpen} onOpenChange={setIsFeatureOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold px-6 py-5 rounded-xl self-start lg:self-center">
                <Plus className="h-5 w-5" />
                <span>Submit Feature Request</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] bg-card border border-border rounded-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold">New Feature Intake</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    Enter the request. The AI agent will check for existing matches, ask follow-up questions, and generate a PRD.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature Title</label>
                    <Input
                      id="title"
                      placeholder="e.g. Email notifications on task assignments"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl border-input/60 focus:border-primary transition-all py-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="desc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature Request Details</label>
                    <Textarea
                      id="desc"
                      placeholder="e.g. We want assigned users to get emails. Include email contents like task name and assignee. Provide a toggle to turn it off."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="rounded-xl border-input/60 focus:border-primary transition-all min-h-[110px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="channel" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intake Source / Channel</label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="rounded-xl border-input/60 focus:border-primary py-5">
                        <SelectValue placeholder="Select channel source" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-xl">
                        <SelectItem value="direct">Direct Input (Internal Request)</SelectItem>
                        <SelectItem value="email">Email Intake</SelectItem>
                        <SelectItem value="support">Customer Support Ticket</SelectItem>
                        <SelectItem value="call">Customer Service Call Record</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-6 gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFeatureOpen(false)}
                    className="rounded-xl font-medium border-border/80"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFeatureMutation.isPending}
                    className="rounded-xl font-medium"
                  >
                    {createFeatureMutation.isPending ? "Analyzing..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* Feature Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto border border-border/30 flex sm:inline-flex">
            <TabsTrigger value="active" className="rounded-lg py-2 px-5 font-semibold text-sm flex-1 sm:flex-none">
              In Progress ({activeFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="shipped" className="rounded-lg py-2 px-5 font-semibold text-sm flex-1 sm:flex-none">
              Shipped ({shippedFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="educated" className="rounded-lg py-2 px-5 font-semibold text-sm flex-1 sm:flex-none">
              Educated ({educatedFeatures.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="focus:outline-none">
            {activeFeatures.length === 0 ? (
              <div className="border border-dashed border-border/80 rounded-2xl p-12 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
                <p className="font-semibold text-foreground text-base mb-1">No Active Feature Flows</p>
                <p className="text-sm">Click "Submit Feature Request" to start discovery on a new requirement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeFeatures.map((f) => (
                  <Card key={f.id} className="group hover:border-primary/40 border-border/80 transition-all rounded-xl overflow-hidden shadow-sm">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {f.title}
                          </span>
                          {getStatusBadge(f.status)}
                          <Badge variant="outline" className="gap-1 bg-muted/40 border-border text-[10px] uppercase font-bold py-0.5 px-2 text-muted-foreground">
                            {getChannelIcon(f.intakeChannel)}
                            <span>{f.intakeChannel}</span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                          {f.description}
                        </p>
                      </div>

                      <Link href={`/features/${f.id}`} className="self-end sm:self-center">
                        <Button className="gap-1.5 rounded-xl font-medium shadow-sm hover:shadow transition-all">
                          <span>View Pipeline</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shipped" className="focus:outline-none">
            {shippedFeatures.length === 0 ? (
              <div className="border border-dashed border-border/80 rounded-2xl p-12 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
                <p className="font-semibold text-foreground text-base mb-1">Nothing Shipped Yet</p>
                <p className="text-sm">Take feature requests through engineering reviews and lead approvals to ship them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shippedFeatures.map((f) => (
                  <Card key={f.id} className="border-border/80 rounded-xl overflow-hidden shadow-sm">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-500/[0.01]">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-lg text-foreground">
                            {f.title}
                          </span>
                          {getStatusBadge(f.status)}
                          <span className="text-xs text-muted-foreground font-medium">
                            Shipped: {new Date(f.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {f.description}
                        </p>
                      </div>

                      <Link href={`/features/${f.id}`} className="self-end sm:self-center">
                        <Button variant="secondary" className="gap-1.5 rounded-xl font-medium border border-border/60 hover:bg-muted/80">
                          <span>View Release</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="educated" className="focus:outline-none">
            {educatedFeatures.length === 0 ? (
              <div className="border border-dashed border-border/80 rounded-2xl p-12 text-center text-muted-foreground">
                <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
                <p className="font-semibold text-foreground text-base mb-1">No Educated Requests</p>
                <p className="text-sm">Requests matching existing features will appear here to save engineering bandwidth.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {educatedFeatures.map((f) => (
                  <Card key={f.id} className="border-border/80 rounded-xl overflow-hidden shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-lg text-foreground">
                              {f.title}
                            </span>
                            {getStatusBadge(f.status)}
                          </div>
                          <p className="text-muted-foreground text-xs font-semibold">
                            Source Request: "{f.description}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="secondary"
                            onClick={() => forceProceedMutation.mutate({ featureId: f.id })}
                            disabled={forceProceedMutation.isPending}
                            className="rounded-xl text-xs font-medium border border-border/60"
                          >
                            {forceProceedMutation.isPending ? "Proceeding..." : "Override & Build Custom"}
                          </Button>
                          <Link href={`/features/${f.id}`}>
                            <Button className="rounded-xl text-xs font-medium">
                              View Explanation
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/60 border border-border/40 text-sm leading-relaxed text-muted-foreground flex gap-3">
                        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground mb-1 text-xs uppercase tracking-wider">AI Recommendation (Bandwidth Saved)</p>
                          <p>{f.educationContent}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
