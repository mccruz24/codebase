-- ============================================================
-- DOSEBASE: Demo data seeding helper (per-user)
-- ============================================================

-- Creates demo compounds/logs/check-ins for the currently authenticated user.
-- Safe-by-default: no-op if the user already has any compounds unless `p_force` is true.

CREATE OR REPLACE FUNCTION public.seed_demo_data(p_days integer DEFAULT 14, p_force boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_days integer := GREATEST(1, LEAST(COALESCE(p_days, 14), 60));
  v_has_data boolean;

  v_peptide_id uuid := gen_random_uuid();
  v_relaxant_id uuid := gen_random_uuid();
  v_booster_id uuid := gen_random_uuid();
  v_microneedling_id uuid := gen_random_uuid();

  v_compounds_inserted integer := 0;
  v_injections_inserted integer := 0;
  v_checkins_inserted integer := 0;

  i integer;
  v_date date;
  v_weight numeric(6,2);
  v_mood_base integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only allow demo seeding for the test account
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'test@test.com' THEN
    RAISE EXCEPTION 'Demo seeding is only available for the test account (test@test.com)';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.compounds c WHERE c.user_id = v_user_id LIMIT 1) INTO v_has_data;

  IF v_has_data AND NOT p_force THEN
    RETURN jsonb_build_object('compounds', 0, 'injections', 0, 'checkins', 0, 'skipped', true);
  END IF;

  IF p_force THEN
    DELETE FROM public.injection_logs WHERE user_id = v_user_id;
    DELETE FROM public.aesthetic_checkins WHERE user_id = v_user_id;
    DELETE FROM public.compounds WHERE user_id = v_user_id;
  END IF;

  -- Compounds
  INSERT INTO public.compounds (
    id, user_id, name, category, sub_category, target_area, dose_unit, dose_amount,
    frequency_type, frequency_days, frequency_specific_days, start_date, is_archived, color
  ) VALUES
    (
      v_peptide_id, v_user_id, 'BPC-157', 'peptide', 'Recovery', ARRAY['abdomen'],
      'mcg', 250, 'interval', 2, ARRAY[]::text[], (current_date - (v_days::int)), false, 'bg-indigo-500'
    ),
    (
      v_relaxant_id, v_user_id, 'Botulinum Toxin Type A', 'relaxant', 'Neurotoxin', ARRAY['forehead'],
      'IU', 20, 'interval', 90, ARRAY[]::text[], (current_date - (v_days::int)), false, 'bg-rose-500'
    ),
    (
      v_booster_id, v_user_id, 'PDRN Skin Booster', 'booster', 'Mesotherapy', ARRAY['face'],
      'ml', 2, 'interval', 7, ARRAY[]::text[], (current_date - (v_days::int)), false, 'bg-emerald-500'
    ),
    (
      v_microneedling_id, v_user_id, 'Microneedling (Face)', 'microneedling', 'Dermal', ARRAY['face'],
      'mm', 1.0, 'interval', 14, ARRAY[]::text[], (current_date - (v_days::int)), false, 'bg-amber-500'
    );

  GET DIAGNOSTICS v_compounds_inserted = ROW_COUNT;

  -- Injection logs (a small but realistic spread)
  FOR i IN 0..(v_days - 1) LOOP
    IF (i % 2) = 0 THEN
      INSERT INTO public.injection_logs (user_id, compound_id, timestamp, dose, notes, site)
      VALUES (
        v_user_id,
        v_peptide_id,
        (now() - make_interval(days => i)),
        250,
        CASE WHEN i = 0 THEN 'Baseline dose.' WHEN i = 2 THEN 'Felt less soreness.' ELSE NULL END,
        'abdomen'
      );
      v_injections_inserted := v_injections_inserted + 1;
    END IF;

    IF i IN (0, 7) THEN
      INSERT INTO public.injection_logs (user_id, compound_id, timestamp, dose, notes, site)
      VALUES (
        v_user_id,
        v_booster_id,
        (now() - make_interval(days => i, hours => 2)),
        2,
        CASE WHEN i = 0 THEN 'Hydration-focused session.' ELSE 'Maintenance session.' END,
        'face'
      );
      v_injections_inserted := v_injections_inserted + 1;
    END IF;

    IF i = 5 THEN
      INSERT INTO public.injection_logs (
        user_id, compound_id, timestamp, dose, notes, site, needle_depth, glide_serum
      ) VALUES (
        v_user_id,
        v_microneedling_id,
        (now() - make_interval(days => i, hours => 3)),
        1.0,
        'Short session; focused on cheeks + forehead.',
        'face',
        0.75,
        'Hyaluronic acid serum'
      );
      v_injections_inserted := v_injections_inserted + 1;
    END IF;
  END LOOP;

  -- Aesthetic check-ins (daily)
  FOR i IN 0..(v_days - 1) LOOP
    v_date := current_date - i;
    v_weight := ROUND((170 + ((random() - 0.5) * 2))::numeric, 2);
    v_mood_base := 5 + (CASE WHEN i < 4 THEN 1 ELSE 0 END);

    INSERT INTO public.aesthetic_checkins (
      user_id, date, weight, notes,
      muscle_fullness, skin_clarity, skin_texture, facial_fullness,
      jawline_definition, inflammation, energy, sleep_quality, libido
    ) VALUES (
      v_user_id,
      v_date,
      v_weight,
      CASE WHEN i = 0 THEN 'Weekly summary: steady improvements.' ELSE NULL END,
      LEAST(10, GREATEST(1, v_mood_base + (i % 3) - 1)),
      LEAST(10, GREATEST(1, v_mood_base + ((i + 1) % 3) - 1)),
      LEAST(10, GREATEST(1, v_mood_base + ((i + 2) % 3) - 1)),
      LEAST(10, GREATEST(1, v_mood_base + (i % 2))),
      LEAST(10, GREATEST(1, v_mood_base + ((i + 1) % 2))),
      LEAST(10, GREATEST(1, 6 - (i % 3))),
      LEAST(10, GREATEST(1, v_mood_base + ((i + 2) % 2))),
      LEAST(10, GREATEST(1, v_mood_base + (i % 2))),
      LEAST(10, GREATEST(1, v_mood_base + ((i + 1) % 2)))
    )
    ON CONFLICT (user_id, date) DO NOTHING;

    IF FOUND THEN
      v_checkins_inserted := v_checkins_inserted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'compounds', v_compounds_inserted,
    'injections', v_injections_inserted,
    'checkins', v_checkins_inserted,
    'skipped', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_demo_data(integer, boolean) TO authenticated;

