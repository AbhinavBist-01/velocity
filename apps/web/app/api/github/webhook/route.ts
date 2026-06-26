import { NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(payload: string, signature: string | null, secret: string) {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from("sha256=" + hmac.update(payload).digest("hex"), "utf8");
  const checksum = Buffer.from(signature, "utf8");

  return checksum.length === digest.length && crypto.timingSafeEqual(digest, checksum);
}

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const githubEvent = req.headers.get("x-github-event");
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";

    const isValid = verifySignature(payload, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (githubEvent === "pull_request") {
      const event = JSON.parse(payload);
      const { action, pull_request, repository } = event;

      // Listen for new code updates on PR
      if (["opened", "synchronize", "reopened"].includes(action)) {
        console.log(`GitHub Webhook: PR #${pull_request.number} received for ${repository.full_name}`);
        
        // Dynamic importing of velocity service to trigger RAG/AI review pipeline in background
        const { velocityService } = await import("@repo/services/velocity");
        
        // Trigger review asynchronously
        // We look up or create the local PR record, then execute the AI review logic
        // This runs in the background
        velocityService.triggerWebhookAiReview({
          repoFullName: repository.full_name,
          prNumber: pull_request.number,
          title: pull_request.title,
          branchName: pull_request.head.ref,
          installationId: event.installation?.id,
        }).catch((err: any) => {
          console.error("Error in background AI PR review execution:", err);
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("GitHub Webhook failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
