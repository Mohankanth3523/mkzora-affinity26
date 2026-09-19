import type { Metadata } from "next";
import { RegistrationProvider } from "@/lib/registration/context";
import { RegistrationPass } from "@/components/success/RegistrationPass";

export const metadata: Metadata = {
  title: "Registration Pass (Demo) — AFFINITY '26",
};

/**
 * Phase 18. A Server Component shell only — so this route can export
 * `metadata` — wrapping the real client content in its own
 * `RegistrationProvider`. `/success` sits outside `/register/**`, so it
 * doesn't inherit `app/register/layout.tsx`'s provider; a second provider
 * instance here hydrates from the same `localStorage` key
 * (`lib/registration/storage.ts`) on mount, so the mock confirmation
 * still renders correctly regardless of which page created it.
 */
export default function SuccessPage() {
  return (
    <RegistrationProvider>
      <RegistrationPass />
    </RegistrationProvider>
  );
}
