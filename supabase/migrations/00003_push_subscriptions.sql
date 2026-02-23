-- ============================================================
-- DOSEBASE: Push subscription storage for Web Push notifications
-- ============================================================

CREATE TABLE push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth_key    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- One subscription per endpoint per user
  CONSTRAINT uq_user_endpoint UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subs_user_id ON push_subscriptions(user_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Server-side function: get all users with push enabled + due
-- protocols, along with their push subscriptions.
-- Called by the Edge Function cron (uses service_role key,
-- bypasses RLS).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_users_with_due_protocols(p_date date DEFAULT current_date)
RETURNS TABLE (
  user_id     uuid,
  endpoint    text,
  p256dh      text,
  auth_key    text,
  pending_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_compounds AS (
    SELECT c.id AS compound_id, c.user_id, c.frequency_type, c.frequency_days,
           c.frequency_specific_days, c.start_date
    FROM compounds c
    WHERE c.is_archived = false
  ),
  due_compounds AS (
    SELECT ac.compound_id, ac.user_id
    FROM active_compounds ac
    WHERE
      CASE
        WHEN ac.frequency_type = 'specific_days' THEN
          trim(to_char(p_date, 'Dy')) = ANY(ac.frequency_specific_days)
        WHEN ac.frequency_type = 'interval' AND ac.frequency_days IS NOT NULL THEN
          (p_date - ac.start_date) % ac.frequency_days = 0
        ELSE false
      END
  ),
  already_logged AS (
    SELECT il.compound_id, il.user_id
    FROM injection_logs il
    WHERE il.timestamp >= p_date::timestamptz
      AND il.timestamp < (p_date + interval '1 day')::timestamptz
  ),
  pending AS (
    SELECT dc.user_id, count(*) AS pending_count
    FROM due_compounds dc
    LEFT JOIN already_logged al
      ON al.compound_id = dc.compound_id AND al.user_id = dc.user_id
    WHERE al.compound_id IS NULL
    GROUP BY dc.user_id
    HAVING count(*) > 0
  )
  SELECT
    p.user_id,
    ps.endpoint,
    ps.p256dh,
    ps.auth_key,
    p.pending_count
  FROM pending p
  JOIN profiles pr ON pr.id = p.user_id AND pr.notify_push = true AND pr.notify_reminders = true
  JOIN push_subscriptions ps ON ps.user_id = p.user_id;
$$;
