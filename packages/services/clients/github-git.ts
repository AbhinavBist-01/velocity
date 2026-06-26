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

  console.log(`Starting GitHub branch & PR creation on ${repoFullName} for branch ${branchName}...`);

  // 1. Get default branch name (usually main or master)
  const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Velocity-App",
    },
  });
  if (!repoRes.ok) {
    throw new Error(`Failed to fetch repo info from GitHub: ${await repoRes.text()}`);
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
  if (!refRes.ok) {
    throw new Error(`Failed to fetch default branch SHA: ${await refRes.text()}`);
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

  if (!createRefRes.ok) {
    const errText = await createRefRes.text();
    // If the branch already exists, we will reuse it. Otherwise, throw.
    if (!errText.includes("Reference already exists")) {
      throw new Error(`Failed to create branch reference: ${errText}`);
    }
    console.log(`Branch ${branchName} already exists, committing to it.`);
  } else {
    console.log(`Created branch ${branchName} successfully.`);
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

    if (!commitRes.ok) {
      throw new Error(`Failed to commit file ${path}: ${await commitRes.text()}`);
    }
    console.log(`Committed ${path} to branch ${branchName}`);
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

  if (!prRes.ok) {
    const errText = await prRes.text();
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
  console.log(`Created Pull Request #${prInfo.number} successfully.`);
  return prInfo;
}
