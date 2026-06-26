import type { CodeChunk } from "./vector";

const MAX_CHUNK_LINES = 80;

function buildChunkId(prNumber: number, filePath: string, part: number) {
  // Normalize file paths to be safe for Pinecone record IDs
  const safeFilePath = filePath.replace(/[^a-zA-Z0-9-_]/g, "_");
  return `pr-${prNumber}--${safeFilePath}--part-${part}`;
}

export type InputFile = {
  filepath: string;
  diff: string; // The patch / unified diff
  content?: string; // The full content of the file (optional)
};

export function chunkPrFiles(prNumber: number, files: InputFile[]): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    // We prefer chunking the diff since it shows exactly what changed,
    // but fall back to full content if the diff is empty.
    const textToChunk = file.diff || file.content || "";
    if (!textToChunk) continue;

    const lines = textToChunk.split("\n");

    for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
      const part = Math.floor(start / MAX_CHUNK_LINES);
      const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n");

      chunks.push({
        id: buildChunkId(prNumber, file.filepath, part),
        filePath: file.filepath,
        text,
      });
    }
  }

  return chunks;
}
