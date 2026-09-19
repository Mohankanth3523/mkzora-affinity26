"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Phase 02 originally placed the registration success/pass screen here.
 * Phase 18 built the real experience at the top-level `/success` route
 * instead (`app/success/page.tsx` — see its own doc comment and
 * `docs/phase-18-success-page-notes.md` for why), so this path now just
 * redirects there rather than hosting a second, stale copy. Kept as a
 * redirect (not deleted) so any link/bookmark still pointing at
 * `/register/success` keeps working.
 *
 * Converted from server-side `redirect()` to client-side `router.replace()`
 * for compatibility with Next.js static export (`output: "export"`).
 */
export default function RegisterSuccessRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/success");
  }, [router]);
  return null;
}
