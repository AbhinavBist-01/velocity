export type CommitFile = {
  filepath: string;
  content: string;
};

export async function createGithubBranchAndPR(input: {
  repoFullName: string;
  branchName: string;
  token: string;
  files: CommitFile[];
  prTitle: string;
  prBody: string;
}) {
  const { repoFullName, branchName, token, files, prTitle, prBody } = input;

  console.log(`[github-git] Starting GitHub branch & PR creation on ${repoFullName} for branch ${branchName}...`);
  console.log(`[github-git] Token length: ${token?.length ?? 0}, Token prefix: ${token?.substring(0, 8)}...`);

  // 1. Get default branch name (usually main or master)
  const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Velocity-App",
    },
  });
  console.log(`[github-git] Step 1 - GET repo info: ${repoRes.status} ${repoRes.statusText}`);
  if (!repoRes.ok) {
    const errBody = await repoRes.text();
    console.error(`[github-git] Step 1 FAILED:`, errBody);
    throw new Error(`Failed to fetch repo info from GitHub (${repoRes.status}): ${errBody}`);
  }
  const repoInfo = await repoRes.json();
  const defaultBranch = repoInfo.default_branch || "main";

  // 2. Get the latest commit SHA of the default branch
  const refRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/ref/heads/${defaultBranch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Velocity-App",
    },
  });
  console.log(`[github-git] Step 2 - GET ref/heads/${defaultBranch}: ${refRes.status} ${refRes.statusText}`);
  if (!refRes.ok) {
    const errBody = await refRes.text();
    console.error(`[github-git] Step 2 FAILED:`, errBody);
    throw new Error(`Failed to fetch default branch SHA (${refRes.status}): ${errBody}`);
  }
  const refInfo = await refRes.json();
  const parentSha = refInfo.object.sha;

  // 3. Create the new branch reference
  const createRefRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Velocity-App",
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: parentSha,
    }),
  });

  console.log(`[github-git] Step 3 - POST create ref: ${createRefRes.status} ${createRefRes.statusText}`);
  if (!createRefRes.ok) {
    const errText = await createRefRes.text();
    console.warn(`[github-git] Step 3 non-OK response:`, errText);
    // If the branch already exists, we will reuse it. Otherwise, throw.
    if (!errText.includes("Reference already exists")) {
      throw new Error(`Failed to create branch reference (${createRefRes.status}): ${errText}`);
    }
    console.log(`[github-git] Branch ${branchName} already exists, committing to it.`);
  } else {
    console.log(`[github-git] Created branch ${branchName} successfully.`);
  }

  // 4. Commit files one-by-one to the branch
  for (const file of files) {
    const path = file.filepath;
    // We check if the file already exists on that branch to get its sha (required for update)
    let sha: string | undefined;
    const fileRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}?ref=${branchName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Velocity-App",
      },
    });
    if (fileRes.ok) {
      const fileInfo = await fileRes.json();
      sha = fileInfo.sha;
    }

    const commitRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Velocity-App",
      },
      body: JSON.stringify({
        message: `feat: add/update ${path}`,
        content: Buffer.from(file.content).toString("base64"),
        branch: branchName,
        sha,
      }),
    });

    console.log(`[github-git] Step 4 - PUT contents/${path}: ${commitRes.status} ${commitRes.statusText}`);
    if (!commitRes.ok) {
      const errBody = await commitRes.text();
      console.error(`[github-git] Step 4 FAILED for ${path}:`, errBody);
      throw new Error(`Failed to commit file ${path} (${commitRes.status}): ${errBody}`);
    }
    console.log(`[github-git] Committed ${path} to branch ${branchName}`);
  }

  // 5. Create Pull Request
  const prRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Velocity-App",
    },
    body: JSON.stringify({
      title: prTitle,
      body: prBody,
      head: branchName,
      base: defaultBranch,
    }),
  });

  console.log(`[github-git] Step 5 - POST create PR: ${prRes.status} ${prRes.statusText}`);
  if (!prRes.ok) {
    const errText = await prRes.text();
    console.warn(`[github-git] Step 5 non-OK response:`, errText);
    // If the PR already exists, try to get it. Otherwise, throw.
    if (errText.includes("A pull request already exists")) {
      console.log(`Pull request already exists, searching for active PR...`);
      const listPrRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls?head=${repoInfo.owner.login}:${branchName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Velocity-App",
        },
      });
      if (listPrRes.ok) {
        const pulls = await listPrRes.json();
        if (pulls && pulls[0]) {
          return pulls[0];
        }
      }
    }
    throw new Error(`Failed to create pull request: ${errText}`);
  }

  const prInfo = await prRes.json();
  console.log(`[github-git] Created Pull Request #${prInfo.number} successfully. URL: ${prInfo.html_url}`);
  return prInfo;
}

export async function getGithubPrFiles(input: {
  repoFullName: string;
  prNumber: number;
  token: string;
}) {
  const { repoFullName, prNumber, token } = input;
  console.log(`[github-git] Fetching files list for ${repoFullName} PR #${prNumber}...`);

  const filesRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Velocity-App",
    },
  });

  if (!filesRes.ok) {
    const errText = await filesRes.text();
    throw new Error(`Failed to fetch PR files from GitHub (${filesRes.status}): ${errText}`);
  }

  const files = await filesRes.json() as any[];
  console.log(`[github-git] PR #${prNumber} contains ${files.length} file(s). Fetching raw contents...`);

  const resultFiles = [];
  for (const f of files) {
    let content = "";
    if (f.status !== "removed") {
      const contentRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${f.filename}?ref=${f.sha || "main"}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.raw",
          "User-Agent": "Velocity-App",
        },
      });
      if (contentRes.ok) {
        content = await contentRes.text();
      } else {
        console.warn(`[github-git] Could not fetch raw content for ${f.filename}: ${contentRes.statusText}`);
      }
    }

    resultFiles.push({
      filepath: f.filename,
      status: f.status === "added" ? "added" : f.status === "removed" ? "deleted" : "modified",
      content,
      diff: f.patch || "",
    });
  }

  return resultFiles;
}
