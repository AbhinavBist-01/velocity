import { db, eq, and, desc } from "@repo/database";
import {
  projectsTable,
  featuresTable,
  tasksTable,
  pullRequestsTable,
  aiReviewsTable,
  SelectProject,
  SelectFeature,
  SelectTask,
  SelectPullRequest,
  SelectAiReview
} from "@repo/database/schema";

export class VelocityService {
  // 1. Projects
  public async createProject(name: string, description: string, githubRepo: string): Promise<SelectProject> {
    const [project] = await db
      .insert(projectsTable)
      .values({
        name,
        description,
        githubRepo,
      })
      .returning();
    if (!project) throw new Error("Failed to create project");
    return project;
  }

  public async getProjects(): Promise<SelectProject[]> {
    return db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
  }

  public async getProjectDetails(id: string): Promise<{ project: SelectProject; features: SelectFeature[] }> {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!project) throw new Error("Project not found");
    const features = await db.select().from(featuresTable).where(eq(featuresTable.projectId, id)).orderBy(desc(featuresTable.createdAt));
    return { project, features };
  }

  // 2. Features
  public async createFeature(projectId: string, title: string, description: string, intakeChannel: string): Promise<SelectFeature> {
    const status = "intake";

    // Default missing context questions
    const missingContext = [
      { question: "What is the primary target user group for this feature?", answer: "" },
      { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
      { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
    ];

    const [feature] = await db
      .insert(featuresTable)
      .values({
        projectId,
        title,
        description,
        intakeChannel,
        isEducated: false,
        educationContent: null,
        missingContext,
        status,
      })
      .returning();
    if (!feature) throw new Error("Failed to create feature");
    return feature;
  }

  public async getFeatureDetails(id: string): Promise<{
    feature: SelectFeature;
    project: SelectProject;
    tasks: SelectTask[];
    pullRequest?: SelectPullRequest;
    aiReview?: SelectAiReview;
  }> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, id)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, feature.projectId)).limit(1);
    if (!project) throw new Error("Project not found");

    const tasks = await db.select().from(tasksTable).where(eq(tasksTable.featureId, id)).orderBy(tasksTable.createdAt);
    
    const [pullRequest] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.featureId, id)).limit(1);
    
    let aiReview: SelectAiReview | undefined;
    if (pullRequest) {
      const [review] = await db.select().from(aiReviewsTable).where(eq(aiReviewsTable.pullRequestId, pullRequest.id)).limit(1);
      aiReview = review;
    }

    return { feature, project, tasks, pullRequest, aiReview };
  }

  public async forceProceedFeature(featureId: string): Promise<SelectFeature> {
    const missingContext = [
      { question: "What is the primary target user group for this feature?", answer: "" },
      { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
      { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
    ];

    const [feature] = await db
      .update(featuresTable)
      .set({
        isEducated: false,
        status: "intake",
        missingContext,
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!feature) throw new Error("Failed to proceed feature");
    return feature;
  }

  public async submitIntakeAnswers(featureId: string, answers: string[]): Promise<SelectFeature> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const missingContext = (feature.missingContext as any[]).map((item, idx) => ({
      ...item,
      answer: answers[idx] || "Not provided",
    }));

    // Generate a rich PRD based on inputs
    const userGroup = answers[0] || "General users";
    const constraints = answers[1] || "None specified";
    const integrations = answers[2] || "None required";

    const prdContent = `# Product Requirements Document (PRD): ${feature.title}

## 1. Problem Statement
${feature.description}

## 2. Goals
* Implement a robust, secure solution that fulfills user request.
* Minimize performance overhead and ensure high availability.
* Enable seamless access for ${userGroup}.

## 3. Non-Goals
* Re-architecting the core database schemas outside this scope.
* Supporting deprecated browsers or operating systems.

## 4. User Stories
* **US-1**: As a user (${userGroup}), I want to utilize this feature so that I can improve my workflow efficiency.
* **US-2**: As an admin, I want to configure the rules for this feature so that we maintain organizational control.

## 5. Functional Requirements
* **FR-1**: The system must provide a user-friendly configuration interface.
* **FR-2**: Input data validation must be strictly enforced:
  * Constraints: ${constraints}
* **FR-3**: Must integrate with ${integrations} seamlessly.
* **FR-4**: Security check: Require authenticated sessions for all read/write endpoints.

## 6. Edge Cases
* Submitting empty or malformed inputs must trigger descriptive error alerts.
* Handling concurrent request spikes by implementing client-side rate limits.

## 7. Success Metrics
* Active adoption rate of > 75% within the target user group (${userGroup}) in the first 30 days.
* Average latency under 200ms for all read operations.
`;

    const [updatedFeature] = await db
      .update(featuresTable)
      .set({
        missingContext,
        prdContent,
        status: "prd_generation",
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!updatedFeature) throw new Error("Failed to update feature");
    return updatedFeature;
  }

  public async approvePrd(featureId: string, customPrdText?: string): Promise<SelectFeature> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const finalPrd = customPrdText || feature.prdContent || "";

    // Parse the PRD and generate tasks
    const tasks = [
      {
        title: `Setup database migrations for ${feature.title}`,
        description: "Create schema definitions, models, and run Drizzle migrations to support feature data.",
        priority: "high",
        status: "todo",
      },
      {
        title: `Implement backend service and routes for ${feature.title}`,
        description: "Create core service logic and expose them via tRPC/Express router endpoints.",
        priority: "high",
        status: "todo",
      },
      {
        title: `Build user interface components for ${feature.title}`,
        description: "Create high-fidelity client components using Tailwind CSS and Radix UI elements.",
        priority: "medium",
        status: "todo",
      },
      {
        title: `Implement input validation and rate limiting for ${feature.title}`,
        description: "Strictly validate all inputs on client/server side, handling potential edge cases.",
        priority: "medium",
        status: "todo",
      }
    ];

    // Insert tasks
    for (const t of tasks) {
      await db.insert(tasksTable).values({
        featureId,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
      });
    }

    const [updatedFeature] = await db
      .update(featuresTable)
      .set({
        prdContent: finalPrd,
        status: "tasks_breakdown",
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!updatedFeature) throw new Error("Failed to update feature");
    return updatedFeature;
  }

  // 3. Tasks
  public async updateTaskStatus(taskId: string, status: string): Promise<SelectTask> {
    const [task] = await db
      .update(tasksTable)
      .set({ status })
      .where(eq(tasksTable.id, taskId))
      .returning();
    if (!task) throw new Error("Failed to update task");
    return task;
  }

  // 4. Git Branch & Pull Request
  public async initializeBranch(featureId: string): Promise<SelectPullRequest> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const branchName = `feature/${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const prNumber = Math.floor(Math.random() * 1000) + 100;

    // Set branch in feature
    await db
      .update(featuresTable)
      .set({
        branchName,
        prNumber,
        status: "pr_review",
      })
      .where(eq(featuresTable.id, featureId));

    // Create pull request
    const diffData = [
      {
        filepath: "packages/database/schema.ts",
        status: "modified",
        content: `// Added support for ${feature.title}
export const ${feature.title.replace(/[^a-zA-Z0-9]+/g, "")}Table = pgTable("${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});`,
        diff: `@@ -1,3 +1,8 @@
 export * from "./models/user";
 export * from "./models/velocity";
+
+export const ${feature.title.replace(/[^a-zA-Z0-9]+/g, "")}Table = pgTable("${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}", {
+  id: uuid("id").primaryKey().defaultRandom(),
+  data: text("data").notNull(),
+  createdAt: timestamp("created_at").defaultNow(),
+});`
      },
      {
        filepath: "apps/api/src/routes/feature.ts",
        status: "added",
        content: `import { router, publicProcedure } from "../trpc";
import { z } from "zod";
 
// Endpoint to fetch feature configurations
export const featureRouter = router({
  getConfig: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // NOTE: Rate limiting or authorization check is missing here!
      return { id: input.id, enabled: true };
    })
});`,
        diff: `+++ apps/api/src/routes/feature.ts
+import { router, publicProcedure } from "../trpc";
+import { z } from "zod";
+
+export const featureRouter = router({
+  getConfig: publicProcedure
+    .input(z.object({ id: z.string() }))
+    .query(async ({ input }) => {
+      // NOTE: Rate limiting or authorization check is missing here!
+      return { id: input.id, enabled: true };
+    })
+});`
      }
    ];

    const [pullRequest] = await db
      .insert(pullRequestsTable)
      .values({
        featureId,
        title: `Implement ${feature.title}`,
        branchName,
        status: "open",
        diffData,
      })
      .returning();
    if (!pullRequest) throw new Error("Failed to create pull request");

    // Setup tasks to in_progress or done
    await db.update(tasksTable).set({ status: "in_progress" }).where(eq(tasksTable.featureId, featureId));

    return pullRequest;
  }

  // 5. AI Review
  public async runAiReview(featureId: string): Promise<SelectAiReview> {
    const [pullRequest] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.featureId, featureId)).limit(1);
    if (!pullRequest) throw new Error("Pull request not found");

    // Simulating AI code reviews finding issues against PRD requirements
    const comments = [
      {
        filepath: "apps/api/src/routes/feature.ts",
        line: 9,
        type: "error",
        text: "❌ Security & Validation issue (FR-4): This endpoint lacks auth credentials checks. Any unauthenticated caller can query it. You must add authorization verification middleware.",
        requirementId: "FR-4"
      },
      {
        filepath: "apps/api/src/routes/feature.ts",
        line: 10,
        type: "warning",
        text: "⚠️ Missing constraints (FR-2 & Edge Cases): This route is not rate-limited. Under heavy concurrent spikes, it could lead to service overload. Implement rate limiter middleware.",
        requirementId: "FR-2"
      }
    ];

    // Check if we already have a review
    const [existingReview] = await db.select().from(aiReviewsTable).where(eq(aiReviewsTable.pullRequestId, pullRequest.id)).limit(1);

    let review: SelectAiReview;

    if (existingReview) {
      const [updatedReview] = await db
        .update(aiReviewsTable)
        .set({
          status: "changes_requested",
          summary: "AI review failed: Found 1 security vulnerability and 1 critical edge case. Please fix authorization middleware and add rate limiting.",
          comments,
        })
        .where(eq(aiReviewsTable.id, existingReview.id))
        .returning();
      if (!updatedReview) throw new Error("Failed to update AI review");
      review = updatedReview;
    } else {
      const [newReview] = await db
        .insert(aiReviewsTable)
        .values({
          pullRequestId: pullRequest.id,
          status: "changes_requested",
          summary: "AI review failed: Found 1 security vulnerability and 1 critical edge case. Please fix authorization middleware and add rate limiting.",
          comments,
        })
        .returning();
      if (!newReview) throw new Error("Failed to create AI review");
      review = newReview;
    }

    return review;
  }

  public async submitFixes(featureId: string): Promise<{ pullRequest: SelectPullRequest; aiReview: SelectAiReview }> {
    const [pullRequest] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.featureId, featureId)).limit(1);
    if (!pullRequest) throw new Error("Pull request not found");

    const updatedDiffData = [
      {
        filepath: "packages/database/schema.ts",
        status: "modified",
        content: `// Added support for ${pullRequest.title}
export const FeatureTable = pgTable("features_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});`,
        diff: `@@ -1,3 +1,8 @@
 export * from "./models/user";
 export * from "./models/velocity";
+
+export const FeatureTable = pgTable("features_data", {
+  id: uuid("id").primaryKey().defaultRandom(),
+  data: text("data").notNull(),
+  createdAt: timestamp("created_at").defaultNow(),
+});`
      },
      {
        filepath: "apps/api/src/routes/feature.ts",
        status: "added",
        content: `import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { rateLimiter } from "../middleware/rate-limiter";
 
// Endpoint to fetch feature configurations
export const featureRouter = router({
  getConfig: protectedProcedure // Added authorization check (FR-4)
    .input(z.object({ id: z.string() }))
    .use(rateLimiter({ max: 60, windowMs: 60000 })) // Added Rate limiting (FR-2 & Edge Cases)
    .query(async ({ input }) => {
      return { id: input.id, enabled: true };
    })
});`,
        diff: `+++ apps/api/src/routes/feature.ts
+import { router, protectedProcedure } from "../trpc";
+import { z } from "zod";
+import { rateLimiter } from "../middleware/rate-limiter";
+
+export const featureRouter = router({
+  getConfig: protectedProcedure
+    .input(z.object({ id: z.string() }))
+    .use(rateLimiter({ max: 60, windowMs: 60000 }))
+    .query(async ({ input }) => {
+      return { id: input.id, enabled: true };
+    })
+});`
      }
    ];

    const [updatedPR] = await db
      .update(pullRequestsTable)
      .set({
        diffData: updatedDiffData,
      })
      .where(eq(pullRequestsTable.id, pullRequest.id))
      .returning();
    if (!updatedPR) throw new Error("Failed to update pull request");

    // Update AI review to passed
    const [updatedReview] = await db
      .update(aiReviewsTable)
      .set({
        status: "passed",
        summary: "✅ All automated checks passed! Found 0 errors or warnings. Code complies with all PRD functional requirements.",
        comments: [
          {
            filepath: "apps/api/src/routes/feature.ts",
            line: 7,
            type: "info",
            text: "✅ Passed (FR-4): Endpoint successfully protected by authorization checks.",
            requirementId: "FR-4"
          },
          {
            filepath: "apps/api/src/routes/feature.ts",
            line: 9,
            type: "info",
            text: "✅ Passed (FR-2 & Edge Cases): Rate limiter successfully implemented.",
            requirementId: "FR-2"
          }
        ],
      })
      .where(eq(aiReviewsTable.pullRequestId, pullRequest.id))
      .returning();
    if (!updatedReview) throw new Error("Failed to update AI review");

    // Set all tasks as done
    await db.update(tasksTable).set({ status: "done" }).where(eq(tasksTable.featureId, featureId));

    return { pullRequest: updatedPR, aiReview: updatedReview };
  }

  // 6. Approval & Ship
  public async approveRelease(featureId: string): Promise<SelectFeature> {
    const [feature] = await db
      .update(featuresTable)
      .set({
        status: "pr_approved",
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!feature) throw new Error("Failed to approve release");
    return feature;
  }

  public async shipFeature(featureId: string): Promise<{ feature: SelectFeature; releaseNotes: string }> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const releaseNotes = `## Release Notes: ${feature.title}

We are excited to announce the release of **${feature.title}**!

### What's New
* **Comprehensive Implementation**: Delivered core capabilities matching the user requirements.
* **Full Context Security**: Verified by AI Code Reviewer to ensure authentication checking (FR-4) and rate limiting (FR-2) are fully enforced.
* **Database Migrations**: Successfully migrated backend schemas with full integrity.

### Changes Included
* Expose secure config API route with standard validation filters.
* Support customizable rate limits to prevent denial-of-service edge cases.
`;

    // Merge pull request
    await db
      .update(pullRequestsTable)
      .set({ status: "merged" })
      .where(eq(pullRequestsTable.featureId, featureId));

    const [updatedFeature] = await db
      .update(featuresTable)
      .set({
        status: "shipped",
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!updatedFeature) throw new Error("Failed to ship feature");

    return { feature: updatedFeature, releaseNotes };
  }
}

export const velocityService = new VelocityService();
