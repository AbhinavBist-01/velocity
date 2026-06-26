import { auth } from "@repo/database/auth";
import { db } from "@repo/database";
import { account } from "@repo/database/schema";
import { eq, and } from "@repo/database";
import { velocityService } from "@repo/services/velocity";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoFullName, prNumber } = await request.json();

    if (!repoFullName || !prNumber) {
      return NextResponse.json({ error: "repoFullName and prNumber are required" }, { status: 400 });
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

    // Trigger PR review
    const reviewResult = await velocityService.runGithubPrReview(
      repoFullName,
      Number(prNumber),
      githubAccount.accessToken
    );

    return NextResponse.json(reviewResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
