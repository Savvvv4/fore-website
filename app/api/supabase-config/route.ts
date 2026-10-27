// Serves the public Supabase URL and anon/publishable key to the browser at runtime.
// Needed because Vercel keeps "secret" environment variables out of the build.
// The anon key is public by design; row-level security protects the data.

export const dynamic = 'force-dynamic';

/** Refuses anything that would give visitors elevated access. */
function isPrivilegedKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload?.role !== 'anon';
  } catch {
    return true;
  }
}

export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!url || !key) return Response.json({ error: 'not_configured' }, { status: 503 });
  if (isPrivilegedKey(key)) {
    console.error('Supabase key in the environment is not an anon/publishable key; refusing to serve it.');
    return Response.json({ error: 'wrong_key_type' }, { status: 503 });
  }
  return Response.json({ url, key }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
