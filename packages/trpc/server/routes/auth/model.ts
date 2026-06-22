import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("fullname of the user"),
  email: z.string().email().describe("email of the user"),
  password: z
    .string()
    .min(8)
    .describe("password of the user, should be at least 8 characters long"),
});

export const createUserWithEmailAndPasswordOuputModel = z.object({
  id: z.string().describe("id of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.string().email().describe("email of the user"),
  password: z
    .string()
    .min(8)
    .describe("password of the user, should be at least 8 characters long"),
});

export const signInUserWithEmailAndPasswordOuputModel = z.object({
  id: z.string().describe("id of the user"),
});

export const getLoggedInUserInfoInputModel = z.undefined();

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("id of the user"),
  fullName: z.string().describe("fullname of the user"),
  email: z.string().email().describe("email of the user"),
  role: z.string().describe("role of the user"),
});

export const logoutInputModel = z.undefined();

export const logoutOutputModel = z.object({
  success: z.literal(true).describe("whether the auth session was cleared"),
});
