import { supabaseUrl } from '../lib/supabase';

export const SPECIALTIES = [
  'Driver & long game',
  'Iron play',
  'Short game',
  'Putting',
  'Bunker play',
  'Course management',
  'Mental game',
  'Fitness & mobility',
  'Beginners',
  'Junior golf',
  'Ladies golf',
  'Competition prep',
];
export const CERTIFICATIONS = ['PGA of India', 'PGTI', 'TPI certified', 'TrackMan certified', 'USGTF', 'PGA UK', 'Other qualification'];
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const FORMATS = ['In-person', 'Online video analysis', 'On-course playing lesson', 'Group clinics'];
export const PLAYING_LEVELS = [
  'Touring professional (current)',
  'Former touring professional',
  'Category 1 amateur (handicap 0–5)',
  'Club golfer (handicap 6+)',
];
export const HEARD_FROM = ['Another coach', 'My golf club', 'Instagram', 'WhatsApp group', 'ForeSports team reached out', 'Other'];
export const COACH_TYPES: Record<CoachType, string> = { teaching: 'Lessons', performance: 'Squads & academies' };
export const LANGUAGES = ['English', 'Hindi', 'Punjabi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Gujarati'];
export const TOOLS = ['TrackMan', 'FlightScope', 'GCQuad / Foresight', 'Uneekor', 'SAM PuttLab', 'Video analysis (V1, OnForm…)', 'Upgame', 'Arccos', 'Force plates', 'Spreadsheets & WhatsApp'];

/** Performance coaches */
export const PROGRAM_ROLES = ['Head coach', 'Academy director', 'Assistant coach', 'Independent performance coach', 'Coach to touring professionals'];
export const PLAYER_GROUPS = ['National-level juniors', 'Elite juniors (U-14 to U-18)', 'College-bound juniors', 'Top amateurs', 'Touring professionals', 'Development squad'];
export const DISCIPLINES = ['Swing', 'Short game', 'Putting', 'Fitness', 'Mental', 'Course strategy', 'Nutrition'];
export const PRIORITIES = ['Lesson notes & video', 'Practice plans & homework', 'Round stats & strokes gained', 'Swing comparisons', 'Squad overview', 'Event debriefs', 'Parent reports', 'Coordinating with other coaches'];

export type CoachType = 'teaching' | 'performance';
export const PHOTO_BUCKET = 'coach-photos';

export type CoachPackage = { name: string; price: number | null; detail: string };

/** What a golfer sees on a coach profile. Contact details are never part of it. */
export type CoachView = {
  firstName: string;
  lastName: string;
  city: string;
  venue: string;
  yearsCoaching: number | null;
  playingLevel: string;
  bio: string;
  photoUrl: string;
  specialties: string[];
  certifications: string[];
  packages: CoachPackage[];
  formats: string[];
  days: string[];
  startTime: string;
  endTime: string;
  verified: boolean;
  languages: string[];
  tools: string[];
  coachType: CoachType;
  programName: string;
  programRole: string;
  playerGroups: string[];
};

export type CoachListing = CoachView & { id: string; slug: string; foundingCoach: boolean };

/** Row shape of the publicly readable columns in coach_profiles. */
export type CoachRow = {
  id: string;
  slug: string;
  verified: boolean;
  founding_coach: boolean;
  first_name: string;
  last_name: string;
  city: string;
  venue: string | null;
  years_coaching: number | null;
  playing_level: string | null;
  bio: string | null;
  photo_path: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  packages: unknown;
  formats: string[] | null;
  days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  approved_at: string | null;
  languages?: string[] | null;
  tools?: string[] | null;
  coach_type?: string | null;
  program_name?: string | null;
  program_role?: string | null;
  player_groups?: string[] | null;
};

/** Columns readable before supabase/coach-directory.sql adds coach types. */
export const LEGACY_PUBLIC_COLUMNS =
  'id,slug,verified,founding_coach,first_name,last_name,city,venue,years_coaching,playing_level,bio,photo_path,specialties,certifications,packages,formats,days,start_time,end_time,approved_at';
export const PUBLIC_COLUMNS = `${LEGACY_PUBLIC_COLUMNS},languages,tools,coach_type,program_name,program_role,player_groups`;

export function photoUrl(path: string | null | undefined): string {
  if (!path || !supabaseUrl) return '';
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${PHOTO_BUCKET}/${encoded}`;
}

function toPackages(value: unknown): CoachPackage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map((p) => ({
      name: String(p.name ?? ''),
      price: typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null,
      detail: String(p.detail ?? ''),
    }))
    .filter((p) => p.name);
}

export function rowToListing(row: CoachRow): CoachListing {
  return {
    id: row.id,
    slug: row.slug,
    foundingCoach: row.founding_coach,
    verified: row.verified,
    firstName: row.first_name,
    lastName: row.last_name,
    city: row.city,
    venue: row.venue ?? '',
    yearsCoaching: row.years_coaching,
    playingLevel: row.playing_level ?? '',
    bio: row.bio ?? '',
    photoUrl: photoUrl(row.photo_path),
    specialties: row.specialties ?? [],
    certifications: row.certifications ?? [],
    packages: toPackages(row.packages),
    formats: row.formats ?? [],
    days: row.days ?? [],
    startTime: row.start_time ?? '',
    endTime: row.end_time ?? '',
    languages: row.languages ?? [],
    tools: row.tools ?? [],
    coachType: row.coach_type === 'performance' ? 'performance' : 'teaching',
    programName: row.program_name ?? '',
    programRole: row.program_role ?? '',
    playerGroups: row.player_groups ?? [],
  };
}

export function formatINR(n: number | null | undefined): string {
  if (n == null) return '';
  return '₹' + n.toLocaleString('en-IN');
}

/** "06:00" → "6:00 AM" */
export function formatTime(value: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || '');
  if (!m) return value || '';
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

export function initials(first: string, last: string): string {
  return ((first.trim()[0] || '') + (last.trim()[0] || '')).toUpperCase() || 'FS';
}

/** Rough measure of how complete a profile is, used to order the directory. */
export function completeness(c: CoachView): number {
  return (
    (c.photoUrl ? 3 : 0) +
    (c.bio.length > 120 ? 2 : c.bio ? 1 : 0) +
    (lowestPrice(c.packages) ? 2 : 0) +
    Math.min(c.certifications.length, 2) +
    (c.venue ? 1 : 0) +
    (c.languages.length ? 1 : 0)
  );
}

/** First credential worth showing next to a name, e.g. "PGA of India". */
export function headlineCredential(c: CoachView): string {
  return c.certifications[0] ?? '';
}

export function lowestPrice(packages: CoachPackage[]): number | null {
  const prices = packages.map((p) => p.price).filter((p): p is number => p != null && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

/** "Mon, Tue, Wed, Thu, Fri, Sat" → "Mon–Sat" when the days are consecutive. */
export function formatDays(days: string[]): string {
  const sorted = WEEKDAYS.filter((d) => days.includes(d));
  if (!sorted.length) return '';
  if (sorted.length === 7) return 'Every day';
  const idx = sorted.map((d) => WEEKDAYS.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return consecutive && sorted.length > 2 ? `${sorted[0]}–${sorted[sorted.length - 1]}` : sorted.join(', ');
}

/** The price to lead with on a card: the trial lesson if there is one, otherwise the lowest price. */
export function priceLine(c: { packages: CoachPackage[] }): { label: string; value: string } | null {
  const trial = c.packages.find((p) => /trial/i.test(p.name) && p.price);
  if (trial) return { label: 'Trial lesson', value: formatINR(trial.price) };
  const from = lowestPrice(c.packages);
  return from ? { label: 'Lessons from', value: formatINR(from) } : null;
}
