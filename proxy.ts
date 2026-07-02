import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  hasSiteAccess,
  isSiteAccessPublicPath,
  siteAccessAppliesToHost,
} from "@/lib/site-access";

export async function proxy(request: NextRequest) {
  const host = request.nextUrl.hostname;
  const { pathname } = request.nextUrl;

  if (
    siteAccessAppliesToHost(host) &&
    !isSiteAccessPublicPath(pathname) &&
    !hasSiteAccess(request)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/site-zugang";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and images.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
