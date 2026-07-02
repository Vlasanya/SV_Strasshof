import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config";
import {
  getCalendarFeedData,
  parseCalendarFeedScope,
} from "@/lib/calendar-feed";
import { buildIcsCalendar } from "@/lib/ical";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = parseCalendarFeedScope(
    searchParams.get("team"),
    searchParams.get("teams"),
  );
  const includeOefb = searchParams.get("oefb") !== "0";

  const { events, calendarName } = await getCalendarFeedData(scope, includeOefb);

  const origin =
    SITE_URL ||
    new URL(request.url).origin.replace(/\/+$/, "");

  const ics = buildIcsCalendar({
    events,
    calendarName,
    domain: origin,
  });

  const filename = "strasshof-termine.ics";

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
