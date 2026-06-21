import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  githubRepo: varchar("github_repo", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const featuresTable = pgTable("features", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projectsTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("intake").notNull(), // 'intake', 'prd_generation', 'tasks_breakdown', 'pr_review', 'shipped', 'educated'
  intakeChannel: varchar("intake_channel", { length: 50 }).default("direct").notNull(), // 'email', 'support', 'call', 'direct'
  isEducated: boolean("is_educated").default(false).notNull(),
  educationContent: text("education_content"),
  missingContext: jsonb("missing_context").default([]).notNull(), // Array of { question: string, answer?: string }
  prdContent: text("prd_content"),
  branchName: varchar("branch_name", { length: 255 }),
  prNumber: integer("pr_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureId: uuid("feature_id")
    .references(() => featuresTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("todo").notNull(), // 'todo', 'in_progress', 'done'
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const pullRequestsTable = pgTable("pull_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureId: uuid("feature_id")
    .references(() => featuresTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  branchName: varchar("branch_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(), // 'open', 'merged'
  diffData: jsonb("diff_data").notNull(), // Array of { filepath: string, content: string, status: 'added'|'modified', diff: string, originalContent?: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const aiReviewsTable = pgTable("ai_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  pullRequestId: uuid("pull_request_id")
    .references(() => pullRequestsTable.id, { onDelete: "cascade" })
    .notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'changes_requested', 'passed'
  summary: text("summary"),
  comments: jsonb("comments").default([]).notNull(), // Array of { filepath: string, line: number, text: string, type: 'error' | 'warning' | 'info', requirementId?: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;

export type SelectFeature = typeof featuresTable.$inferSelect;
export type InsertFeature = typeof featuresTable.$inferInsert;

export type SelectTask = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;

export type SelectPullRequest = typeof pullRequestsTable.$inferSelect;
export type InsertPullRequest = typeof pullRequestsTable.$inferInsert;

export type SelectAiReview = typeof aiReviewsTable.$inferSelect;
export type InsertAiReview = typeof aiReviewsTable.$inferInsert;
