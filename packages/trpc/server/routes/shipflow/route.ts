import { z, zodUndefinedModel } from "../../schema";
import { shipflowService } from "../../services";
import { publicProcedure, router } from "../../trpc";

export const shipflowRouter = router({
  getProjects: publicProcedure
    .input(zodUndefinedModel)
    .query(async () => {
      return shipflowService.getProjects();
    }),

  getProjectDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return shipflowService.getProjectDetails(input.id);
    }),

  createProject: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        githubRepo: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return shipflowService.createProject(input.name, input.description, input.githubRepo);
    }),

  getFeatureDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return shipflowService.getFeatureDetails(input.id);
    }),

  createFeature: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        intakeChannel: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return shipflowService.createFeature(
        input.projectId,
        input.title,
        input.description,
        input.intakeChannel
      );
    }),

  forceProceedFeature: publicProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      return shipflowService.forceProceedFeature(input.featureId);
    }),

  submitIntakeAnswers: publicProcedure
    .input(
      z.object({
        featureId: z.string(),
        answers: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return shipflowService.submitIntakeAnswers(input.featureId, input.answers);
    }),

  approvePrd: publicProcedure
    .input(
      z.object({
        featureId: z.string(),
        prdContent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return shipflowService.approvePrd(input.featureId, input.prdContent);
    }),

  updateTaskStatus: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return shipflowService.updateTaskStatus(input.taskId, input.status);
    }),

  initializeBranch: publicProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      return shipflowService.initializeBranch(input.featureId);
    }),

  runAiReview: publicProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      return shipflowService.runAiReview(input.featureId);
    }),

  submitFixes: publicProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      return shipflowService.submitFixes(input.featureId);
    }),

  approveRelease: publicProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      return shipflowService.approveRelease(input.featureId);
    }),

  shipFeature: publicProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      return shipflowService.shipFeature(input.featureId);
    }),
});
