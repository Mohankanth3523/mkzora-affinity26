import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import { RegistrationProvider } from "@/lib/registration/context";

export const metadata: Metadata = pageMetadata({
  title: "Register — AFFINITY '26",
  path: "/register/",
});

/** Everything under /register shares one RegistrationProvider so wizard state survives step-to-step navigation. */
export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
