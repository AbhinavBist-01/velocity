import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { projectsTable, featuresTable } from "./schema";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
});
const db = drizzle(pool);

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Clean up existing data to prevent duplicate primary key conflicts
    console.log("Deleting existing projects...");
    await db.delete(projectsTable);

    // 2. Seed projects
    console.log("Inserting projects...");
    
    const [project1] = await db
      .insert(projectsTable)
      .values({
        name: "Velocity E-Commerce Engine",
        description: "High-performance headless shopping backend configured with dynamic inventory tracking, microservices billing router, and regional distribution sync.",
        githubRepo: "github.com/v-corp/velocity-engine",
      })
      .returning();

    const [project2] = await db
      .insert(projectsTable)
      .values({
        name: "Velocity AI Core",
        description: "Full-stack SaaS delivery platform that orchestrates product discoverability, automated code compliance checkups, and PM approvals.",
        githubRepo: "github.com/velocity-org/core",
      })
      .returning();

    console.log("Created projects:", project1.name, ",", project2.name);

    // 3. Seed features
    console.log("Inserting features...");
    
    // Feature 1
    await db.insert(featuresTable).values({
      projectId: project1.id,
      title: "Add Dark Theme Toggle",
      description: "We should allow our shoppers to view the store in dark mode. This will improve customer retention rates during night hours.",
      intakeChannel: "support",
      status: "intake",
      isEducated: false,
      missingContext: [
        { question: "What is the primary target user group for this feature?", answer: "" },
        { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
        { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
      ],
    });

    // Feature 2
    await db.insert(featuresTable).values({
      projectId: project2.id,
      title: "Integrate Stripe Checkout",
      description: "Need subscription billing flow so our users can pay for tier upgrades using credit cards.",
      intakeChannel: "email",
      status: "intake",
      isEducated: false,
      missingContext: [
        { question: "What is the primary target user group for this feature?", answer: "" },
        { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
        { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
      ],
    });

    // Feature 3
    await db.insert(featuresTable).values({
      projectId: project1.id,
      title: "Slack Notification Alerts",
      description: "We want real-time notifications to be sent to our slack channel whenever a transaction value exceeds $1,000.",
      intakeChannel: "direct",
      status: "intake",
      isEducated: false,
      missingContext: [
        { question: "What is the primary target user group for this feature?", answer: "" },
        { question: "What are the key functional requirements or constraints we should enforce?", answer: "" },
        { question: "Are there any specific third-party integrations (APIs, webhooks, databases) required?", answer: "" }
      ],
    });

    console.log("🌱 Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await pool.end();
  }
}

seed();
