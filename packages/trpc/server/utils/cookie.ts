import type { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";

const ONE_YEAR = 12 * 30 * 24 * 60 * 60 * 1000; // in milliseconds
const nodeEnv = String(process.env.NODE_ENV ?? "development");
const isProduction = nodeEnv === "production" || nodeEnv === "prod";

const defaultOptions: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: ONE_YEAR,
};

export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    options: CookieOptions = defaultOptions,
  ) {
    res.cookie(name, value, options);
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string) {
    return req.cookies?.[name];
  };
}

export function deleteCookieFactory(res: Response) {
  return function deleteCookie(name: string) {
    res.clearCookie(name, {
      path: defaultOptions.path,
      secure: defaultOptions.secure,
      sameSite: defaultOptions.sameSite,
    });
  };
}

// Authentication cookies

const AUTHENTICATION_COOKIE_NAME = "authentication-token";
export function createAuthCookie(ctx: TRPCContext, accessToken: string) {
  ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken);
}

export function getAuthCookie(ctx: TRPCContext) {
  return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function deleteAuthCookie(ctx: TRPCContext) {
  ctx.deleteCookie(AUTHENTICATION_COOKIE_NAME);
}
