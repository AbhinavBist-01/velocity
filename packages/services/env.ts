import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalEnvString = z.preprocess(emptyStringToUndefined, z.string().optional());

const envSchema = z.object({
  JWT_SECRET: z.string().min(1).describe("Secret key for signing JWT tokens"),
  GOOGLE_OAUTH_CLIENT_ID: optionalEnvString,
  GOOGLE_OAUTH_CLIENT_SECRET: optionalEnvString,
  GOOGLE_OAUTH_REDIRECT_URI: optionalEnvString,
  GEMINI_API_KEY: optionalEnvString,
  PINECONE_API_KEY: optionalEnvString,
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
