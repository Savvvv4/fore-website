// Where a coach sign-up came from, saved in coach_profiles.heard_from.
// Remembered for the visit, so a coach who lands on /coaches from Instagram and then
// taps through to /coaches/join is still counted as Instagram.

const KEY = 'fore-coach-source';

function detect(): string | null {
  const q = new URLSearchParams(window.location.search);
  const tagged = q.get('utm_source') || q.get('ref');
  if (tagged) return tagged.trim().slice(0, 60) || null;

  const ua = navigator.userAgent || '';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn';

  if (document.referrer) {
    const host = new URL(document.referrer).hostname.replace(/^www\./, '');
    if (host && host !== window.location.hostname.replace(/^www\./, '')) return host.slice(0, 60);
  }
  return null;
}

/** Call on any coach page. Keeps the first source seen in this visit. */
export function rememberSource() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const s = detect();
    if (s) sessionStorage.setItem(KEY, s);
  } catch {}
}

export function getSource(): string | null {
  try {
    rememberSource();
    return sessionStorage.getItem(KEY);
  } catch {
    try { return detect(); } catch { return null; }
  }
}
