# `@dosebase/shared`

Shared, platform-agnostic domain code intended for both:
- the existing web app (React + Vite), and
- the upcoming React Native rewrite.

It currently contains pure functions and types copied from the web app:
- `types` (domain models)
- `date` helpers (`YYYY-MM-DD` date-only)
- `units` helpers
- `scheduler` helpers

No build tooling is wired up yet. Once the React Native app exists, we can:
- add a `tsconfig.json` for this package,
- decide on bundling (tsup/rollup) or Metro-compatible TS consumption,
- and optionally migrate the web app to import from this package.

