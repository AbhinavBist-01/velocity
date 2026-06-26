import { auth } from "@repo/database/auth";
import { db, eq, and } from "@repo/database";
import { account } from "@repo/database/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Fetch repos from GitHub API
    const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${githubAccount.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Velocity-App",
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${errText}` }, { status: res.status });
    }

    const repos = await res.json();
    
    // Return list of repos
    return NextResponse.json(
      repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        url: r.html_url,
        private: r.private,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
