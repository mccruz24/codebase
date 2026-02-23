<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dosebase

Privacy-first tracking for protocols (Peptides, Relaxants, Skin Boosters, Microneedling) backed by Supabase.

## Native App (Expo / React Native)

**Prerequisites:** Node.js, Expo CLI

1. Install dependencies:
   ```bash
   cd apps/native
   npm install
   ```
2. Create `apps/native/.env` with:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Run on iOS Simulator:
   ```bash
   npx expo start --ios
   ```

## Project Structure

```
dosebase/
  apps/native/          # Expo/React Native app (primary)
  packages/shared/      # Shared types and utilities
  supabase/             # Database schema and migrations
  docs/                 # Development documentation
  PRD-WEBAPP-REFERENCE.md  # Full web app feature reference for native development
```

## Reference

See `PRD-WEBAPP-REFERENCE.md` for the complete web app feature documentation used as reference for native development.
