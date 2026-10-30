export type MapLocation = {
  label: string;
  center: [number, number];
};

export type ComparisonLocation = {
  label: string;
  center: [number, number];
  radius: number;
};

export type ReceiptItemStatus = "comparable" | "excluded" | "unmatched";

export type ReceiptItem = {
  /** The line the visitor typed. */
  name: string;
  /** Matched demo product, e.g. "AH Halfvolle melk 1 L". */
  productName: string | null;
  /** How many packs are needed, e.g. "2 × 300 g". */
  quantityLabel: string;
  unitPriceLabel: string | null;
  price: number | null;
  status: ReceiptItemStatus;
  reason: string | null;
  organic: boolean;
  /** Set when a house brand replaced the brand the visitor named. */
  substitution: string | null;
};

export type ComparisonStore = {
  id: string;
  brand: string;
  short: string;
  color: string;
  privateLabel: string;
  branchName: string;
  address: string;
  position: [number, number];
  basketTotal: number;
  distanceKm: number;
  matchedCount: number;
  excludedCount: number;
  /** Products this branch does not sell, which are therefore left out of every total. */
  missingItems: string[];
  receipt: ReceiptItem[];
};

export type ComparisonRequest = {
  rawInput: string;
  location: {
    lat: number;
    lng: number;
    postcode: string;
    radius: number;
  };
  isOrganicOnly: boolean;
};

export type ComparisonResponse = {
  items: string[];
  stores: ComparisonStore[];
  comparableCount: number;
  /** Product names left out of every total because not every store sells them. */
  excluded: string[];
  /** Input lines that do not exist in the demo catalog. */
  unmatched: string[];
};

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 50;
export const MAX_LIST_LENGTH = 1000;
export const RADIUS_OPTIONS = [5, 10, 15] as const;

/** Fallback map centre (Amsterdam) used before a location is chosen. */
export const DEFAULT_CENTER: [number, number] = [52.3676, 4.9041];

const locations: Array<MapLocation & { postcodes: string[] }> = [
  { label: "Amsterdam", center: [52.3676, 4.9041], postcodes: ["10"] },
  { label: "Rotterdam", center: [51.9244, 4.4777], postcodes: ["30"] },
  { label: "Utrecht", center: [52.0907, 5.1214], postcodes: ["35"] },
  { label: "Den Haag", center: [52.0705, 4.3007], postcodes: ["25"] },
  { label: "Eindhoven", center: [51.4416, 5.4697], postcodes: ["56"] },
  { label: "Groningen", center: [53.2194, 6.5665], postcodes: ["97"] },
  { label: "Maastricht", center: [50.8514, 5.69], postcodes: ["62"] },
  { label: "Haarlem", center: [52.3874, 4.6462], postcodes: ["20"] },
  { label: "Leiden", center: [52.1601, 4.497], postcodes: ["23"] },
  { label: "Nijmegen", center: [51.8126, 5.8372], postcodes: ["65"] },
  { label: "Tilburg", center: [51.5555, 5.0913], postcodes: ["50"] },
  { label: "Breda", center: [51.5719, 4.7683], postcodes: ["48"] },
];

/** Single source of truth for the supported cities, used by the location input. */
export const SUPPORTED_CITIES = locations.map((location) => location.label);

const denseCities = new Set(["Amsterdam", "Rotterdam", "Utrecht", "Den Haag"]);

/** Picks a sensible starting radius for a resolved place. */
export function suggestRadius(label: string): number {
  const city = label.replace(/^Regio\s+/i, "").trim();
  if (denseCities.has(city)) return 5;
  if (label.startsWith("Regio")) return 15;
  return 10;
}

export function findLocation(value: string): MapLocation | null {
  const normalized = value.trim().toLocaleLowerCase("nl-NL");
  if (!normalized) return null;

  const city = locations.find(
    (location) => location.label.toLocaleLowerCase("nl-NL") === normalized,
  );
  if (city) return { label: city.label, center: city.center };

  const postcode = normalized.match(/^(\d{4})\s*[a-z]{0,2}$/i);
  if (!postcode) return null;
  const region = locations.find((location) =>
    location.postcodes.some((prefix) => postcode[1].startsWith(prefix)),
  );
  return region
    ? { label: `Regio ${region.label}`, center: region.center }
    : null;
}

const priceFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(price: number) {
  return priceFormatter.format(price);
}

const distanceFormatter = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatDistance(km: number) {
  return `${distanceFormatter.format(km)} km`;
}

/** Splits on newlines, semicolons and commas that are not part of a number. */
export function parseShoppingList(value: string) {
  return value
    .split(/[\n;]+|(?<!\d),(?!\d)\s*/u)
    .map((item) => item.replace(/^[\s•*-]+/, "").trim())
    .filter(Boolean);
}
