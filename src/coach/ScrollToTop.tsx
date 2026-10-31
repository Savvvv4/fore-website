'use client';

import { useEffect } from 'react';

/** Opens a page at the top, even when the link was clicked far down another page. */
export default function ScrollToTop() {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);
  return null;
}
