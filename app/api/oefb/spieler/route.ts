import { NextResponse } from "next/server";
import { fetchOefbSpielerProfile } from "@/lib/oefb-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spielerProfilUrl = searchParams.get("spielerProfilUrl") ?? undefined;
  const spielerName = searchParams.get("name")?.trim();

  if (!spielerName) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  const profile = await fetchOefbSpielerProfile(spielerProfilUrl, spielerName);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
