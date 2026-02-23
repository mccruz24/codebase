-- ============================================================
-- DOSEBASE: Per-endpoint reminder de-dupe
-- ============================================================
-- Cron jobs may run multiple times per day; this lets the Edge Function
-- avoid spamming the same device repeatedly.

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS last_sent_on date;

