import { auth } from "@repo/database/auth";
import { db } from "@repo/database";
import { account } from "@repo/database/schema";
import { eq, and } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repo = searchParams.get("repo");
    const number = searchParams.get("number");

    if (!repo || !number) {
      return NextResponse.json({ error: "repo and number parameters are required" }, { status: 400 });
    }

    // Find github account for the logged-in user
    const githubAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "github")
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!githubAccount || !githubAccount.accessToken) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 400 });
    }

    // Fetch pull request files from GitHub
    const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${number}/files`, {
      headers: {
        Authorization: `Bearer ${githubAccount.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Velocity-App",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${errText}` }, { status: res.status });
    }

    const files = await res.json();
    
    return NextResponse.json(
      files.map((f: any) => ({
        filepath: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
