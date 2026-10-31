import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public Supabase settings. The anon/publishable key is designed to be public and is
// protected by row-level security. Set them in Vercel as either
//   NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY, or
//   SUPABASE_URL + SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_KEY).
// Vercel keeps "secret" variables out of the build, so when the key isn't inlined the
// browser fetches it at runtime from /api/supabase-config (see getSupabase).

/** Reads a variable at runtime on the server; always undefined in the browser. */
function runtimeEnv(name: string): string | undefined {
  return typeof window === "undefined" ? process.env[name] : undefined;
}

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.FORE_SUPABASE_URL ||
  runtimeEnv("SUPABASE_URL") ||
  runtimeEnv("NEXT_PUBLIC_SUPABASE_URL") ||
  "";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.FORE_SUPABASE_KEY ||
  runtimeEnv("SUPABASE_ANON_KEY") ||
  runtimeEnv("SUPABASE_PUBLISHABLE_KEY") ||
  runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  "";

/** Ready immediately on the server, and in the browser when the key was inlined at build time. */
/** Never serve stale rows from Next.js's data cache: approvals and verification must show straight away. */
const noStore: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { global: { fetch: noStore } }) : null;

let pending: Promise<SupabaseClient | null> | null = null;

/** Use this in client code: falls back to loading the public settings from the site's own server. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (supabase) return Promise.resolve(supabase);
  if (typeof window === "undefined") return Promise.resolve(null);
  pending ??= fetch("/api/supabase-config")
    .then((r) => (r.ok ? r.json() : null))
    .then((c: { url?: string; key?: string } | null) => (c?.url && c?.key ? createClient(c.url, c.key) : null))
    .then((client) => {
      if (!client) pending = null;
      return client;
    })
    .catch(() => {
      pending = null;
      return null;
    });
  return pending;
}
