-- ============================================================
-- DOSEBASE: Onboarding state (per-user)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_version smallint NOT NULL DEFAULT 1;

