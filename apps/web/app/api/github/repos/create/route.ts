import { auth } from "@repo/database/auth";
import { db, eq, and } from "@repo/database";
import { account } from "@repo/database/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPrivate } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Repository name is required" }, { status: 400 });
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

    // Create repo on GitHub
    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubAccount.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Velocity-App",
      },
      body: JSON.stringify({
        name,
        description: description || "Created via Velocity",
        private: isPrivate ?? true,
        auto_init: true, // create a README to initialize the repository
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${errText}` }, { status: res.status });
    }

    const repo = await res.json();
    
    return NextResponse.json({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      private: repo.private,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
