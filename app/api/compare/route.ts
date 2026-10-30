import { NextResponse } from "next/server";
import {
  parseShoppingList,
  type ComparisonRequest,
  type ComparisonResponse,
  type MapLocation,
} from "../../map-data";
import { buildComparison } from "../../store-data";

const allowedRadii = new Set([5, 10, 15]);

export async function POST(request: Request) {
  let payload: ComparisonRequest;

  try {
    payload = (await request.json()) as ComparisonRequest;
  } catch {
    return NextResponse.json(
      { error: "Ongeldige aanvraag. Probeer het opnieuw." },
      { status: 400 },
    );
  }

  if (
    typeof payload?.rawInput !== "string" ||
    payload.rawInput.length > 1000 ||
    !payload.location ||
    typeof payload.location.lat !== "number" ||
    !Number.isFinite(payload.location.lat) ||
    Math.abs(payload.location.lat) > 90 ||
    typeof payload.location.lng !== "number" ||
    !Number.isFinite(payload.location.lng) ||
    Math.abs(payload.location.lng) > 180 ||
    typeof payload.location.postcode !== "string" ||
    !payload.location.postcode.trim() ||
    !allowedRadii.has(payload.location.radius) ||
    typeof payload.isOrganicOnly !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Controleer je boodschappenlijstje en locatie." },
      { status: 400 },
    );
  }

  const items = parseShoppingList(payload.rawInput);
  if (!items.length || items.length > 50) {
    return NextResponse.json(
      { error: "Vul 1 tot 50 producten in om te vergelijken." },
      { status: 400 },
    );
  }

  const location: MapLocation = {
    label: payload.location.postcode,
    center: [payload.location.lat, payload.location.lng],
  };
  const response: ComparisonResponse = buildComparison(
    payload.rawInput,
    { ...location, radius: payload.location.radius },
    payload.isOrganicOnly,
  );

  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
