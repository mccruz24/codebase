-- ============================================================
-- DOSEBASE: Allow inserting own profile row (robustness)
-- ============================================================
-- handle_new_user() trigger should create a profile automatically on signup.
-- This policy supports rare recovery scenarios where the profile row is missing.

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

