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
  console.log("🌱 Cleaning database (removing hardcoded projects)...");

  try {
    console.log("Deleting existing projects...");
    await db.delete(projectsTable);
    console.log("🌱 Database cleaned and hardcoded projects removed successfully!");
  } catch (err) {
    console.error("Error cleaning database:", err);
  } finally {
    await pool.end();
  }
}

seed();
