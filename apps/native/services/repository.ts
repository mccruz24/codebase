import { toDateOnly, type AestheticCheckIn, type Compound, type InjectionLog } from '@dosebase/shared';
import { supabase } from '@/lib/supabase';

type DbRow = Record<string, unknown>;

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}

async function requireUserId() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

function mapCompound(row: DbRow): Compound {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Compound['category'],
    subCategory: (row.sub_category as string | null) ?? undefined,
    targetArea: (row.target_area as string[] | null) ?? undefined,
    doseUnit: row.dose_unit as string,
    doseAmount: (row.dose_amount as number | null) ?? undefined,
    frequencyType: (row.frequency_type as Compound['frequencyType'] | null) ?? undefined,
    frequencyDays: (row.frequency_days as number | null) ?? undefined,
    frequencySpecificDays: (row.frequency_specific_days as string[] | null) ?? undefined,
    startDate: row.start_date as string,
    isArchived: row.is_archived as boolean,
    color: row.color as string,
    peptideAmount: (row.peptide_amount as number | null) ?? undefined,
    dilutionAmount: (row.dilution_amount as number | null) ?? undefined,
    concentration: (row.concentration as number | null) ?? undefined,
  };
}

function mapInjectionLog(row: DbRow): InjectionLog {
  const photo = (row.photo_url as string | null) ?? undefined;
  return {
    id: row.id as string,
    compoundId: row.compound_id as string,
    timestamp: row.timestamp as string,
    dose: Number((row.dose as number | string | null) ?? 0),
    notes: (row.notes as string | null) ?? undefined,
    site: (row.site as string | null) ?? undefined,
    photo,
    photoPath: photo,
    needleDepth: (row.needle_depth as number | null) ?? undefined,
    glideSerum: (row.glide_serum as string | null) ?? undefined,
  };
}

function mapCheckIn(row: DbRow): AestheticCheckIn {
  return {
    id: row.id as string,
    date: row.date as string,
    weight: (row.weight as number | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    metrics: {
      muscleFullness: row.muscle_fullness as number,
      skinClarity: row.skin_clarity as number,
      skinTexture: row.skin_texture as number,
      facialFullness: row.facial_fullness as number,
      jawlineDefinition: row.jawline_definition as number,
      inflammation: row.inflammation as number,
      energy: row.energy as number,
      sleepQuality: row.sleep_quality as number,
      libido: row.libido as number,
    },
  };
}

export async function listCompounds(opts?: { includeArchived?: boolean }) {
  const includeArchived = opts?.includeArchived ?? true;
  const client = requireSupabase();
  const query = client.from('compounds').select('*').order('created_at', { ascending: false });
  const { data, error } = includeArchived ? await query : await query.eq('is_archived', false);
  if (error) throw error;
  return (data ?? []).map(mapCompound);
}

export async function getCompoundById(id: string) {
  const client = requireSupabase();
  const { data, error } = await client.from('compounds').select('*').eq('id', id).single();
  if (error) throw error;
  return mapCompound(data as DbRow);
}

export async function upsertCompound(compound: Partial<Compound> & { name: string }) {
  const client = requireSupabase();
  const userId = await requireUserId();
  const payload = {
    ...(compound.id ? { id: compound.id } : {}),
    user_id: userId,
    name: compound.name,
    category: compound.category ?? 'peptide',
    sub_category: compound.subCategory ?? null,
    target_area: compound.targetArea ?? null,
    dose_unit: compound.doseUnit ?? 'mg',
    dose_amount: compound.doseAmount ?? null,
    frequency_type: compound.frequencyType ?? null,
    frequency_days: compound.frequencyDays ?? null,
    frequency_specific_days: compound.frequencySpecificDays ?? null,
    start_date: compound.startDate ?? toDateOnly(new Date()),
    is_archived: compound.isArchived ?? false,
    color: compound.color ?? 'bg-indigo-500',
    peptide_amount: compound.peptideAmount ?? null,
    dilution_amount: compound.dilutionAmount ?? null,
    concentration: compound.concentration ?? null,
  };
  const { data, error } = await client.from('compounds').upsert(payload).select('*').single();
  if (error) throw error;
  return mapCompound(data as DbRow);
}

export async function deleteCompoundById(id: string) {
  const client = requireSupabase();
  const { error } = await client.from('compounds').delete().eq('id', id);
  if (error) throw error;
}

export async function listInjectionLogs(opts?: { limit?: number }) {
  const limit = opts?.limit ?? 500;
  const client = requireSupabase();
  const { data, error } = await client
    .from('injection_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapInjectionLog);
}

export async function getLatestInjectionForCompound(compoundId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('injection_logs')
    .select('*')
    .eq('compound_id', compoundId)
    .order('timestamp', { ascending: false })
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  return row ? mapInjectionLog(row as DbRow) : null;
}

export async function getInjectionLogById(id: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('injection_logs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapInjectionLog(data as DbRow);
}

export async function insertInjectionLog(
  log: Omit<InjectionLog, 'id'>
) {
  const client = requireSupabase();
  const userId = await requireUserId();
  const payload = {
    user_id: userId,
    compound_id: log.compoundId,
    timestamp: log.timestamp,
    dose: log.dose,
    notes: log.notes ?? null,
    site: log.site ?? null,
    photo_url: log.photoPath ?? null,
    needle_depth: log.needleDepth ?? null,
    glide_serum: log.glideSerum ?? null,
  };
  const { data, error } = await client
    .from('injection_logs')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return mapInjectionLog(data as DbRow);
}

export async function updateInjectionLog(
  id: string,
  patch: Partial<Omit<InjectionLog, 'id'>>
) {
  const client = requireSupabase();
  const payload: Record<string, unknown> = {};
  if (patch.compoundId !== undefined) payload.compound_id = patch.compoundId;
  if (patch.timestamp !== undefined) payload.timestamp = patch.timestamp;
  if (patch.dose !== undefined) payload.dose = patch.dose;
  if (patch.notes !== undefined) payload.notes = patch.notes ?? null;
  if (patch.site !== undefined) payload.site = patch.site ?? null;
  if (patch.photoPath !== undefined) payload.photo_url = patch.photoPath ?? null;
  if (patch.needleDepth !== undefined) payload.needle_depth = patch.needleDepth ?? null;
  if (patch.glideSerum !== undefined) payload.glide_serum = patch.glideSerum ?? null;
  const { data, error } = await client
    .from('injection_logs')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapInjectionLog(data as DbRow);
}

export async function deleteInjectionLog(id: string) {
  const client = requireSupabase();
  const { error } = await client.from('injection_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function getCheckInByDate(date: string) {
  const client = requireSupabase();
  const { data, error, status } = await client
    .from('aesthetic_checkins')
    .select('*')
    .eq('date', date)
    .single();
  if (data) return mapCheckIn(data as DbRow);
  if (status === 406) return null;
  if (error) throw error;
  return null;
}

export async function deleteCheckInByDate(date: string) {
  const client = requireSupabase();
  const userId = await requireUserId();
  const { error } = await client
    .from('aesthetic_checkins')
    .delete()
    .eq('date', date)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function listCheckIns(opts?: { limit?: number }) {
  const limit = opts?.limit ?? 365;
  const client = requireSupabase();
  const { data, error } = await client
    .from('aesthetic_checkins')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapCheckIn);
}

export async function upsertCheckIn(checkIn: Omit<AestheticCheckIn, 'id'>) {
  const client = requireSupabase();
  const userId = await requireUserId();
  const payload = {
    user_id: userId,
    date: checkIn.date,
    weight: checkIn.weight ?? null,
    notes: checkIn.notes ?? null,
    muscle_fullness: checkIn.metrics.muscleFullness,
    skin_clarity: checkIn.metrics.skinClarity,
    skin_texture: checkIn.metrics.skinTexture,
    facial_fullness: checkIn.metrics.facialFullness,
    jawline_definition: checkIn.metrics.jawlineDefinition,
    inflammation: checkIn.metrics.inflammation,
    energy: checkIn.metrics.energy,
    sleep_quality: checkIn.metrics.sleepQuality,
    libido: checkIn.metrics.libido,
  };
  const { error } = await client
    .from('aesthetic_checkins')
    .upsert(payload, { onConflict: 'user_id,date' });
  if (error) throw error;
}

export async function upsertInjectionLog(
  log: Partial<InjectionLog> & { compoundId: string; timestamp: string; dose: number }
) {
  const client = requireSupabase();
  const userId = await requireUserId();
  const payload = {
    ...(log.id ? { id: log.id } : {}),
    user_id: userId,
    compound_id: log.compoundId,
    timestamp: log.timestamp,
    dose: log.dose,
    notes: log.notes ?? null,
    site: log.site ?? null,
    photo_url: log.photoPath ?? null,
    needle_depth: log.needleDepth ?? null,
    glide_serum: log.glideSerum ?? null,
  };
  const { error } = await client.from('injection_logs').upsert(payload);
  if (error) throw error;
}

// ── Data management ────────────────────────────────────────────────

export async function exportUserData() {
  const client = requireSupabase();
  const userId = await requireUserId();
  const [compounds, injections, checkIns, profile] = await Promise.all([
    listCompounds({ includeArchived: true }),
    listInjectionLogs({ limit: 5000 }),
    listCheckIns({ limit: 5000 }),
    client
      .from('profiles')
      .select('units, theme, notify_push, notify_reminders')
      .eq('id', userId)
      .single(),
  ]);

  const profileData = profile.data as {
    units: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
    notify_push: boolean;
    notify_reminders: boolean;
  } | null;

  return JSON.stringify(
    {
      compounds,
      injections,
      checkIns,
      settings: profileData
        ? {
            units: profileData.units,
            theme: profileData.theme,
            notifications: {
              push: profileData.notify_push,
              reminders: profileData.notify_reminders,
            },
          }
        : undefined,
      exportDate: new Date().toISOString(),
    },
    null,
    2
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function importUserData(jsonText: string) {
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  const compoundsRaw = (parsed.compounds as unknown[]) ?? [];
  const injectionsRaw = (parsed.injections as unknown[]) ?? [];
  const checkInsRaw = (parsed.checkIns as unknown[]) ?? [];
  const settingsRaw = (parsed.settings as Record<string, unknown> | undefined) ?? undefined;

  const compoundIdMap = new Map<string, string>();
  let compoundsImported = 0;
  let injectionsImported = 0;
  let checkInsImported = 0;

  // 1) Compounds
  for (const item of compoundsRaw) {
    const c = item as Record<string, unknown>;
    if (typeof c.name !== 'string' || c.name.trim() === '') continue;
    const incomingId = typeof c.id === 'string' ? c.id : undefined;
    const id = incomingId && isUuid(incomingId) ? incomingId : undefined;
    if (incomingId) compoundIdMap.set(incomingId, id ?? incomingId);

    await upsertCompound({
      ...(id ? { id } : {}),
      name: c.name as string,
      category: (c.category as Compound['category']) ?? 'peptide',
      subCategory: (c.subCategory as string | undefined) ?? undefined,
      targetArea: (c.targetArea as string[] | undefined) ?? undefined,
      doseUnit: (c.doseUnit as string | undefined) ?? 'mg',
      doseAmount: (c.doseAmount as number | undefined) ?? undefined,
      frequencyType: (c.frequencyType as Compound['frequencyType'] | undefined) ?? undefined,
      frequencyDays: (c.frequencyDays as number | undefined) ?? undefined,
      frequencySpecificDays: (c.frequencySpecificDays as string[] | undefined) ?? undefined,
      startDate:
        typeof c.startDate === 'string' && c.startDate.length >= 10
          ? c.startDate.slice(0, 10)
          : toDateOnly(new Date()),
      isArchived: Boolean(c.isArchived),
      color: (c.color as string | undefined) ?? 'bg-indigo-500',
      peptideAmount: (c.peptideAmount as number | undefined) ?? undefined,
      dilutionAmount: (c.dilutionAmount as number | undefined) ?? undefined,
      concentration: (c.concentration as number | undefined) ?? undefined,
    });
    compoundsImported++;
  }

  // 2) Check-ins (upsert by date)
  for (const item of checkInsRaw) {
    const ci = item as Record<string, unknown>;
    if (typeof ci.date !== 'string' || ci.date.length < 10) continue;
    const metrics = (ci.metrics as Record<string, unknown>) ?? {};

    await upsertCheckIn({
      date: ci.date.slice(0, 10),
      weight: typeof ci.weight === 'number' ? ci.weight : undefined,
      notes: typeof ci.notes === 'string' ? ci.notes : undefined,
      metrics: {
        muscleFullness: Number(metrics.muscleFullness ?? 5),
        skinClarity: Number(metrics.skinClarity ?? 5),
        skinTexture: Number(metrics.skinTexture ?? 5),
        facialFullness: Number(metrics.facialFullness ?? 5),
        jawlineDefinition: Number(metrics.jawlineDefinition ?? 5),
        inflammation: Number(metrics.inflammation ?? 5),
        energy: Number(metrics.energy ?? 5),
        sleepQuality: Number(metrics.sleepQuality ?? 5),
        libido: Number(metrics.libido ?? 5),
      },
    });
    checkInsImported++;
  }

  // 3) Injection logs
  for (const item of injectionsRaw) {
    const l = item as Record<string, unknown>;
    const compoundIdIncoming = typeof l.compoundId === 'string' ? l.compoundId : '';
    const compoundId = compoundIdMap.get(compoundIdIncoming) ?? compoundIdIncoming;
    if (!compoundId) continue;
    if (typeof l.timestamp !== 'string' || !l.timestamp) continue;

    await upsertInjectionLog({
      ...(typeof l.id === 'string' ? { id: l.id } : {}),
      compoundId,
      timestamp: l.timestamp as string,
      dose: Number(l.dose ?? 0),
      notes: typeof l.notes === 'string' ? l.notes : undefined,
      site: typeof l.site === 'string' ? l.site : undefined,
      needleDepth: typeof l.needleDepth === 'number' ? l.needleDepth : undefined,
      glideSerum: typeof l.glideSerum === 'string' ? l.glideSerum : undefined,
    });
    injectionsImported++;
  }

  // 4) Settings (optional)
  if (settingsRaw) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const patch: Record<string, unknown> = {};
    if (settingsRaw.units === 'metric' || settingsRaw.units === 'imperial') patch.units = settingsRaw.units;
    if (settingsRaw.theme === 'light' || settingsRaw.theme === 'dark' || settingsRaw.theme === 'system')
      patch.theme = settingsRaw.theme;
    const notifications = settingsRaw.notifications as Record<string, unknown> | undefined;
    if (notifications) {
      if (typeof notifications.push === 'boolean') patch.notify_push = notifications.push;
      if (typeof notifications.reminders === 'boolean') patch.notify_reminders = notifications.reminders;
    }
    if (Object.keys(patch).length > 0) {
      await client.from('profiles').update(patch).eq('id', userId);
    }
  }

  return { compoundsImported, injectionsImported, checkInsImported };
}

export async function clearUserData() {
  const client = requireSupabase();
  const userId = await requireUserId();

  await Promise.all([
    client.from('injection_logs').delete().eq('user_id', userId),
    client.from('aesthetic_checkins').delete().eq('user_id', userId),
    client.from('compounds').delete().eq('user_id', userId),
  ]).then((results) => {
    const err = results.find((r) => r.error)?.error;
    if (err) throw err;
  });
}

export type SeedDemoDataResult =
  | { compounds: number; injections: number; checkins: number; skipped: false }
  | { compounds: 0; injections: 0; checkins: 0; skipped: true };

export async function seedDemoData(opts?: { days?: number; force?: boolean }) {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  const email = (authData.user?.email ?? '').toLowerCase();
  if (email !== 'test@test.com') {
    throw new Error('Demo seeding is only available for the test account (test@test.com)');
  }

  const days = opts?.days ?? 14;
  const force = opts?.force ?? false;
  const { data, error } = await client.rpc('seed_demo_data', { p_days: days, p_force: force });
  if (error) throw error;
  return data as SeedDemoDataResult;
}
