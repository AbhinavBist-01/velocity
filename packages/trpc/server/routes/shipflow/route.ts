import { z, zodUndefinedModel } from "../../schema";
import { shipflowService } from "../../services";
import { publicProcedure, router } from "../../trpc";

const TAGS = ["ShipFlow"];

// Output Validation Schemas for OpenAPI Generation
const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  githubRepo: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const FeatureSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  intakeChannel: z.string(),
  isEducated: z.boolean(),
  educationContent: z.string().nullable(),
  missingContext: z.unknown(),
  prdContent: z.string().nullable(),
  branchName: z.string().nullable(),
  prNumber: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const TaskSchema = z.object({
  id: z.string().uuid(),
  featureId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  priority: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PullRequestSchema = z.object({
  id: z.string().uuid(),
  featureId: z.string().uuid(),
  title: z.string(),
  branchName: z.string(),
  status: z.string(),
  diffData: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const AiReviewSchema = z.object({
  id: z.string().uuid(),
  pullRequestId: z.string().uuid(),
  status: z.string(),
  summary: z.string().nullable(),
  comments: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const shipflowRouter = router({
  getProjects: publicProcedure
    .meta({ openapi: { method: "GET", path: "/shipflow/projects", tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(ProjectSchema))
    .query(async () => {
      return shipflowService.getProjects();
    }),

  getProjectDetails: publicProcedure
    .meta({ openapi: { method: "GET", path: "/shipflow/projects/{id}", tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .output(z.object({
      project: ProjectSchema,
      features: z.array(FeatureSchema),
    }))
    .query(async ({ input }) => {
      return shipflowService.getProjectDetails(input.id);
    }),

  createProject: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/projects", tags: TAGS } })
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        githubRepo: z.string().min(1),
      })
    )
    .output(ProjectSchema)
    .mutation(async ({ input }) => {
      return shipflowService.createProject(input.name, input.description, input.githubRepo);
    }),

  getFeatureDetails: publicProcedure
    .meta({ openapi: { method: "GET", path: "/shipflow/features/{id}", tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .output(z.object({
      feature: FeatureSchema,
      project: ProjectSchema,
      tasks: z.array(TaskSchema),
      pullRequest: PullRequestSchema.optional(),
      aiReview: AiReviewSchema.optional(),
    }))
    .query(async ({ input }) => {
      return shipflowService.getFeatureDetails(input.id);
    }),

  createFeature: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features", tags: TAGS } })
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        intakeChannel: z.string(),
      })
    )
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return shipflowService.createFeature(
        input.projectId,
        input.title,
        input.description,
        input.intakeChannel
      );
    }),

  forceProceedFeature: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/{featureId}/proceed", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return shipflowService.forceProceedFeature(input.featureId);
    }),

  submitIntakeAnswers: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/intake", tags: TAGS } })
    .input(
      z.object({
        featureId: z.string(),
        answers: z.array(z.string()),
      })
    )
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return shipflowService.submitIntakeAnswers(input.featureId, input.answers);
    }),

  approvePrd: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/approve-prd", tags: TAGS } })
    .input(
      z.object({
        featureId: z.string(),
        prdContent: z.string().optional(),
      })
    )
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return shipflowService.approvePrd(input.featureId, input.prdContent);
    }),

  updateTaskStatus: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/tasks/status", tags: TAGS } })
    .input(
      z.object({
        taskId: z.string(),
        status: z.string(),
      })
    )
    .output(TaskSchema)
    .mutation(async ({ input }) => {
      return shipflowService.updateTaskStatus(input.taskId, input.status);
    }),

  initializeBranch: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/initialize-branch", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(PullRequestSchema)
    .mutation(async ({ input }) => {
      return shipflowService.initializeBranch(input.featureId);
    }),

  runAiReview: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/run-review", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(AiReviewSchema)
    .mutation(async ({ input }) => {
      return shipflowService.runAiReview(input.featureId);
    }),

  submitFixes: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/submit-fixes", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(z.object({
      pullRequest: PullRequestSchema,
      aiReview: AiReviewSchema,
    }))
    .mutation(async ({ input }) => {
      return shipflowService.submitFixes(input.featureId);
    }),

  approveRelease: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/approve-release", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return shipflowService.approveRelease(input.featureId);
    }),

  shipFeature: publicProcedure
    .meta({ openapi: { method: "POST", path: "/shipflow/features/ship", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(z.object({
      feature: FeatureSchema,
      releaseNotes: z.string(),
    }))
    .mutation(async ({ input }) => {
      return shipflowService.shipFeature(input.featureId);
    }),
});
