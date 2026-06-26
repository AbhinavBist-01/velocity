import { auth } from "@repo/database/auth";
import { toNextResponse } from "better-auth/next-js";

export const { GET, POST } = toNextResponse(auth);
