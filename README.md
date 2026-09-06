# scatterbrain

A personal site: portfolio, journal, calendar, a home for scattered thoughts
("brain"), and local event recommendations, in one sharply designed place.

Built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Structure

```
src/app/
  page.tsx        home
  portfolio/       projects and work
  journal/         entries
  calendar/        schedule and events
  brain/           notes and ideas
  events/          local event recommendations
src/components/    shared UI
src/lib/           shared logic
docs/PRD.md        product requirements
```

This is currently a skeleton — routes are stubbed placeholders pending the
PRD in `docs/PRD.md`.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
