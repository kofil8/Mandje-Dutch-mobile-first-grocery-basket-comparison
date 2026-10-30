# Mandje

Dutch, mobile-first grocery basket comparison demo. Enter a shopping list, pick a location, and compare five demo supermarkets (Albert Heijn, Jumbo, Lidl, Dirk and Spar) on an interactive Leaflet map.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Leaflet / react-leaflet
- pnpm

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`.

## Features

- Demo catalog of 40 products with per-store prices, pack sizes, organic variants and deliberate stock gaps, served by `/api/compare`.
- Shopping list input understands quantities and units ("1 liter melk", "6 eieren", "500 gram kaas", "2 pakken hummus").
- A product any compared store does not sell is left out of every basket, so the totals cover the same basket; the missing items are named in the results.
- Line-item receipts with pack quantities, unit prices (per kg/L/stuk), organic prices and "AI Keuze" house-brand substitutions.
- Live product recognition while typing (debounced green underline).
- Location search by Dutch city name or postcode area, browser geolocation with a network-based city fallback, radius selector and organic toggle.
- Interactive map with fitted bounds, store pins, hover-linked highlighting and demo distances.
- Mobile-first: map starts collapsed; sticky compare bar; receipt becomes a bottom sheet.

Prices, stock, branches and addresses are illustrative.
# Mandje-Dutch-mobile-first-grocery-basket-comparison
