# React Native (Expo Router) — Next Steps

This repo is migrating from a React web app to a React Native app using **Expo Router**.

## 0) Create the native app (must be an empty directory)

If `apps/native/` already exists, ensure it’s empty first.

Sanity check: `apps/native/package.json` should be an Expo app with scripts like `expo start` / `expo run:ios`, and `apps/native/app/` should exist.
If you see files like `_ctx.ios.js` and a huge `build/` folder, you created the **expo-router library/module**, not an app—delete it and recreate.

Note: a managed Expo app usually **does not** have an `ios/` folder (and therefore no `Podfile`) until you run `npx expo prebuild -p ios`.
If you see a one-time warning about `pod install` / “No Podfile found”, it’s safe to ignore unless you’re intentionally prebuilding.

From repo root (recommended):

```bash
# Includes Expo Router + TypeScript
npx create-expo-app@latest apps/native --template tabs
```

Alternative:

```bash
# Also includes Expo Router by default in recent Expo templates
npx create-expo-app@latest apps/native
```

## 1) Install required deps for Supabase + shared code (run inside `apps/native/`)

```bash
cd apps/native

# Supabase + RN polyfills/storage
npx expo install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage

# (Optional, recommended for session storage)
npx expo install expo-secure-store
```

## 2) Set environment variables

Expo supports `EXPO_PUBLIC_*` env vars.

Create `apps/native/.env` (do not commit) with:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3) Wire monorepo-style shared imports

The shared domain code lives in `packages/shared/src`.

After the native app exists, we’ll add:
- `apps/native/metro.config.js` with `watchFolders` pointing at `../../packages/shared`
- `apps/native/tsconfig.json` paths alias for `@dosebase/shared/*`

(I can do this wiring once the Expo project files exist in `apps/native/`.)

## 4) Start implementing screens

Suggested route groups:
- `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`
- `app/(onboarding)/index.tsx`
- `app/(tabs)/index.tsx` (Dashboard)
- `app/(tabs)/protocols.tsx`
- `app/(tabs)/log.tsx`
- `app/(tabs)/trends.tsx`
- `app/(tabs)/settings.tsx`

## 5) Keep the current web app working (for now)

The web app remains the reference implementation while you port screens.
Try to keep business logic in `packages/shared` so both apps stay consistent.
