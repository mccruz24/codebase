import type { Profile } from '@/contexts/ProfileContext';
import { supabase } from '@/lib/supabase';

const PROFILE_SELECT =
  'id, units, theme, notify_push, notify_reminders, onboarding_completed, onboarding_version, disclaimer_version, disclaimer_accepted_at, glide_serum_recents, plan, plan_expires_at';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

export async function getProfile(userId: string): Promise<Profile> {
  const client = requireSupabase();
  const { data, error, status } = await client.from('profiles').select(PROFILE_SELECT).eq('id', userId).single();

  if (data) return data as Profile;

  // If the profile doesn't exist yet (or was deleted), create a default one.
  // Supabase returns 406 for "No rows" on .single().
  if (status === 406) {
    const created = await client.from('profiles').insert({ id: userId }).select(PROFILE_SELECT).single();
    if (created.error) throw created.error;
    return created.data as Profile;
  }

  if (error) throw error;
  throw new Error('Failed to load profile');
}

export async function updateProfile(userId: string, patch: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
  const client = requireSupabase();
  const { data, error } = await client.from('profiles').update(patch).eq('id', userId).select(PROFILE_SELECT).single();
  if (error) throw error;
  return data as Profile;
}

