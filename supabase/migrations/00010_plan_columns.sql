-- ============================================================
-- DOSEBASE: Add plan entitlement to profiles
-- ============================================================

CREATE TYPE plan_tier AS ENUM ('starter', 'pro');

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan plan_tier NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
