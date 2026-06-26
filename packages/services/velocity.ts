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
import { account } from "@repo/database/schema";
import { generateGeminiContent } from "./clients/gemini";
import { createGithubBranchAndPR } from "./clients/github-git";
import { chunkPrFiles } from "./ai/chunk-code";
import { saveChunksToPinecone, searchPrContext, buildPrNamespace } from "./ai/vector";

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
    let status = "intake";
    let isEducated = false;
    let educationContent: string | null = null;
    let missingContext: any[] = [];

    const prompt = `You are an expert product manager AI agent for a SaaS platform.
Analyze this feature request:
Title: "${title}"
Description: "${description}"

Determine:
1. Is this feature already an existing standard capability or offering in SaaS applications or standard developer workflows (for example, standard user authentication, standard dark theme, simple notification systems, etc.), such that we should educate the user about it instead of rebuilding it?
If yes, provide a polite, professional, and clear educational response explaining how they can use or configure this existing capability.

2. If it does not exist or we should build it, identify 3 to 5 highly relevant, specific follow-up questions to gather necessary context (e.g. target users, styling preferences, external systems, functional constraints, etc.) to compile a precise specification.

Respond ONLY with a JSON object in this exact format:
{
  "isExisting": true/false,
  "educationContent": "Your educational suggested response if isExisting is true, else null",
  "questions": [
    "Question 1",
    "Question 2",
    ...
  ]
}`;

    try {
      const resultText = await generateGeminiContent(prompt, true);
      const parsed = JSON.parse(resultText);
      if (parsed.isExisting) {
        isEducated = true;
        educationContent = parsed.educationContent;
        status = "educated";
      } else {
        missingContext = (parsed.questions || []).map((q: string) => ({
          question: q,
          answer: "",
        }));
      }
    } catch (err) {
      console.error("Gemini context gathering failed, falling back to defaults", err);
      // Fallback missing context questions
      missingContext = [
        { question: "What is the primary target user group for this feature?", answer: "" },
        { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
        { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
      ];
    }

    const [feature] = await db
      .insert(featuresTable)
      .values({
        projectId,
        title,
        description,
        intakeChannel,
        isEducated,
        educationContent,
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
    const [existingFeature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!existingFeature) throw new Error("Feature not found");

    let missingContext: any[] = [];
    const prompt = `You are an expert product manager AI agent for a SaaS platform.
Analyze this feature request that we have decided to build custom:
Title: "${existingFeature.title}"
Description: "${existingFeature.description}"

Identify 3 to 5 highly relevant, specific follow-up questions to gather necessary context (e.g. target users, styling preferences, external systems, functional constraints, etc.) to compile a precise specification.

Respond ONLY with a JSON object in this exact format:
{
  "questions": [
    "Question 1",
    "Question 2",
    ...
  ]
}`;

    try {
      const resultText = await generateGeminiContent(prompt, true);
      const parsed = JSON.parse(resultText);
      missingContext = (parsed.questions || []).map((q: string) => ({
        question: q,
        answer: "",
      }));
    } catch (err) {
      console.error("Gemini force proceed questions failed, falling back to defaults", err);
      missingContext = [
        { question: "What is the primary target user group for this feature?", answer: "" },
        { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
        { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
      ];
    }

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

    const clarificationText = missingContext.map((item, idx) => `Question ${idx + 1}: ${item.question}\nAnswer: ${item.answer}`).join("\n\n");

    const prompt = `You are an expert product manager AI agent.
Generate a highly detailed, professional, and structured Product Requirements Document (PRD) in Markdown format based on this feature request and subsequent clarifications.

Feature Title: "${feature.title}"
Original Request: "${feature.description}"

User Clarifications:
${clarificationText}

The PRD MUST contain the following sections in Markdown:
# Product Requirements Document (PRD): ${feature.title}

## 1. Problem Statement
Describe the problem and business context.

## 2. Goals
Identify what the implementation aims to achieve.

## 3. Non-Goals
Identify what is out of scope.

## 4. User Stories
Identify user stories. Format each as: * **US-X**: As a [role], I want to [action] so that [benefit].

## 5. Functional Requirements
Identify the requirements. Include input validations, security constraints, and behavior rules. Format each as: * **FR-X**: [requirement details]. Include specific constraints based on clarifications.

## 6. Edge Cases
Detail potential failure modes, rate limits, empty states, and errors.

## 7. Success Metrics
Detail adoption rates, latency expectations, or usage metrics.

Return ONLY the raw Markdown document. Do not wrap in markdown code blocks.`;

    let prdContent = "";
    try {
      let resultText = await generateGeminiContent(prompt, false);
      if (resultText.startsWith("```markdown")) {
        resultText = resultText.substring(11);
      } else if (resultText.startsWith("```")) {
        resultText = resultText.substring(3);
      }
      if (resultText.endsWith("```")) {
        resultText = resultText.substring(0, resultText.length - 3);
      }
      prdContent = resultText.trim();
    } catch (err) {
      console.error("Gemini PRD generation failed, falling back to template", err);
      const userGroup = answers[0] || "General users";
      const constraints = answers[1] || "None specified";
      const integrations = answers[2] || "None required";
      prdContent = `# Product Requirements Document (PRD): ${feature.title}

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
* Average latency under 200ms for all read operations.`;
    }

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

    const prompt = `You are a Lead Software Architect.
Analyze the following Product Requirements Document (PRD) and break it down into 3 to 6 actionable development tasks.

PRD:
${finalPrd}

Each task should have:
1. A clear, concise title.
2. A detailed description explaining what a developer needs to build/configure (e.g. database schema changes, backend routes, UI components, tests, validation).
3. A priority: "low", "medium", or "high".

Respond ONLY with a JSON array in this exact format:
[
  {
    "title": "Task 1 Title",
    "description": "Task 1 description",
    "priority": "high"
  },
  ...
]`;

    let tasks: any[] = [];
    try {
      const resultText = await generateGeminiContent(prompt, true);
      const parsed = JSON.parse(resultText);
      if (Array.isArray(parsed)) {
        tasks = parsed;
      } else {
        throw new Error("Parsed result is not an array");
      }
    } catch (err) {
      console.error("Gemini task breakdown failed, falling back to defaults", err);
      tasks = [
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
    }

    // Insert tasks
    for (const t of tasks) {
      await db.insert(tasksTable).values({
        featureId,
        title: t.title || "Developer Task",
        description: t.description || "Implement requirements specified in the PRD.",
        priority: t.priority || "medium",
        status: "todo",
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

  public async createTask(
    featureId: string,
    title: string,
    description: string,
    priority: string
  ): Promise<SelectTask> {
    const [task] = await db
      .insert(tasksTable)
      .values({
        featureId,
        title,
        description,
        priority,
        status: "todo",
      })
      .returning();
    if (!task) throw new Error("Failed to create task");
    return task;
  }

  public async updateTask(
    taskId: string,
    title: string,
    description: string,
    priority: string
  ): Promise<SelectTask> {
    const [task] = await db
      .update(tasksTable)
      .set({
        title,
        description,
        priority,
      })
      .where(eq(tasksTable.id, taskId))
      .returning();
    if (!task) throw new Error("Failed to update task");
    return task;
  }

  public async deleteTask(taskId: string): Promise<{ success: boolean }> {
    const [task] = await db
      .delete(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .returning();
    if (!task) throw new Error("Failed to delete task");
    return { success: true };
  }

  public async approveTasksPlan(featureId: string): Promise<SelectFeature> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const [updatedFeature] = await db
      .update(featuresTable)
      .set({
        status: "plan_approved",
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!updatedFeature) throw new Error("Failed to update feature");
    return updatedFeature;
  }

  // 4. Git Branch & Pull Request
  public async initializeBranch(featureId: string, userId?: string): Promise<SelectPullRequest> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, feature.projectId)).limit(1);
    if (!project) throw new Error("Project not found");

    const branchName = `feature/${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    let prNumber = Math.floor(Math.random() * 1000) + 100;

    const prompt = `You are a Lead Software Architect.
Analyze the following Product Requirements Document (PRD) for a feature:

PRD:
${feature.prdContent}

Generate a mock git pull request (diff) implementing this feature.
Specifically:
1. Generate 2 to 3 files that would be added or modified (e.g., database schema, API route, service file, frontend component, etc.).
2. For each file, provide its filepath, status ("added" or "modified"), full file contents, and a simulated git diff.
3. IMPORTANT: Purposefully introduce 1 or 2 subtle bugs, security vulnerabilities, or logic flaws that violate the PRD requirements (such as missing authorization checks on sensitive endpoints, missing rate limits, or missing input validations). These will be caught during the AI Code Review phase.

Respond ONLY with a JSON array in this exact format:
[
  {
    "filepath": "apps/api/src/routes/something.ts",
    "status": "added",
    "content": "full file content here",
    "diff": "simulated git diff here starting with +++ or standard diff lines"
  },
  ...
]`;

    let diffData: any[] = [];
    try {
      const resultText = await generateGeminiContent(prompt, true);
      const parsed = JSON.parse(resultText);
      if (Array.isArray(parsed)) {
        diffData = parsed;
      } else {
        throw new Error("Result is not an array");
      }
    } catch (err) {
      console.error("Gemini diff generation failed, falling back to defaults", err);
      diffData = [
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
    }

    // 2. Query GitHub account for accessToken if userId is provided
    let githubAccount: any = null;
    if (userId) {
      githubAccount = await db
        .select()
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
        .limit(1)
        .then(rows => rows[0]);
    }

    // --- DIAGNOSTIC LOGGING ---
    console.log("[initializeBranch] userId:", userId);
    console.log("[initializeBranch] githubAccount found:", !!githubAccount);
    console.log("[initializeBranch] githubAccount.accessToken exists:", !!(githubAccount?.accessToken));
    console.log("[initializeBranch] githubAccount.accessToken length:", githubAccount?.accessToken?.length ?? 0);
    console.log("[initializeBranch] project.githubRepo:", project.githubRepo);
    console.log("[initializeBranch] project.githubRepo includes '/':", project.githubRepo?.includes("/"));
    console.log("[initializeBranch] branchName:", branchName);
    console.log("[initializeBranch] diffData files count:", diffData.length);
    // --- END DIAGNOSTIC LOGGING ---

    // 3. Create real branch & PR on GitHub if token and repo exist
    const canCreateGithubPR = !!(githubAccount && githubAccount.accessToken && project.githubRepo && project.githubRepo.includes("/"));
    console.log("[initializeBranch] canCreateGithubPR:", canCreateGithubPR);

    if (canCreateGithubPR) {
      try {
        const commitFiles = diffData.map((f: any) => ({
          filepath: f.filepath,
          content: f.content,
        }));
        
        console.log("[initializeBranch] Calling createGithubBranchAndPR with repo:", project.githubRepo, "branch:", branchName, "files:", commitFiles.length);
        
        const prInfo = await createGithubBranchAndPR({
          repoFullName: project.githubRepo,
          branchName,
          token: githubAccount.accessToken,
          files: commitFiles,
          prTitle: `Implement ${feature.title}`,
          prBody: `AI-generated Pull Request matching PRD specifications.\n\n### Requirement Specs:\n${feature.description}`,
        });

        console.log("[initializeBranch] createGithubBranchAndPR returned:", JSON.stringify(prInfo ? { number: prInfo.number, html_url: prInfo.html_url } : null));

        if (prInfo && prInfo.number) {
          prNumber = prInfo.number;
        }
      } catch (githubErr: any) {
        console.error("[initializeBranch] FAILED to create branch/PR on GitHub:", githubErr?.message || githubErr);
        console.error("[initializeBranch] Full error:", githubErr);
        // Don't silently swallow - log clearly that we're falling back
        console.warn("[initializeBranch] Falling back to local-only PR record (no real GitHub branch created).");
      }
    } else {
      console.warn("[initializeBranch] SKIPPING GitHub branch creation because conditions not met. Checklist:");
      console.warn("  - githubAccount exists:", !!githubAccount);
      console.warn("  - accessToken exists:", !!(githubAccount?.accessToken));
      console.warn("  - githubRepo exists:", !!project.githubRepo);
      console.warn("  - githubRepo has '/':", project.githubRepo?.includes("/"));
    }

    // Set branch in feature
    await db
      .update(featuresTable)
      .set({
        branchName,
        prNumber,
        status: "pr_review",
      })
      .where(eq(featuresTable.id, featureId));

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

    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, feature.projectId)).limit(1);
    if (!project) throw new Error("Project not found");

    // 1. Perform RAG pipeline: Chunking and Pinecone indexing
    const files = (pullRequest.diffData as any[]).map(file => ({
      filepath: file.filepath,
      diff: file.diff || "",
      content: file.content || ""
    }));

    const prNum = feature.prNumber || 1;
    const chunks = chunkPrFiles(prNum, files);
    const namespace = buildPrNamespace(project.githubRepo, prNum);

    let contextSnippets: string[] = [];
    if (chunks.length > 0) {
      try {
        await saveChunksToPinecone(namespace, chunks);
        // Retrieval: Query the Pinecone namespace for relevant snippets using PR/Feature context
        contextSnippets = await searchPrContext(namespace, feature.title);
      } catch (err) {
        console.error("Vector DB RAG indexing/search failed, falling back to direct diffs", err);
      }
    }

    const tasks = await db.select().from(tasksTable).where(eq(tasksTable.featureId, featureId));
    const tasksText = tasks.map(t => `- [Status: ${t.status}] ${t.title}: ${t.description} (Priority: ${t.priority})`).join("\n");

    const retrievedContext = contextSnippets.length > 0
      ? contextSnippets.join("\n\n---\n\n")
      : files.map(file => `File: ${file.filepath}\nContent:\n${file.content}`).join("\n\n");

    const prompt = `You are a Senior QA Agent and AI Code Reviewer.
Analyze the following Product Requirements Document (PRD), Engineering Tasks, and the pull request code changes (retrieved via RAG):

PRD / Acceptance Criteria:
${feature.prdContent}

Engineering Tasks Checklist:
${tasksText}

Pull Request Code Changes / Context:
${retrievedContext}

You MUST evaluate the code changes strictly against these 7 dimensions:
1. PRD requirements (Checking if all functional specifications are implemented)
2. Acceptance criteria (Checking alignment with desired user outcomes)
3. Engineering tasks (Verifying all defined check items are addressed)
4. Security concerns (Looking for vulnerabilities like unauthenticated endpoints, sql injection, lack of validation)
5. Performance considerations (Checking for rate limits, efficient database updates, clean async calls)
6. Edge cases (Handling empty payloads, error conditions, invalid states)
7. Code quality (Following clean code practices, typing rules, naming conventions)

Identify any issues or violations. Each issue comment MUST categorize its severity exactly as either:
- "blocking" (issues that violate the specs, leak security, or cause crashes)
- "non_blocking" (minor code styling, optimization suggestions, or warnings)

Respond ONLY with a JSON object in this exact format:
{
  "status": "changes_requested" | "passed",
  "summary": "Detailed summary of QA review findings.",
  "comments": [
    {
      "filepath": "filepath of the file",
      "line": 10,
      "type": "blocking" | "non_blocking",
      "text": "Detailed description of the issue, referencing the specific criteria evaluated (e.g. Security, Edge cases)."
    }
  ]
}`;

    let status = "changes_requested";
    let summary = "";
    let comments: any[] = [];

    try {
      const resultText = await generateGeminiContent(prompt, true);
      const parsed = JSON.parse(resultText);
      status = parsed.status || "changes_requested";
      summary = parsed.summary || "AI QA review completed.";
      comments = parsed.comments || [];
    } catch (err) {
      console.error("Gemini AI Review failed, falling back to defaults", err);
      status = "changes_requested";
      summary = "AI QA Review: Found 1 blocking security vulnerability and 1 non-blocking performance concern. Please secure middleware and apply rate limits.";
      comments = [
        {
          filepath: "apps/api/src/routes/feature.ts",
          line: 9,
          type: "blocking",
          text: "❌ Security & Validation issue (FR-4): This endpoint lacks auth credentials checks. Any unauthenticated caller can query it. You must add authorization verification middleware.",
        },
        {
          filepath: "apps/api/src/routes/feature.ts",
          line: 10,
          type: "non_blocking",
          text: "⚠️ Missing constraints (FR-2 & Edge Cases): This route is not rate-limited. Under heavy concurrent spikes, it could lead to service overload. Implement rate limiter middleware.",
        }
      ];
    }

    // Check if we already have a review
    const [existingReview] = await db.select().from(aiReviewsTable).where(eq(aiReviewsTable.pullRequestId, pullRequest.id)).limit(1);

    let review: SelectAiReview;

    if (existingReview) {
      const [updatedReview] = await db
        .update(aiReviewsTable)
        .set({
          status,
          summary,
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
          status,
          summary,
          comments,
        })
        .returning();
      if (!newReview) throw new Error("Failed to create AI review");
      review = newReview;
    }

    // Update feature status dynamically based on review outcome
    const nextFeatureStatus = status === "passed" ? "pr_approved" : "fix_needed";
    await db
      .update(featuresTable)
      .set({ status: nextFeatureStatus })
      .where(eq(featuresTable.id, featureId));

    return review;
  }

  // Webhook-triggered PR Review Pipeline
  public async triggerWebhookAiReview(input: {
    repoFullName: string;
    prNumber: number;
    title: string;
    branchName: string;
    installationId?: number;
  }): Promise<void> {
    console.log("Triggering Webhook AI Review for repository:", input.repoFullName, "PR:", input.prNumber);

    // Look up feature matching the branch name or get latest fallback
    let [feature] = await db.select().from(featuresTable).where(eq(featuresTable.branchName, input.branchName)).limit(1);
    if (!feature) {
      const latestFeatures = await db.select().from(featuresTable).orderBy(desc(featuresTable.createdAt)).limit(1);
      feature = latestFeatures[0];
    }
    if (!feature) {
      console.warn("No active feature found to associate webhook code review with.");
      return;
    }

    // Run review flow
    await this.runAiReview(feature.id);
  }

  public async submitFixes(featureId: string): Promise<{ pullRequest: SelectPullRequest; aiReview: SelectAiReview }> {
    const [pullRequest] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.featureId, featureId)).limit(1);
    if (!pullRequest) throw new Error("Pull request not found");

    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const [review] = await db.select().from(aiReviewsTable).where(eq(aiReviewsTable.pullRequestId, pullRequest.id)).limit(1);
    const comments = review?.comments || [];

    const diffsText = (pullRequest.diffData as any[]).map(file => `File: ${file.filepath}\nContent:\n${file.content}`).join("\n\n");
    const commentsText = (comments as any[]).map(c => `File: ${c.filepath}\nLine: ${c.line}\nIssue: ${c.text}`).join("\n\n");

    const prompt = `You are an expert software developer.
Fix the bugs and vulnerabilities identified in the AI Code Review comments for this pull request.

Original Diffs / Files:
${diffsText}

AI Code Review Comments:
${commentsText}

Rewrite the files to resolve all the comments completely. Make sure they now satisfy the security and functional constraints.

Respond ONLY with a JSON array containing the updated files in this exact format:
[
  {
    "filepath": "filepath of the file",
    "status": "modified",
    "content": "Full corrected file content",
    "diff": "simulated git diff of the corrections"
  },
  ...
]`;

    let updatedDiffData: any[] = [];
    try {
      const resultText = await generateGeminiContent(prompt, true);
      const parsed = JSON.parse(resultText);
      if (Array.isArray(parsed)) {
        updatedDiffData = parsed;
      } else {
        throw new Error("Result is not an array");
      }
    } catch (err) {
      console.error("Gemini fixes failed, falling back to defaults", err);
      updatedDiffData = [
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
    }

    const [updatedPR] = await db
      .update(pullRequestsTable)
      .set({
        diffData: updatedDiffData,
      })
      .where(eq(pullRequestsTable.id, pullRequest.id))
      .returning();
    if (!updatedPR) throw new Error("Failed to update pull request");

    // Reset feature status to pr_review to allow re-reviewing
    await db
      .update(featuresTable)
      .set({ status: "pr_review" })
      .where(eq(featuresTable.id, featureId));

    // Delete the previous review so the QA Agent can review the new code clean
    await db.delete(aiReviewsTable).where(eq(aiReviewsTable.pullRequestId, pullRequest.id));

    // Return dummy review object or query to satisfy the returning type signature
    const dummyReview: SelectAiReview = {
      id: "00000000-0000-0000-0000-000000000000",
      pullRequestId: pullRequest.id,
      status: "pending",
      summary: "Fixes submitted. Run Code Review to audit the updated codebase.",
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { pullRequest: updatedPR, aiReview: dummyReview };
  }

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

  public async rejectRelease(featureId: string): Promise<SelectFeature> {
    const [feature] = await db
      .update(featuresTable)
      .set({
        status: "fix_needed",
      })
      .where(eq(featuresTable.id, featureId))
      .returning();
    if (!feature) throw new Error("Failed to reject release");
    return feature;
  }

  public async shipFeature(featureId: string): Promise<{ feature: SelectFeature; releaseNotes: string }> {
    const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
    if (!feature) throw new Error("Feature not found");

    const prompt = `You are a Product Marketing Manager.
Create professional, friendly, and structured Release Notes (Changelog) in Markdown format for this newly shipped feature.

Feature Title: "${feature.title}"
PRD Summary:
${feature.prdContent}

Include:
1. A summary of the feature and why it's exciting.
2. A list of key additions and updates.
3. Security or performance improvements included.

Respond ONLY with the Markdown content. Do not wrap in markdown code blocks.`;

    let releaseNotes = "";
    try {
      let resultText = await generateGeminiContent(prompt, false);
      if (resultText.startsWith("```markdown")) {
        resultText = resultText.substring(11);
      } else if (resultText.startsWith("```")) {
        resultText = resultText.substring(3);
      }
      if (resultText.endsWith("```")) {
        resultText = resultText.substring(0, resultText.length - 3);
      }
      releaseNotes = resultText.trim();
    } catch (err) {
      console.error("Gemini release notes failed, falling back to template", err);
      releaseNotes = `## Release Notes: ${feature.title}

We are excited to announce the release of **${feature.title}**!

### What's New
* **Comprehensive Implementation**: Delivered core capabilities matching the user requirements.
* **Full Context Security**: Verified by AI Code Reviewer to ensure security validations are fully enforced.
`;
    }

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

  public async runGithubPrReview(repoFullName: string, prNumber: number, token: string) {
    // 1. Fetch PR details to get title/description for retrieval context
    const prRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Velocity-App",
      },
    });
    if (!prRes.ok) throw new Error(`Failed to fetch PR details from GitHub: ${await prRes.text()}`);
    const prDetails = await prRes.json();

    // 2. Fetch unified diff
    const diffRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.diff",
        "User-Agent": "Velocity-App",
      },
    });
    if (!diffRes.ok) throw new Error(`Failed to fetch PR diff: ${await diffRes.text()}`);
    const diffText = await diffRes.text();

    // Parse diff into file structures for chunking
    const fileDiffs = diffText.split("diff --git ").filter(Boolean);
    const files = fileDiffs.map(fd => {
      const lines = fd.split("\n");
      const firstLine = lines[0] || "";
      const match = firstLine.match(/b\/(.+)$/);
      let filepath = "unknown_file";
      if (match && match[1]) {
        filepath = match[1].split(" ")[0] || "unknown_file";
      }
      return {
        filepath,
        diff: "diff --git " + fd,
        content: "diff --git " + fd,
      };
    });

    // 3. Perform RAG
    const chunks = chunkPrFiles(prNumber, files);
    const namespace = buildPrNamespace(repoFullName, prNumber);

    let contextSnippets: string[] = [];
    if (chunks.length > 0) {
      try {
        await saveChunksToPinecone(namespace, chunks);
        contextSnippets = await searchPrContext(namespace, prDetails.title + " " + (prDetails.body || ""));
      } catch (err) {
        console.error("Vector DB RAG indexing/search failed, falling back to direct diffs", err);
      }
    }

    const retrievedContext = contextSnippets.length > 0
      ? contextSnippets.join("\n\n---\n\n")
      : files.map(file => `File: ${file.filepath}\nContent:\n${file.content}`).join("\n\n");

    const prompt = `You are a Senior Security Auditor and AI Code Reviewer.
Analyze the following pull request code changes (retrieved via RAG):

Pull Request Title: ${prDetails.title}
Pull Request Description: ${prDetails.body || "No description provided."}

Pull Request Code Changes / Context:
${retrievedContext}

Identify any security issues, missing constraints, or functional violations.
Highlight the exact line number where the issue occurs in each file.

Respond ONLY with a JSON object in this exact format:
{
  "status": "changes_requested" | "passed",
  "summary": "Detailed summary of review findings.",
  "comments": [
    {
      "filepath": "filepath of the file",
      "line": 10,
      "type": "error" | "warning",
      "text": "Detailed description of the issue."
    }
  ]
}`;

    const resultText = await generateGeminiContent(prompt, true);
    const parsed = JSON.parse(resultText);

    const status = parsed.status || "changes_requested";
    const summary = parsed.summary || "AI review completed.";
    const comments = parsed.comments || [];

    // 4. Submit review to GitHub
    const githubComments = comments.map((c: any) => ({
      path: c.filepath,
      line: Number(c.line) || 1,
      body: c.text,
    }));

    const reviewRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Velocity-App",
      },
      body: JSON.stringify({
        body: summary,
        event: status === "passed" ? "APPROVE" : "REQUEST_CHANGES",
        comments: githubComments.length > 0 ? githubComments : undefined,
      }),
    });

    if (!reviewRes.ok) {
      const errTxt = await reviewRes.text();
      console.warn("Failed to submit line-level review, falling back to summary comment:", errTxt);
      
      // Fallback: Post simple comment if line-level fails (due to diff range mismatch)
      await fetch(`https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Velocity-App",
        },
        body: JSON.stringify({
          body: `### AI Review Audit Summary\n\n**Status:** ${status.toUpperCase()}\n\n${summary}\n\n**Detailed Findings:**\n${comments.map((c: any) => `- **${c.filepath}:${c.line}**: ${c.text}`).join("\n")}`,
        }),
      });
    }

    return { status, summary, comments };
  }
}

export const velocityService = new VelocityService();
