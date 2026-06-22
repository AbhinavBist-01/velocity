import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().describe("The full name of the user"),
  email: z.string().email().describe("The email address of the user"),
  password: z.string().describe("The password for the user account"),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const generateUserToken = z.object({
  id: z.string().describe("uuid of the user"),
});

export type GenerateUserTokenType = z.infer<typeof generateUserToken>;

export const signInWithEmailAndPasswordInput = z.object({
  email: z.string().email().describe("The email address of the user"),
  password: z.string().describe("The password for the user account"),
});

export type SignInWithEmailAndPasswordInputType = z.infer<typeof signInWithEmailAndPasswordInput>;

export const signInWithGoogleInput = z.object({
  idToken: z.string().min(1).describe("The Google ID token returned from OAuth"),
});

export type SignInWithGoogleInputType = z.infer<typeof signInWithGoogleInput>;

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});

export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;
