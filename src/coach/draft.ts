import type { CoachType } from './shared';

/** Sign-up drafts live in the browser, so a coach can start on a landing page and finish later. */
export const DRAFT_KEYS: Record<CoachType, string> = {
  teaching: 'foresports-coach-signup-teaching-v3',
  performance: 'foresports-coach-signup-performance-v1',
};

export const DEFAULT_PACKAGES = [
  { name: 'Trial lesson', price: '', detail: 'A first session to understand your game' },
  { name: 'Lesson pack', price: '', detail: 'A block of 4 coaching sessions' },
  { name: 'Monthly programme', price: '', detail: 'Ongoing coaching and progress tracking' },
];

type Draft = { form?: Record<string, unknown>; reached?: number };

export function readDraft(type: CoachType): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEYS[type]);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

/** Merges fields into the saved draft without touching anything else the coach has entered. */
export function seedDraft(type: CoachType, patch: Record<string, unknown>) {
  try {
    const d = readDraft(type);
    localStorage.setItem(DRAFT_KEYS[type], JSON.stringify({ form: { ...(d.form ?? {}), ...patch }, reached: d.reached ?? 0 }));
  } catch {}
}

/** "Aarav Sharma" → { first: 'Aarav', last: 'Sharma' } */
export function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
}
