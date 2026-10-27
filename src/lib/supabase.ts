import { createClient } from "@supabase/supabase-js";

// Public Supabase settings. The anon/publishable key is designed to be public and is
// protected by row-level security. They can be set in Vercel either as
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY, or as
// SUPABASE_URL / SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_KEY), which
// next.config.ts passes to the browser at build time. The second form lets the key
// be stored with Vercel's secret visibility.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.FORE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.FORE_SUPABASE_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
