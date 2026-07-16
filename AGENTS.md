# AGENTS.md

## Project Goals

Build a mobile-first customer web menu for restaurant table QR codes. The current phase is frontend-only and must preserve restaurant slug and table code through all customer routes.

## Architecture Rules

- Use Next.js App Router and TypeScript strict mode.
- Pages call `services/*`; components must not import mock data directly.
- Services call repositories; repositories are the replacement point for Laravel REST APIs.
- Keep React Server Components as the default and use client components only for interactivity.
- Do not add backend, authentication, online payment, or native mobile code in this phase.
- Do not introduce unnecessary dependencies.

## Design Rules

- Mobile-first, optimized around 390 x 844 screens.
- Use warm off-white background, dark readable text, one restrained warm accent, generous spacing, rounded professional cards, subtle borders, and high-quality food imagery.
- Restaurant branding belongs in centralized theme tokens: color, background, typography, spacing, radius, logo, and cover image.
- Keep desktop wider but do not weaken the mobile app-like experience.
- Use accessible buttons, labels, semantic landmarks, visible focus, and minimum practical touch targets.

## Localization Rules

- Support English and Arabic.
- Menu content must use English and Arabic fields.
- Presentation components should read user-facing labels from `lib/i18n.ts` or receive localized content as props.
- Arabic must set document `lang="ar"` and `dir="rtl"`.
- Keep the lightweight dictionary replaceable by a future localization library.

## Testing Requirements

Before completing future changes, run:

```bash
npm run lint
npm run typecheck
npm run build
```

For visual/frontend changes, also start the dev server and verify the demo route in a browser:

```bash
npm run dev
```

Verify at 360 px, 390 px, 430 px, tablet, and desktop widths when layout behavior changes.

## Current Commands

- Install: `npm install`
- Develop: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Production build: `npm run build`
- Serve production build: `npm start`

## Out of Scope For Current Phase

- Real backend integration.
- Staff dashboard.
- Authentication.
- Online payment.
- Native Android or iOS app.
- Real-time order status.
- Real 3D model viewer dependency.
- Production service worker caching strategy.
