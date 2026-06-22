"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { 
  ArrowLeft, Plus, Github, Clock, CheckCircle, HelpCircle, 
  ChevronRight, Mail, Ticket, PhoneCall, Terminal, ShieldAlert, GitPullRequest, Code, FileText
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

  const { data: details, isLoading } = trpc.velocity.getProjectDetails.useQuery({ id: projectId });
  const createFeatureMutation = trpc.velocity.createFeature.useMutation({
    onSuccess: (feature) => {
      utils.velocity.getProjectDetails.invalidate({ id: projectId });
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

  const forceProceedMutation = trpc.velocity.forceProceedFeature.useMutation({
    onSuccess: (feature) => {
      utils.velocity.getProjectDetails.invalidate({ id: projectId });
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      case "email": return <Mail className="h-3 w-3" />;
      case "support": return <Ticket className="h-3 w-3" />;
      case "call": return <PhoneCall className="h-3 w-3" />;
      default: return <Terminal className="h-3 w-3" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "intake":
        return <span className="border border-foreground/30 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-background text-foreground">Discovery Intake</span>;
      case "prd_generation":
        return <span className="border border-foreground/30 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-background text-foreground">PRD Specs</span>;
      case "tasks_breakdown":
        return <span className="border border-foreground/30 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-background text-foreground">Planning</span>;
      case "pr_review":
        return <span className="border border-foreground/30 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-background text-foreground">AI PR Review</span>;
      case "pr_approved":
        return <span className="border border-foreground bg-foreground px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-background">PR Approved</span>;
      case "shipped":
        return <span className="border border-foreground bg-foreground px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-background">SHIPPED</span>;
      case "educated":
        return <span className="border border-foreground/20 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Bandwidth Saved</span>;
      default:
        return <span className="border border-foreground/20 px-2 py-0.5 text-[9px] uppercase tracking-wider">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground font-mono">
        <Spinner className="h-6 w-6 text-foreground" />
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center bg-background text-foreground font-mono">
        <ShieldAlert className="h-10 w-10 text-foreground" />
        <h2 className="text-lg font-bold uppercase">Workspace Not Found</h2>
        <Link href="/">
          <Button variant="outline" className="rounded-none border-border font-mono text-xs uppercase tracking-wider mt-2">
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
    <div className="flex min-h-screen bg-background text-foreground font-mono bg-grid-dots relative">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 bg-foreground text-background flex items-center justify-center font-black text-sm tracking-tighter">
              VL
            </div>
            <div>
              <h1 className="font-bold text-xs uppercase tracking-wider leading-tight">Velocity</h1>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest block font-medium">Delivery Engine</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs uppercase tracking-wider">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-border transition-all">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Projects</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2 border border-foreground bg-foreground text-background font-bold transition-all">
              <Github className="h-4 w-4" />
              <span className="truncate">{project.name}</span>
            </div>
          </nav>
        </div>

        <div className="p-4 border border-border bg-background text-[10px] text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-1 uppercase tracking-widest">// PAIR_PROG_ACTIVE</p>
          <p>Move features from idea to prod with typesafe AI guidance hooks.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto border-l border-border/40">
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all mb-8 font-bold border border-border hover:border-foreground px-3 py-1.5 bg-card">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>

        {/* Project Profile Section */}
        <section className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-border/60 pb-8 mb-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-foreground">
                {project.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-card border border-border py-1 px-2.5">
                <Github className="h-3.5 w-3.5 shrink-0" />
                <span className="uppercase">{project.githubRepo.replace("https://", "").replace("github.com/", "")}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-sans leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </div>

          <Dialog open={isFeatureOpen} onOpenChange={setIsFeatureOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800 py-6 px-6 border-2 border-foreground gap-2 transition-all shrink-0">
                <Plus className="h-4 w-4" />
                <span>Submit Feature Request</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] bg-card border-2 border-foreground rounded-none p-6 font-mono text-foreground">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-lg font-bold uppercase tracking-tight">New Feature Intake</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs font-sans mt-1">
                    Enter the request requirements. Our AI agent will scan existing code offerings, ask follow-up questions, and auto-write the PRD.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Feature Title</label>
                    <Input
                      id="title"
                      placeholder="e.g. Email notifications on task assignments"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm py-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="desc" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Feature Request Details</label>
                    <Textarea
                      id="desc"
                      placeholder="Describe what needs to be built..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="rounded-none border-border bg-background focus:ring-0 focus:border-foreground text-sm min-h-[110px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="channel" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Intake Source / Channel</label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="rounded-none border-border bg-background focus:ring-0 focus:border-foreground py-5 text-xs">
                        <SelectValue placeholder="Select channel source" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border rounded-none font-mono">
                        <SelectItem value="direct">Direct Input (Internal Request)</SelectItem>
                        <SelectItem value="email">Email Intake</SelectItem>
                        <SelectItem value="support">Customer Support Ticket</SelectItem>
                        <SelectItem value="call">Customer Service Call Record</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-8 gap-3 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFeatureOpen(false)}
                    className="rounded-none font-mono text-xs uppercase tracking-widest border border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFeatureMutation.isPending}
                    className="rounded-none font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-neutral-800"
                  >
                    {createFeatureMutation.isPending ? "Analyzing..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* Feature Tabs */}
        <Tabs defaultValue="active" className="space-y-8">
          <TabsList className="bg-card p-1 rounded-none border border-border flex sm:inline-flex mb-2">
            <TabsTrigger value="active" className="rounded-none py-2 px-5 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-foreground data-[state=active]:text-background transition-all">
              In Progress ({activeFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="shipped" className="rounded-none py-2 px-5 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-foreground data-[state=active]:text-background transition-all">
              Shipped ({shippedFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="educated" className="rounded-none py-2 px-5 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-foreground data-[state=active]:text-background transition-all">
              Bandwidth Saved ({educatedFeatures.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="focus:outline-none">
            {activeFeatures.length === 0 ? (
              <div className="border border-dashed border-border bg-card p-12 text-center text-muted-foreground rounded-none">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="font-bold text-foreground text-sm uppercase mb-1">No Active Feature Flows</p>
                <p className="text-xs font-sans">Click "Submit Feature Request" to start discovery on a new requirement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeFeatures.map((f) => (
                  <div key={f.id} className="group border border-border hover:border-foreground bg-card transition-all duration-300 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black text-base uppercase text-foreground group-hover:text-primary transition-all">
                          {f.title}
                        </span>
                        {getStatusBadge(f.status)}
                        <Badge variant="outline" className="gap-1 bg-background border-border text-[9px] uppercase font-bold py-0.5 px-2 text-muted-foreground rounded-none">
                          {getChannelIcon(f.intakeChannel)}
                          <span>{f.intakeChannel}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs font-sans leading-relaxed line-clamp-2">
                        {f.description}
                      </p>
                    </div>

                    <Link href={`/features/${f.id}`} className="self-end sm:self-center shrink-0">
                      <Button className="rounded-none font-mono text-[10px] uppercase tracking-wider bg-background text-foreground border border-border hover:bg-foreground hover:text-background hover:border-foreground py-4 px-4 transition-all gap-1.5 group/btn">
                        <span>View Pipeline</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shipped" className="focus:outline-none">
            {shippedFeatures.length === 0 ? (
              <div className="border border-dashed border-border bg-card p-12 text-center text-muted-foreground rounded-none">
                <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="font-bold text-foreground text-sm uppercase mb-1">Nothing Shipped Yet</p>
                <p className="text-xs font-sans">Take feature requests through engineering reviews and approvals to deploy them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shippedFeatures.map((f) => (
                  <div key={f.id} className="border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black text-base uppercase text-foreground">
                          {f.title}
                        </span>
                        {getStatusBadge(f.status)}
                        <span className="text-[10px] text-muted-foreground font-bold">
                          SHIPPED: {isMounted ? new Date(f.updatedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs font-sans leading-relaxed line-clamp-2">
                        {f.description}
                      </p>
                    </div>

                    <Link href={`/features/${f.id}`} className="self-end sm:self-center shrink-0">
                      <Button variant="secondary" className="rounded-none font-mono text-[10px] uppercase tracking-wider bg-background text-foreground border border-border hover:bg-foreground hover:text-background hover:border-foreground py-4 px-4 transition-all gap-1.5 group/btn">
                        <span>View Release</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="educated" className="focus:outline-none">
            {educatedFeatures.length === 0 ? (
              <div className="border border-dashed border-border bg-card p-12 text-center text-muted-foreground rounded-none">
                <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="font-bold text-foreground text-sm uppercase mb-1">No Bandwidth Saved Cases</p>
                <p className="text-xs font-sans">Requests matching existing features will appear here to save engineering bandwidth.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {educatedFeatures.map((f) => (
                  <div key={f.id} className="border border-border bg-card p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-black text-base uppercase text-foreground">
                            {f.title}
                          </span>
                          {getStatusBadge(f.status)}
                        </div>
                        <p className="text-muted-foreground text-[10px] font-bold">
                          SOURCE REQUEST: "{f.description}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          variant="secondary"
                          onClick={() => forceProceedMutation.mutate({ featureId: f.id })}
                          disabled={forceProceedMutation.isPending}
                          className="rounded-none font-mono text-[10px] uppercase tracking-wider bg-background text-foreground border border-border hover:bg-foreground hover:text-background hover:border-foreground py-3.5 px-3 transition-all"
                        >
                          {forceProceedMutation.isPending ? "Proceeding..." : "Override & Build Custom"}
                        </Button>
                        <Link href={`/features/${f.id}`}>
                          <Button className="rounded-none font-mono text-[10px] uppercase tracking-wider bg-foreground text-background border border-foreground hover:bg-neutral-800 py-3.5 px-4 transition-all">
                            View Explanation
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 border border-border bg-background text-xs leading-relaxed text-muted-foreground flex gap-3">
                      <ShieldAlert className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground mb-1 text-[10px] uppercase tracking-widest">// AI RECOMMENDATION (BANDWIDTH SAVED)</p>
                        <p className="font-sans text-xs">{f.educationContent}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
