-- ============================================================
-- DOSEBASE: Initial Schema Migration
-- ============================================================

-- ============================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================

CREATE TYPE compound_category AS ENUM ('peptide', 'relaxant', 'booster', 'microneedling');
CREATE TYPE frequency_type AS ENUM ('interval', 'specific_days');
CREATE TYPE unit_system AS ENUM ('metric', 'imperial');
CREATE TYPE app_theme AS ENUM ('light', 'dark', 'system');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Profiles (1:1 with auth.users, stores app settings)
CREATE TABLE profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  units            unit_system   NOT NULL DEFAULT 'imperial',
  theme            app_theme     NOT NULL DEFAULT 'system',
  notify_push      boolean       NOT NULL DEFAULT true,
  notify_reminders boolean       NOT NULL DEFAULT true,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

-- Compounds (treatment protocols)
CREATE TABLE compounds (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text NOT NULL CHECK (char_length(name) > 0),
  category                compound_category NOT NULL,
  sub_category            text,
  target_area             text[]         DEFAULT '{}',
  dose_unit               text NOT NULL CHECK (dose_unit IN ('mg', 'IU', 'ml', 'mm', 'mcg')),
  dose_amount             numeric(10, 4),
  frequency_type          frequency_type,
  frequency_days          integer CHECK (frequency_days > 0),
  frequency_specific_days text[]         DEFAULT '{}',
  start_date              date NOT NULL,
  is_archived             boolean        NOT NULL DEFAULT false,
  color                   text           NOT NULL DEFAULT 'bg-indigo-500',
  peptide_amount          numeric(10, 4),
  dilution_amount         numeric(10, 4),
  concentration           numeric(10, 4),
  created_at              timestamptz    NOT NULL DEFAULT now(),
  updated_at              timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT chk_interval_has_days
    CHECK (frequency_type != 'interval' OR frequency_days IS NOT NULL),
  CONSTRAINT chk_specific_has_days
    CHECK (frequency_type != 'specific_days' OR array_length(frequency_specific_days, 1) > 0),
  CONSTRAINT chk_dilution_positive
    CHECK (dilution_amount IS NULL OR dilution_amount > 0)
);

-- Injection logs (individual dose/treatment entries)
CREATE TABLE injection_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compound_id   uuid NOT NULL REFERENCES compounds(id) ON DELETE CASCADE,
  timestamp     timestamptz NOT NULL DEFAULT now(),
  dose          numeric(10, 4) NOT NULL DEFAULT 0,
  notes         text,
  site          text,
  photo_url     text,
  needle_depth  numeric(5, 2),
  glide_serum   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Aesthetic check-ins (daily subjective metrics)
CREATE TABLE aesthetic_checkins (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  weight                numeric(6, 2),
  notes                 text,
  muscle_fullness       smallint NOT NULL CHECK (muscle_fullness BETWEEN 1 AND 10),
  skin_clarity          smallint NOT NULL CHECK (skin_clarity BETWEEN 1 AND 10),
  skin_texture          smallint NOT NULL CHECK (skin_texture BETWEEN 1 AND 10),
  facial_fullness       smallint NOT NULL CHECK (facial_fullness BETWEEN 1 AND 10),
  jawline_definition    smallint NOT NULL CHECK (jawline_definition BETWEEN 1 AND 10),
  inflammation          smallint NOT NULL CHECK (inflammation BETWEEN 1 AND 10),
  energy                smallint NOT NULL CHECK (energy BETWEEN 1 AND 10),
  sleep_quality         smallint NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  libido                smallint NOT NULL CHECK (libido BETWEEN 1 AND 10),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_user_date UNIQUE (user_id, date)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_compounds_user_id ON compounds(user_id);
CREATE INDEX idx_compounds_user_active ON compounds(user_id) WHERE NOT is_archived;
CREATE INDEX idx_compounds_user_category ON compounds(user_id, category);

CREATE INDEX idx_injection_logs_user_id ON injection_logs(user_id);
CREATE INDEX idx_injection_logs_compound_id ON injection_logs(compound_id);
CREATE INDEX idx_injection_logs_user_timestamp ON injection_logs(user_id, timestamp DESC);
CREATE INDEX idx_injection_logs_compound_timestamp ON injection_logs(compound_id, timestamp DESC);

CREATE INDEX idx_checkins_user_id ON aesthetic_checkins(user_id);
CREATE INDEX idx_checkins_user_date ON aesthetic_checkins(user_id, date DESC);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE injection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_checkins ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Compounds
CREATE POLICY "Users can view own compounds"
  ON compounds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compounds"
  ON compounds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compounds"
  ON compounds FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own compounds"
  ON compounds FOR DELETE
  USING (auth.uid() = user_id);

-- Injection logs
CREATE POLICY "Users can view own injection logs"
  ON injection_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own injection logs"
  ON injection_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own injection logs"
  ON injection_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own injection logs"
  ON injection_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Aesthetic check-ins
CREATE POLICY "Users can view own checkins"
  ON aesthetic_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON aesthetic_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON aesthetic_checkins FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON aesthetic_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON compounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON injection_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON aesthetic_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-calculate concentration from peptide_amount / dilution_amount
CREATE OR REPLACE FUNCTION public.calculate_concentration()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.peptide_amount IS NOT NULL AND NEW.dilution_amount IS NOT NULL AND NEW.dilution_amount > 0 THEN
    NEW.concentration = NEW.peptide_amount / NEW.dilution_amount;
  ELSE
    NEW.concentration = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_concentration
  BEFORE INSERT OR UPDATE ON compounds
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_concentration();

-- ============================================================
-- 6. STORAGE BUCKET (injection photos)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'injection-photos',
  'injection-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'injection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'injection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'injection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 7. UTILITY FUNCTIONS
-- ============================================================

-- Get injection logs for a specific date (used by Dashboard/Calendar)
CREATE OR REPLACE FUNCTION public.get_logs_on_date(target_date date)
RETURNS SETOF injection_logs
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT *
  FROM injection_logs
  WHERE user_id = auth.uid()
    AND timestamp >= target_date::timestamptz
    AND timestamp < (target_date + interval '1 day')::timestamptz
  ORDER BY timestamp DESC;
$$;

-- Get most recent log per compound (used by scheduler)
CREATE OR REPLACE FUNCTION public.get_latest_log_per_compound()
RETURNS TABLE (
  compound_id uuid,
  last_timestamp timestamptz,
  last_dose numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT DISTINCT ON (compound_id)
    compound_id,
    timestamp AS last_timestamp,
    dose AS last_dose
  FROM injection_logs
  WHERE user_id = auth.uid()
  ORDER BY compound_id, timestamp DESC;
$$;
