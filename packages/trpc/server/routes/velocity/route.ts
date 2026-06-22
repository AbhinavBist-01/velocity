import { z, zodUndefinedModel } from "../../schema";
import { velocityService } from "../../services";
import { publicProcedure, protectedProcedure, router } from "../../trpc";

const TAGS = ["Velocity"];

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

export const velocityRouter = router({
  getProjects: publicProcedure
    .meta({ openapi: { method: "GET", path: "/velocity/projects", tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(ProjectSchema))
    .query(async () => {
      return velocityService.getProjects();
    }),

  getProjectDetails: publicProcedure
    .meta({ openapi: { method: "GET", path: "/velocity/projects/{id}", tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .output(z.object({
      project: ProjectSchema,
      features: z.array(FeatureSchema),
    }))
    .query(async ({ input }) => {
      return velocityService.getProjectDetails(input.id);
    }),

  createProject: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/projects", tags: TAGS } })
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        githubRepo: z.string().min(1),
      })
    )
    .output(ProjectSchema)
    .mutation(async ({ input }) => {
      return velocityService.createProject(input.name, input.description, input.githubRepo);
    }),

  getFeatureDetails: publicProcedure
    .meta({ openapi: { method: "GET", path: "/velocity/features/{id}", tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .output(z.object({
      feature: FeatureSchema,
      project: ProjectSchema,
      tasks: z.array(TaskSchema),
      pullRequest: PullRequestSchema.optional(),
      aiReview: AiReviewSchema.optional(),
    }))
    .query(async ({ input }) => {
      return velocityService.getFeatureDetails(input.id);
    }),

  createFeature: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features", tags: TAGS } })
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
      return velocityService.createFeature(
        input.projectId,
        input.title,
        input.description,
        input.intakeChannel
      );
    }),

  forceProceedFeature: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/{featureId}/proceed", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return velocityService.forceProceedFeature(input.featureId);
    }),

  submitIntakeAnswers: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/intake", tags: TAGS } })
    .input(
      z.object({
        featureId: z.string(),
        answers: z.array(z.string()),
      })
    )
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return velocityService.submitIntakeAnswers(input.featureId, input.answers);
    }),

  approvePrd: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/approve-prd", tags: TAGS } })
    .input(
      z.object({
        featureId: z.string(),
        prdContent: z.string().optional(),
      })
    )
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return velocityService.approvePrd(input.featureId, input.prdContent);
    }),

  updateTaskStatus: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/tasks/status", tags: TAGS } })
    .input(
      z.object({
        taskId: z.string(),
        status: z.string(),
      })
    )
    .output(TaskSchema)
    .mutation(async ({ input }) => {
      return velocityService.updateTaskStatus(input.taskId, input.status);
    }),

  initializeBranch: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/initialize-branch", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(PullRequestSchema)
    .mutation(async ({ input }) => {
      return velocityService.initializeBranch(input.featureId);
    }),

  runAiReview: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/run-review", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(AiReviewSchema)
    .mutation(async ({ input }) => {
      return velocityService.runAiReview(input.featureId);
    }),

  submitFixes: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/submit-fixes", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(z.object({
      pullRequest: PullRequestSchema,
      aiReview: AiReviewSchema,
    }))
    .mutation(async ({ input }) => {
      return velocityService.submitFixes(input.featureId);
    }),

  approveRelease: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/approve-release", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(FeatureSchema)
    .mutation(async ({ input }) => {
      return velocityService.approveRelease(input.featureId);
    }),

  shipFeature: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/velocity/features/ship", tags: TAGS } })
    .input(z.object({ featureId: z.string() }))
    .output(z.object({
      feature: FeatureSchema,
      releaseNotes: z.string(),
    }))
    .mutation(async ({ input }) => {
      return velocityService.shipFeature(input.featureId);
    }),
});
