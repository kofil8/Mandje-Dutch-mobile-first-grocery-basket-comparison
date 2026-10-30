export type RecognisedSpan = {
  start: number;
  end: number;
};

const modifiers = [
  "biologisch",
  "bio",
  "vers",
  "halfvolle",
  "volle",
  "magere",
  "gerookte",
  "gekookte",
  "bevroren",
  "diepvries",
  "volkoren",
  "plantaardige",
  "lactosevrije",
  "suikervrije",
  "rode",
  "witte",
  "groene",
];

const products = [
  "melk",
  "kaas",
  "brood",
  "eieren",
  "ei",
  "boter",
  "yoghurt",
  "kwark",
  "vla",
  "room",
  "slagroom",
  "spinazie",
  "tomaat",
  "tomaten",
  "paprika",
  "komkommer",
  "sla",
  "aardappelen",
  "aardappels",
  "ui",
  "uien",
  "wortel",
  "wortels",
  "broccoli",
  "bloemkool",
  "courgette",
  "avocado",
  "bananen",
  "appels",
  "peren",
  "sinaasappels",
  "citroen",
  "druiven",
  "aardbeien",
  "kip",
  "kipfilet",
  "gehakt",
  "rundvlees",
  "varkensvlees",
  "zalm",
  "garnalen",
  "vis",
  "worst",
  "ham",
  "spek",
  "pasta",
  "spaghetti",
  "rijst",
  "noedels",
  "couscous",
  "meel",
  "suiker",
  "zout",
  "peper",
  "olijfolie",
  "olie",
  "azijn",
  "saus",
  "ketchup",
  "mayonaise",
  "pesto",
  "soep",
  "bonen",
  "linzen",
  "kikkererwten",
  "noten",
  "amandelen",
  "koffie",
  "thee",
  "sap",
  "frisdrank",
  "water",
  "bier",
  "wijn",
  "cola",
  "chips",
  "koek",
  "koekjes",
  "chocolade",
  "ijs",
  "pizza",
  "pannenkoeken",
  "toiletpapier",
  "keukenpapier",
  "afwasmiddel",
  "wasmiddel",
  "tandpasta",
  "zeep",
  "shampoo",
  "deodorant",
  "luiers",
];

const units = [
  "liter",
  "ml",
  "gram",
  "kilo",
  "stuks",
  "stuk",
  "pak",
  "zak",
  "fles",
  "blik",
  "bak",
];

const vocabulary = new Set([...modifiers, ...products, ...units]);

function normalizeToken(token: string) {
  return token
    .toLocaleLowerCase("nl-NL")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function isRecognised(token: string) {
  if (token.length < 2) return false;
  if (vocabulary.has(token)) return true;
  // Organic modifiers are matched as a prefix so "biologische" counts too.
  if (token.startsWith("biologisch")) return true;
  if (token.endsWith("en") && vocabulary.has(token.slice(0, -2))) return true;
  if (token.endsWith("s") && vocabulary.has(token.slice(0, -1))) return true;
  return false;
}

/** Character ranges of words the client recognises as grocery entities. */
export function findRecognisedSpans(value: string): RecognisedSpan[] {
  const spans: RecognisedSpan[] = [];
  const pattern = /[\p{L}\p{N}'’]+/gu;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    if (isRecognised(normalizeToken(match[0]))) {
      spans.push({ start: match.index, end: match.index + match[0].length });
    }
  }

  return spans;
}
