-- ============================================================
-- DOSEBASE: Multi-device state in profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS disclaimer_version smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS glide_serum_recents text[] NOT NULL DEFAULT '{}';

