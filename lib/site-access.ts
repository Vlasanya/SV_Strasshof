import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "site_access";

function siteAccessPassword(): string | null {
  const value = process.env.SITE_ACCESS_PASSWORD?.trim();
  return value || null;
}

/** SHA-256 token stored in the access cookie (not the raw password). */
export function siteAccessToken(password: string): string {
  return createHash("sha256").update(`site-access:${password}`).digest("hex");
}

export function siteAccessCookieName(): string {
  return COOKIE_NAME;
}

export function isSiteAccessConfigured(): boolean {
  return Boolean(siteAccessPassword());
}

/** Lock only *.vercel.app unless SITE_ACCESS_VERCEL_ONLY=0. */
export function siteAccessAppliesToHost(host: string): boolean {
  if (!isSiteAccessConfigured()) return false;
  const vercelOnly = process.env.SITE_ACCESS_VERCEL_ONLY !== "0";
  if (vercelOnly) return host.endsWith(".vercel.app");
  return true;
}

export function hasSiteAccess(request: NextRequest): boolean {
  const password = siteAccessPassword();
  if (!password) return true;

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;

  const expected = siteAccessToken(password);
  try {
    return timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
  } catch {
    return false;
  }
}

const PUBLIC_PREFIXES = [
  "/site-zugang",
  "/api/site-access",
] as const;

export function isSiteAccessPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
