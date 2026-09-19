import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RegistrationProvider } from "@/lib/registration/context";
import { RegistrationPass } from "@/components/success/RegistrationPass";

export const metadata: Metadata = pageMetadata({
  title: "Registration Pass — AFFINITY '26",
  path: "/success/",
});

/**
 * Phase 18, revised Phase 41. A Server Component shell only — so this
 * route can export `metadata` — wrapping the real client content in its
 * own `RegistrationProvider`. `/success` sits outside `/register/**`, so
 * it doesn't inherit `app/register/layout.tsx`'s provider; a second
 * provider instance here hydrates from the same `localStorage` key
 * (`lib/registration/storage.ts`) on mount, so the confirmation still
 * renders correctly regardless of which page created it.
 */
export default function SuccessPage() {
  return (
    <RegistrationProvider>
      <RegistrationPass />
    </RegistrationProvider>
  );
}
