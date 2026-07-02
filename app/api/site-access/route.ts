import { NextResponse } from "next/server";
import {
  isSiteAccessConfigured,
  siteAccessCookieName,
  siteAccessToken,
} from "@/lib/site-access";

export async function POST(request: Request) {
  if (!isSiteAccessConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password?.trim() ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const expected = process.env.SITE_ACCESS_PASSWORD?.trim() ?? "";
  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(siteAccessCookieName(), siteAccessToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
