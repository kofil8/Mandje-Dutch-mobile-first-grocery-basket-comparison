import { NextResponse } from "next/server";
import { findLocation } from "../../map-data";

/**
 * Best-effort city estimate for the visitor, used only when the browser denies
 * geolocation. Hosting providers expose the IP-based city in different headers;
 * no external lookup is performed, so this stays a zero-dependency upgrade.
 */
const cityHeaders = [
  "x-vercel-ip-city",
  "cf-ipcity",
  "x-appengine-city",
  "x-geo-city",
  "x-city",
];

export async function GET(request: Request) {
  for (const header of cityHeaders) {
    const raw = request.headers.get(header);
    if (!raw) continue;

    let city = raw.replace(/\+/g, " ");
    try {
      city = decodeURIComponent(city);
    } catch {
      // Keep the raw header value when it is not URI encoded.
    }

    const location = findLocation(city);
    if (location) {
      return NextResponse.json(
        { location },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return NextResponse.json(
    { error: "Geen locatieschatting beschikbaar." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}
