import type {
  ComparisonLocation,
  ComparisonResponse,
  ComparisonStore,
  ReceiptItem,
} from "./map-data";
import { formatPrice, parseShoppingList } from "./map-data";

/**
 * Demo catalog behind /api/compare. Every branch sells the same demo range at
 * its own price, with a few deliberate gaps so the comparison has to handle
 * missing products honestly.
 */

type Unit = "l" | "ml" | "g" | "kg" | "stuk";

type StoreMeta = {
  id: string;
  brand: string;
  short: string;
  color: string;
  privateLabel: string;
  branchName: string;
  address: string;
  offset: [number, number];
};

const storeMeta: StoreMeta[] = [
  {
    id: "ah",
    brand: "Albert Heijn",
    short: "AH",
    color: "#0798d1",
    privateLabel: "AH",
    branchName: "Centrum · demo",
    address: "Voorbeeldlocatie · ter illustratie",
    offset: [-0.008, -0.006],
  },
  {
    id: "jumbo",
    brand: "Jumbo",
    short: "J",
    color: "#e5aa13",
    privateLabel: "Jumbo",
    branchName: "Stadswinkel · demo",
    address: "Voorbeeldlocatie · ter illustratie",
    offset: [0.006, 0.008],
  },
  {
    id: "lidl",
    brand: "Lidl",
    short: "L",
    color: "#0751a3",
    privateLabel: "Lidl",
    branchName: "Buurtwinkel · demo",
    address: "Voorbeeldlocatie · ter illustratie",
    offset: [-0.014, 0.012],
  },
  {
    id: "dirk",
    brand: "Dirk",
    short: "D",
    color: "#d6001c",
    privateLabel: "Dirk",
    branchName: "Wijkwinkel · demo",
    address: "Voorbeeldlocatie · ter illustratie",
    offset: [0.012, -0.011],
  },
  {
    id: "spar",
    brand: "Spar",
    short: "S",
    color: "#00843d",
    privateLabel: "Spar",
    branchName: "Buurtmarkt · demo",
    address: "Voorbeeldlocatie · ter illustratie",
    offset: [0.018, 0.005],
  },
];

type ProductSeed = {
  id: string;
  name: string;
  aliases: string[];
  size: number;
  unit: Unit;
  /** Prices in storeMeta order: AH, Jumbo, Lidl, Dirk, Spar. null = not sold. */
  prices: Array<number | null>;
  /** Organic pack price in the same order; omitted when no organic variant exists. */
  organic?: Array<number | null>;
};

const catalogSeed: ProductSeed[] = [
  {
    id: "halfvolle-melk",
    name: "halfvolle melk",
    aliases: ["halfvolle melk", "melk", "halfvolle"],
    size: 1,
    unit: "l",
    prices: [1.19, 1.15, 0.99, 1.09, 1.25],
    organic: [1.49, 1.45, 1.29, 1.39, 1.55],
  },
  {
    id: "volle-melk",
    name: "volle melk",
    aliases: ["volle melk"],
    size: 1,
    unit: "l",
    prices: [1.25, 1.21, 1.05, 1.15, 1.31],
    organic: [1.59, 1.55, 1.35, 1.45, 1.65],
  },
  {
    id: "eieren",
    name: "eieren",
    aliases: ["eieren", "ei", "eieren 10 stuks"],
    size: 10,
    unit: "stuk",
    prices: [2.29, 2.19, 1.99, 2.15, 2.49],
    organic: [3.49, 3.39, 3.19, 3.29, 3.69],
  },
  {
    id: "volkoren-brood",
    name: "volkoren brood",
    aliases: ["volkoren brood", "brood", "volkoren"],
    size: 1,
    unit: "stuk",
    prices: [2.19, 1.99, 1.49, 1.79, 2.29],
    organic: [2.89, 2.79, 2.19, 2.49, 2.99],
  },
  {
    id: "boter",
    name: "boter",
    aliases: ["boter", "roomboter"],
    size: 250,
    unit: "g",
    prices: [2.49, 2.39, 2.19, 2.29, 2.59],
    organic: [3.29, 3.19, 2.99, 3.09, 3.39],
  },
  {
    id: "jong-belegen-kaas",
    name: "jong belegen kaas",
    aliases: ["jong belegen kaas", "kaas", "belegen kaas"],
    size: 300,
    unit: "g",
    prices: [4.29, 4.19, 3.79, 3.99, 4.59],
    organic: [5.49, 5.39, 4.99, 5.19, 5.79],
  },
  {
    id: "yoghurt",
    name: "yoghurt naturel",
    aliases: ["yoghurt naturel", "yoghurt"],
    size: 1,
    unit: "l",
    prices: [1.69, 1.59, 1.29, 1.49, 1.79],
    organic: [2.19, 2.09, 1.79, 1.99, 2.29],
  },
  {
    id: "spinazie",
    name: "spinazie",
    aliases: ["spinazie", "biologische spinazie", "diepvries spinazie"],
    size: 450,
    unit: "g",
    prices: [1.99, 1.89, 1.59, 1.79, 2.09],
    organic: [2.49, 2.39, 2.09, 2.29, null],
  },
  {
    id: "bananen",
    name: "bananen",
    aliases: ["bananen", "banaan"],
    size: 1,
    unit: "kg",
    prices: [2.19, 2.09, 1.89, 1.99, 2.29],
    organic: [2.69, 2.59, 2.39, 2.49, 2.79],
  },
  {
    id: "appels",
    name: "appels",
    aliases: ["appels", "appel"],
    size: 1,
    unit: "kg",
    prices: [2.49, 2.39, 2.09, 2.19, 2.59],
    organic: [3.09, 2.99, 2.69, 2.79, 3.19],
  },
  {
    id: "tomaten",
    name: "tomaten",
    aliases: ["tomaten", "tomaat"],
    size: 500,
    unit: "g",
    prices: [1.79, 1.69, 1.49, 1.59, 1.89],
    organic: [2.29, 2.19, 1.99, 2.09, 2.39],
  },
  {
    id: "komkommer",
    name: "komkommer",
    aliases: ["komkommer"],
    size: 1,
    unit: "stuk",
    prices: [0.89, 0.85, 0.75, 0.79, 0.95],
    organic: [1.29, 1.25, 1.15, 1.19, 1.35],
  },
  {
    id: "aardappelen",
    name: "aardappelen",
    aliases: ["aardappelen", "aardappels", "kruimige aardappelen"],
    size: 2,
    unit: "kg",
    prices: [2.99, 2.89, 2.49, 2.59, 3.19],
    organic: [3.59, 3.49, 3.09, 3.19, 3.79],
  },
  {
    id: "wortels",
    name: "wortels",
    aliases: ["wortels", "wortel", "peentjes"],
    size: 1,
    unit: "kg",
    prices: [1.29, 1.25, 1.09, 1.15, 1.39],
    organic: [1.79, 1.75, 1.59, 1.65, 1.89],
  },
  {
    id: "uien",
    name: "uien",
    aliases: ["uien", "ui"],
    size: 1,
    unit: "kg",
    prices: [1.19, 1.15, 0.99, 1.05, 1.29],
    organic: [1.69, 1.65, 1.49, 1.55, 1.79],
  },
  {
    id: "paprika",
    name: "paprika",
    aliases: ["paprika"],
    size: 3,
    unit: "stuk",
    prices: [2.49, 2.39, 2.09, 2.19, 2.59],
    organic: [3.19, 3.09, 2.79, 2.89, 3.29],
  },
  {
    id: "kipfilet",
    name: "kipfilet",
    aliases: ["kipfilet", "kip"],
    size: 600,
    unit: "g",
    prices: [6.49, 6.29, 5.79, 5.99, 6.79],
    organic: [8.49, 8.29, 7.79, 7.99, 8.79],
  },
  {
    id: "rundergehakt",
    name: "rundergehakt",
    aliases: ["rundergehakt", "gehakt", "half om half"],
    size: 500,
    unit: "g",
    prices: [4.99, 4.89, 4.49, 4.59, 5.29],
    organic: [6.49, 6.39, 5.99, 6.09, 6.79],
  },
  {
    id: "zalmfilet",
    name: "zalmfilet",
    aliases: ["zalmfilet", "zalm"],
    size: 300,
    unit: "g",
    prices: [7.99, 7.79, null, 7.49, 8.29],
    organic: [9.99, 9.79, null, 9.49, 10.29],
  },
  {
    id: "penne",
    name: "penne",
    aliases: ["penne", "pasta", "pasta penne"],
    size: 500,
    unit: "g",
    prices: [1.79, 1.69, 1.29, 1.49, 1.89],
    organic: [2.39, 2.29, 1.89, 2.09, 2.49],
  },
  {
    id: "rijst",
    name: "rijst",
    aliases: ["rijst", "witte rijst"],
    size: 1,
    unit: "kg",
    prices: [2.49, 2.39, 1.99, 2.19, 2.59],
    organic: [3.19, 3.09, 2.69, 2.89, 3.29],
  },
  {
    id: "olijfolie",
    name: "olijfolie",
    aliases: ["olijfolie", "olie"],
    size: 500,
    unit: "ml",
    prices: [5.99, 5.79, 4.99, 5.49, 6.29],
    organic: [7.49, 7.29, 6.49, null, 7.79],
  },
  {
    id: "koffiebonen",
    name: "koffiebonen",
    aliases: ["koffiebonen", "koffie", "bonenkoffie"],
    size: 500,
    unit: "g",
    prices: [6.99, 6.79, 5.99, 6.49, 7.29],
    organic: [8.49, 8.29, 7.49, 7.99, 8.79],
  },
  {
    id: "thee",
    name: "thee",
    aliases: ["thee", "theezakjes"],
    size: 20,
    unit: "stuk",
    prices: [2.29, 2.19, 1.79, 1.99, 2.49],
    organic: [2.99, 2.89, 2.49, 2.69, 3.19],
  },
  {
    id: "sinaasappelsap",
    name: "sinaasappelsap",
    aliases: ["sinaasappelsap", "jus d orange", "sap"],
    size: 1,
    unit: "l",
    prices: [2.49, 2.39, 1.99, 2.19, 2.59],
    organic: [3.19, 3.09, 2.69, 2.89, 3.29],
  },
  {
    id: "cola",
    name: "cola",
    aliases: ["cola", "coca cola", "frisdrank"],
    size: 1.5,
    unit: "l",
    prices: [2.29, 2.19, 1.89, 1.99, 2.49],
  },
  {
    id: "chips",
    name: "chips naturel",
    aliases: ["chips naturel", "chips"],
    size: 200,
    unit: "g",
    prices: [1.99, 1.89, 1.49, 1.69, 2.19],
  },
  {
    id: "melkchocolade",
    name: "melkchocolade",
    aliases: ["melkchocolade", "chocolade", "chocola"],
    size: 100,
    unit: "g",
    prices: [1.49, 1.39, 1.19, 1.29, 1.59],
    organic: [1.99, 1.89, 1.69, 1.79, 2.09],
  },
  {
    id: "pindakaas",
    name: "pindakaas",
    aliases: ["pindakaas"],
    size: 350,
    unit: "g",
    prices: [2.79, 2.69, 2.29, 2.49, 2.99],
    organic: [3.49, 3.39, 2.99, 3.19, 3.69],
  },
  {
    id: "hagelslag",
    name: "hagelslag",
    aliases: ["hagelslag"],
    size: 400,
    unit: "g",
    prices: [2.49, 2.39, 2.09, 2.19, 2.59],
  },
  {
    id: "toiletpapier",
    name: "toiletpapier",
    aliases: ["toiletpapier", "wc papier", "toilet papier"],
    size: 8,
    unit: "stuk",
    prices: [4.49, 4.29, 3.79, 3.99, 4.89],
  },
  {
    id: "wasmiddel",
    name: "wasmiddel",
    aliases: ["wasmiddel", "waspoeder"],
    size: 1,
    unit: "l",
    prices: [5.99, 5.79, 4.99, 5.29, 6.49],
  },
  {
    id: "tandpasta",
    name: "tandpasta",
    aliases: ["tandpasta"],
    size: 75,
    unit: "ml",
    prices: [1.99, 1.89, 1.59, 1.69, 2.19],
  },
  {
    id: "diepvriespizza",
    name: "diepvriespizza",
    aliases: ["diepvriespizza", "pizza", "pizza margherita"],
    size: 1,
    unit: "stuk",
    prices: [3.49, 3.39, 2.99, 3.19, 3.69],
  },
  {
    id: "hummus",
    name: "hummus",
    aliases: ["hummus", "humus"],
    size: 200,
    unit: "g",
    prices: [2.49, 2.39, null, 2.19, 2.59],
  },
  {
    id: "avocado",
    name: "avocado",
    aliases: ["avocado"],
    size: 2,
    unit: "stuk",
    prices: [2.99, 2.89, 2.49, 2.59, 3.19],
    organic: [3.49, 3.39, 2.99, 3.09, 3.69],
  },
  {
    id: "aardbeien",
    name: "aardbeien",
    aliases: ["aardbeien", "aardbei"],
    size: 500,
    unit: "g",
    prices: [3.99, 3.89, 3.49, 3.59, 4.29],
    organic: [4.99, 4.89, 4.49, 4.59, 5.29],
  },
  {
    id: "sla",
    name: "sla",
    aliases: ["sla", "krop sla", "ijsbergsla"],
    size: 1,
    unit: "stuk",
    prices: [1.29, 1.19, 0.99, 1.09, 1.39],
    organic: [1.79, 1.69, 1.49, 1.59, 1.89],
  },
  {
    id: "magere-kwark",
    name: "magere kwark",
    aliases: ["magere kwark", "kwark"],
    size: 500,
    unit: "g",
    prices: [1.99, 1.89, 1.59, 1.79, 2.19],
    organic: [2.59, 2.49, 2.19, 2.39, 2.79],
  },
  {
    id: "kookroom",
    name: "kookroom",
    aliases: ["kookroom", "room"],
    size: 200,
    unit: "ml",
    prices: [1.39, 1.29, 1.09, 1.19, 1.49],
    organic: [1.89, 1.79, 1.59, 1.69, 1.99],
  },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("nl-NL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const catalog = catalogSeed.map((product) => ({
  ...product,
  aliases: [product.name, ...product.aliases].map(normalize),
}));

type Product = (typeof catalog)[number];

const unitAliases: Record<string, Unit | "pack"> = {
  l: "l",
  liter: "l",
  liters: "l",
  litre: "l",
  ml: "ml",
  milliliter: "ml",
  g: "g",
  gr: "g",
  gram: "g",
  grammen: "g",
  kg: "kg",
  kilo: "kg",
  kilogram: "kg",
  st: "stuk",
  stuk: "stuk",
  stuks: "stuk",
  pak: "pack",
  pakken: "pack",
  pakje: "pack",
  zak: "pack",
  zakken: "pack",
  fles: "pack",
  flessen: "pack",
  blik: "pack",
  blikken: "pack",
  bak: "pack",
  bakken: "pack",
};

type ParsedLine = {
  raw: string;
  quantity: number;
  unit: Unit | "pack" | null;
  query: string;
};

function parseLine(raw: string): ParsedLine {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s*(.*)$/u);

  if (!match) return { raw: trimmed, quantity: 1, unit: null, query: trimmed };

  const quantity = Number(match[1].replace(",", "."));
  const candidate = match[2] ? normalize(match[2]) : "";
  const knownUnit = candidate ? unitAliases[candidate] : undefined;
  const rest = match[3]?.trim() ?? "";

  return {
    raw: trimmed,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unit: knownUnit ?? null,
    query: knownUnit ? rest || trimmed : [match[2], rest].filter(Boolean).join(" ") || trimmed,
  };
}

function findProduct(query: string): Product | null {
  const haystack = ` ${normalize(query)} `;
  let best: { product: Product; length: number } | null = null;

  for (const product of catalog) {
    for (const alias of product.aliases) {
      if (!alias) continue;
      if (
        haystack.includes(` ${alias} `) &&
        (!best || alias.length > best.length)
      ) {
        best = { product, length: alias.length };
      }
    }
  }

  return best?.product ?? null;
}

type Measure = { family: "mass" | "volume" | "count"; amount: number };

function toMeasure(value: number, unit: Unit): Measure {
  if (unit === "g") return { family: "mass", amount: value };
  if (unit === "kg") return { family: "mass", amount: value * 1000 };
  if (unit === "ml") return { family: "volume", amount: value };
  if (unit === "l") return { family: "volume", amount: value * 1000 };
  return { family: "count", amount: value };
}

function countPacks(line: ParsedLine, product: Product) {
  if (line.unit === "pack") return Math.max(1, Math.ceil(line.quantity));

  const pack = toMeasure(product.size, product.unit);
  const requested = toMeasure(line.quantity, line.unit ?? product.unit);
  if (requested.family !== pack.family || pack.amount <= 0) return 1;

  return Math.max(1, Math.ceil(requested.amount / pack.amount));
}

const numberFormatter = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 2,
});

function packLabel(product: Product) {
  const amount = numberFormatter.format(product.size);
  if (product.unit === "stuk") {
    return `${amount} ${product.size === 1 ? "stuk" : "stuks"}`;
  }
  return `${amount} ${product.unit === "l" ? "L" : product.unit}`;
}

function productTitle(
  meta: StoreMeta,
  product: Product,
  organic: boolean,
  packs: number,
) {
  const name = product.name.charAt(0).toUpperCase() + product.name.slice(1);
  const organicLabel = organic ? "Biologisch " : "";
  return `${meta.privateLabel} ${organicLabel}${name} (${packs} × ${packLabel(product)})`;
}

function unitPriceLabel(price: number, product: Product) {
  const pack = toMeasure(product.size, product.unit);
  if (pack.family === "mass") {
    return `${formatPrice(price / (pack.amount / 1000))} / kg`;
  }
  if (pack.family === "volume") {
    return `${formatPrice(price / (pack.amount / 1000))} / L`;
  }
  return `${formatPrice(price / pack.amount)} / stuk`;
}

type Offer = { price: number; organic: boolean };

function hasOrganicVariant(product: Product) {
  return product.organic?.some((price) => typeof price === "number") ?? false;
}

function resolveOffer(
  product: Product,
  storeIndex: number,
  organicOnly: boolean,
): Offer | null {
  const wantsOrganic = organicOnly && hasOrganicVariant(product);
  const price = wantsOrganic
    ? product.organic?.[storeIndex] ?? null
    : product.prices[storeIndex];

  if (typeof price !== "number") return null;
  return { price, organic: wantsOrganic };
}

const namedBrands: Array<[string, string]> = [
  ["campina", "Campina"],
  ["coca cola", "Coca-Cola"],
  ["barilla", "Barilla"],
  ["douwe egberts", "Douwe Egberts"],
  ["lay s", "Lay's"],
  ["calve", "Calvé"],
  ["de ruijter", "De Ruijter"],
  ["iglo", "Iglo"],
  ["chiquita", "Chiquita"],
  ["bertolli", "Bertolli"],
  ["pickwick", "Pickwick"],
  ["appelsientje", "Appelsientje"],
  ["verkade", "Verkade"],
  ["page", "Page"],
  ["robijn", "Robijn"],
  ["prodent", "Prodent"],
  ["dr oetker", "Dr. Oetker"],
  ["maza", "Maza"],
  ["plukon", "Plukon"],
  ["vion", "Vion"],
];

function brandSubstitution(query: string, privateLabel: string) {
  const haystack = ` ${normalize(query)} `;
  const named = namedBrands.find(([key]) => haystack.includes(` ${key} `));
  if (!named) return null;
  if (normalize(privateLabel) === named[0]) return null;
  return `${privateLabel}-huismerk in plaats van ${named[1]}`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function distanceKm(from: [number, number], to: [number, number]) {
  const radius = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(to[0] - from[0]);
  const deltaLng = toRadians(to[1] - from[1]);
  const startLat = toRadians(from[0]);
  const endLat = toRadians(to[0]);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;

  return Math.round(2 * radius * Math.asin(Math.sqrt(haversine)) * 10) / 10;
}

export function buildComparison(
  rawInput: string,
  location: ComparisonLocation,
  organicOnly: boolean,
): ComparisonResponse {
  const lines = parseShoppingList(rawInput).map(parseLine);
  const matched = lines.map((line) => findProduct(line.query));

  const offersByStore = storeMeta.map((_, storeIndex) =>
    matched.map((product) =>
      product ? resolveOffer(product, storeIndex, organicOnly) : null,
    ),
  );

  // Fair comparison: a product that any store does not sell is left out of
  // every basket, so the totals always cover the same basket.
  const comparable = matched.map(
    (product, lineIndex) =>
      Boolean(product) &&
      offersByStore.every((offers) => offers[lineIndex] !== null),
  );

  const stores: ComparisonStore[] = storeMeta.map((meta, storeIndex) => {
    let running = 0;

    const receipt: ReceiptItem[] = lines.map((line, lineIndex) => {
      const product = matched[lineIndex];

      if (!product) {
        return {
          name: line.raw,
          productName: null,
          quantityLabel: "",
          unitPriceLabel: null,
          price: null,
          status: "unmatched",
          reason: "Niet in de demo-catalogus",
          organic: false,
          substitution: null,
        };
      }

      const offer = offersByStore[storeIndex][lineIndex];
      const packs = countPacks(line, product);
      const linePrice = offer ? roundMoney(packs * offer.price) : null;
      const isComparable = comparable[lineIndex];
      if (isComparable && linePrice !== null) running += linePrice;

      return {
        name: line.raw,
        productName: productTitle(
          meta,
          product,
          offer?.organic ?? false,
          packs,
        ),
        quantityLabel: `${packs} × ${packLabel(product)}`,
        unitPriceLabel: offer ? unitPriceLabel(offer.price, product) : null,
        price: linePrice,
        status: isComparable ? "comparable" : "excluded",
        reason: isComparable
          ? null
          : offer === null
            ? `Niet verkocht bij ${meta.brand}`
            : "Niet bij elke winkel te koop: uit alle totalen weggelaten",
        organic: offer?.organic ?? false,
        substitution: offer
          ? brandSubstitution(line.query, meta.privateLabel)
          : null,
      };
    });

    const missingItems = [
      ...new Set(
        lines
          .filter(
            (_, lineIndex) =>
              matched[lineIndex] &&
              offersByStore[storeIndex][lineIndex] === null,
          )
          .map((line) => line.raw),
      ),
    ];

    const position: [number, number] = [
      location.center[0] + meta.offset[0],
      location.center[1] + meta.offset[1],
    ];

    return {
      id: meta.id,
      brand: meta.brand,
      short: meta.short,
      color: meta.color,
      privateLabel: meta.privateLabel,
      branchName: meta.branchName,
      address: meta.address,
      position,
      basketTotal: roundMoney(running),
      distanceKm: distanceKm(location.center, position),
      matchedCount: receipt.filter((item) => item.status === "comparable")
        .length,
      excludedCount: receipt.filter((item) => item.status !== "comparable")
        .length,
      missingItems,
      receipt,
    };
  });

  const excluded = [
    ...new Set(
      lines
        .filter((_, lineIndex) => matched[lineIndex] && !comparable[lineIndex])
        .map((line) => line.raw),
    ),
  ];
  const unmatched = [
    ...new Set(
      lines
        .filter((_, lineIndex) => !matched[lineIndex])
        .map((line) => line.raw),
    ),
  ];

  return {
    items: lines.map((line) => line.raw),
    stores,
    comparableCount: comparable.filter(Boolean).length,
    excluded,
    unmatched,
  };
}
