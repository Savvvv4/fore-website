import { supabase } from '../lib/supabase';
import { LEGACY_PUBLIC_COLUMNS, PUBLIC_COLUMNS, rowToListing, type CoachListing, type CoachRow } from './shared';

/*
 * Only Teaching Pros are listed publicly. Performance coaches work with their own squads.
 * Until supabase/coach-directory.sql has been re-run, coach_type and the new columns don't
 * exist yet, so each query falls back to the original columns and lists everyone approved.
 */

/** Approved teaching pros, newest first. Row-level security only returns approved rows to visitors. */
export async function getApprovedCoaches(): Promise<{ coaches: CoachListing[]; ok: boolean }> {
  if (!supabase) return { coaches: [], ok: false };
  const current = await supabase
    .from('coach_profiles')
    .select(PUBLIC_COLUMNS)
    .eq('coach_type', 'teaching')
    .order('approved_at', { ascending: false, nullsFirst: false })
    .limit(500);
  let data: unknown = current.data;
  if (current.error) {
    const legacy = await supabase
      .from('coach_profiles')
      .select(LEGACY_PUBLIC_COLUMNS)
      .order('approved_at', { ascending: false, nullsFirst: false })
      .limit(500);
    if (legacy.error) {
      console.error('Loading coach directory failed', legacy.error);
      return { coaches: [], ok: false };
    }
    data = legacy.data;
  }
  return { coaches: ((data ?? []) as CoachRow[]).map(rowToListing), ok: true };
}

export async function getCoachBySlug(slug: string): Promise<CoachListing | null> {
  if (!supabase || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const current = await supabase.from('coach_profiles').select(PUBLIC_COLUMNS).eq('slug', slug).eq('coach_type', 'teaching').maybeSingle();
  let data: unknown = current.data;
  if (current.error) {
    const legacy = await supabase.from('coach_profiles').select(LEGACY_PUBLIC_COLUMNS).eq('slug', slug).maybeSingle();
    if (legacy.error) {
      console.error('Loading coach profile failed', legacy.error);
      return null;
    }
    data = legacy.data;
  }
  return data ? rowToListing(data as CoachRow) : null;
}
