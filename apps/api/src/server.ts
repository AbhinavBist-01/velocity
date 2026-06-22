import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import cookieParser from "cookie-parser";
import { randomBytes } from "node:crypto";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext, userService } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

function normalizeOrigin(value: string) {
  return new URL(value).origin;
}

const baseUrl = normalizeOrigin(env.BASE_URL);
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Streamyst OpenAPI",
  version: "1.0.0",
  baseUrl: `${baseUrl}/api`,
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  env.FRONTEND_URL,
]
  .filter((origin): origin is string => Boolean(origin))
  .map(normalizeOrigin);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

const ONE_YEAR = 12 * 30 * 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;
const AUTHENTICATION_COOKIE_NAME = "authentication-token";
const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google-oauth-state";

function isProduction() {
  const nodeEnv = String(process.env.NODE_ENV ?? "development");
  return nodeEnv === "production" || nodeEnv === "prod";
}

function getCookieOptions(maxAge: number) {
  const production = isProduction();
  return {
    path: "/",
    httpOnly: true,
    secure: production,
    sameSite: production ? ("none" as const) : ("lax" as const),
    maxAge,
  };
}

function getSafeNextPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

function encodeState(payload: { nonce: string; next: string }) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeState(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof parsed?.nonce !== "string" || typeof parsed?.next !== "string") return null;
    return parsed as { nonce: string; next: string };
  } catch {
    return null;
  }
}

function getFrontendRedirect(nextPath: string) {
  return new URL(nextPath, env.FRONTEND_URL ?? "http://localhost:3000").toString();
}

app.get("/", (req, res) => {
  return res.json({ message: "Streamyst is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Streamyst server is healthy", healthy: true });
});

const startGoogleAuth: express.RequestHandler = (req, res, next) => {
  try {
    const nonce = randomBytes(16).toString("hex");
    const state = encodeState({
      nonce,
      next: getSafeNextPath(req.query.next),
    });

    res.cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, nonce, getCookieOptions(TEN_MINUTES));
    return res.redirect(userService.getGoogleAuthUrl(state));
  } catch (error) {
    return next(error);
  }
};

const handleGoogleCallback: express.RequestHandler = async (req, res, next) => {
  try {
    const state = decodeState(req.query.state);
    const expectedNonce = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE_NAME];

    if (!state || !expectedNonce || state.nonce !== expectedNonce) {
      return res.redirect(getFrontendRedirect("/login?oauthError=invalid_state"));
    }

    if (typeof req.query.code !== "string") {
      return res.redirect(getFrontendRedirect("/login?oauthError=missing_code"));
    }

    const { token } = await userService.signInWithGoogleCode(req.query.code);
    res.cookie(AUTHENTICATION_COOKIE_NAME, token, getCookieOptions(ONE_YEAR));
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, {
      path: "/",
      secure: isProduction(),
      sameSite: isProduction() ? "none" : "lax",
    });

    return res.redirect(getFrontendRedirect(state.next));
  } catch (error) {
    return next(error);
  }
};

app.get("/auth/google", startGoogleAuth);
app.get("/api/auth/google", startGoogleAuth);
app.get("/auth/google/callback", handleGoogleCallback);
app.get("/api/auth/google/callback", handleGoogleCallback);

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
