import { pineconeIndex } from "../clients/pinecone";

export type CodeChunk = {
  id: string;
  filePath: string;
  text: string;
};

const CONTEXT_RESULTS = 10;

export function buildPrNamespace(repoFullName: string, prNumber: number) {
  return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
}

export async function saveChunksToPinecone(namespace: string, chunks: CodeChunk[]) {
  const records = chunks.map((chunk) => ({
    id: chunk.id,
    text: chunk.text,
    filePath: chunk.filePath,
  }));

  // namespace() scopes vectors so this PR never mixes with repo-wide sync data
  await pineconeIndex.namespace(namespace).upsertRecords({ records });
}

export async function searchPrContext(namespace: string, query: string): Promise<string[]> {
  try {
    const response = await pineconeIndex.namespace(namespace).searchRecords({
      query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
    });

    const snippets: string[] = [];

    for (const hit of response.result.hits) {
      const fields = hit.fields as { text?: string; filePath?: string };
      if (!fields.text) {
        continue;
      }
      snippets.push(`File: ${fields.filePath}\n${fields.text}`);
    }

    return snippets;
  } catch (error) {
    console.error("Failed to search PR context from Pinecone:", error);
    return [];
  }
}
