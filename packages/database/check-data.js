const pg = require("pg");
require("dotenv").config({ path: "../../.env" });

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const projects = await client.query("SELECT * FROM projects");
    console.log("PROJECTS:", JSON.stringify(projects.rows, null, 2));
    const features = await client.query("SELECT * FROM features");
    console.log("FEATURES:", JSON.stringify(features.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
