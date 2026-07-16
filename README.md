# AR Menu Platform

Customer-facing frontend MVP for a QR-based restaurant menu. The demo identifies a restaurant, branch, table, active menu, and table session from the route, then lets guests browse bilingual menu content, inspect items, and build a frontend-only cart.

## Installation

```bash
npm install
```

## Development Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm start
```

## Demo Route

Open:

```text
http://localhost:3000/r/brunch-cafe/t/T12
```

Other table codes also work for the mock restaurant, for example `/r/brunch-cafe/t/T07`.

## Routes

- `/` - product demonstration landing page.
- `/r/[restaurantSlug]/t/[tableCode]` - customer menu.
- `/r/[restaurantSlug]/t/[tableCode]/item/[itemId]` - item details.
- `/r/[restaurantSlug]/t/[tableCode]/cart` - local cart.
- `/r/[restaurantSlug]/t/[tableCode]/order-status` - mock order timeline.

## Folder Structure

- `app/` - Next.js App Router pages, loading, and error boundaries.
- `components/` - reusable UI grouped by feature.
- `components/menu/` - menu, landing, item cards, and detail screens.
- `components/cart/` - cart provider, sticky bar, and cart page.
- `components/ar/` - 3D and AR-ready controls.
- `components/layout/` - locale and language UI.
- `data/` - replaceable mock restaurant/menu data.
- `repositories/` - mock data access layer.
- `services/` - UI-facing service layer.
- `types/` - domain TypeScript interfaces.
- `lib/` - i18n, money, and cart calculation helpers.
- `public/` - PWA manifest and restaurant logo placeholder.

## Architectural Decisions

- Server routes obtain menu/session/order data only through `services/*`.
- Services delegate to repository interfaces so mock repositories can later be replaced by Laravel REST implementations.
- Interactive features use client components only where needed: locale switching, cart persistence, search/filtering, item customization, and AR/3D controls.
- Menu content is stored with English and Arabic fields using `LocalizedString`.
- The active language is stored in `localStorage`; Arabic updates the document to `dir="rtl"`.
- Cart state is frontend-only, persists in `localStorage`, and is reset when a different table session is configured.
- 3D/AR architecture is feature-flagged and supports GLB/USDZ asset metadata without shipping heavy viewer libraries in the initial bundle.

## Replacing Mock Repositories With Laravel APIs

Keep UI components unchanged. Replace the repository implementations in:

- `repositories/menu-repository.ts`
- `repositories/session-repository.ts`
- `repositories/order-repository.ts`

The Laravel API should return data matching the interfaces in `types/domain.ts`. The service functions in `services/*` should remain stable for pages and components.

Suggested endpoints:

- `GET /api/restaurants/{slug}/tables/{tableCode}/menu`
- `GET /api/restaurants/{slug}/menu-items/{itemId}`
- `GET /api/table-sessions/{sessionId}/orders/latest`
- `POST /api/table-sessions/{sessionId}/orders`

## Adding a Restaurant

1. Add a `Restaurant`, `Branch`, `Table`, `Menu`, categories, and items in `data/mock-menu.ts`.
2. Give the restaurant a unique `slug`.
3. Add theme tokens for primary color, accent color, background, text, border radius, logo, and cover image.
4. Update `MockMenuRepository.getMenuPageData` to resolve the new slug.

## Adding a Menu Item

1. Add a `MenuItem` to `mockItems`.
2. Include English and Arabic name, descriptions, image alt text, ingredients, portion, variants, and modifier groups.
3. Assign an existing `categoryId`.
4. Set `available`, `featured`, dietary, spicy, allergen, preparation, calorie, `has3DModel`, and `hasAR` fields.

## Adding GLB and USDZ Models

1. Put web/Android GLB files and Apple USDZ files in `public/models/`, or return CDN URLs from the API.
2. Add a `threeDAsset` to the menu item:

```ts
threeDAsset: {
  id: "asset-example",
  glbUrl: "/models/example.glb",
  usdzUrl: "/models/example.usdz",
  posterImageUrl: "/models/example-poster.jpg",
  scaleHint: "plate-24cm",
}
```

3. Set `has3DModel` and `hasAR` to `true`.
4. Keep `restaurant.featureFlags.threeDEnabled` and `restaurant.featureFlags.arEnabled` enabled.

## Current Deferred Items

- No backend, authentication, staff dashboard, payment, or live order submission.
- 3D/AR controls are architecture-ready placeholders until real model assets and a viewer package are selected.
- PWA manifest is present; a production service worker strategy is intentionally deferred.
