import { auth } from "@repo/database/auth";
import { db } from "@repo/database";
import { account } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";
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

    if (!repo || !repo.includes("/")) {
      return NextResponse.json({ error: "Valid repository name (owner/repo) is required" }, { status: 400 });
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

    // Fetch pull requests from GitHub
    const res = await fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=50`, {
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

    const pulls = await res.json();
    
    return NextResponse.json(
      pulls.map((p: any) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        state: p.state,
        branch: p.head.ref,
        sha: p.head.sha,
        user: p.user.login,
        url: p.html_url,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
