-- ============================================================
-- DOSEBASE: Allow updating push subscription rows
-- ============================================================
-- subscribeToPush() uses UPSERT which may perform UPDATE on conflict.
-- RLS therefore needs an UPDATE policy.

CREATE POLICY "Users can update own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

