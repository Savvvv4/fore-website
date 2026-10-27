import { supabase } from '../lib/supabase';
import { PUBLIC_COLUMNS, rowToListing, type CoachListing, type CoachRow } from './shared';

/** Approved coaches, newest first. Row-level security only returns approved rows to visitors. */
export async function getApprovedCoaches(): Promise<{ coaches: CoachListing[]; ok: boolean }> {
  if (!supabase) return { coaches: [], ok: false };
  const { data, error } = await supabase
    .from('coach_profiles')
    .select(PUBLIC_COLUMNS)
    .order('approved_at', { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) {
    console.error('Loading coach directory failed', error);
    return { coaches: [], ok: false };
  }
  return { coaches: (data as unknown as CoachRow[]).map(rowToListing), ok: true };
}

export async function getCoachBySlug(slug: string): Promise<CoachListing | null> {
  if (!supabase || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const { data, error } = await supabase.from('coach_profiles').select(PUBLIC_COLUMNS).eq('slug', slug).maybeSingle();
  if (error) {
    console.error('Loading coach profile failed', error);
    return null;
  }
  return data ? rowToListing(data as unknown as CoachRow) : null;
}
