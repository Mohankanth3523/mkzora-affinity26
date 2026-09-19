import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { allEvents } from "@/data/events";
import { EventsExplorer } from "@/components/events/EventsExplorer";

export const metadata: Metadata = pageMetadata({
  title: "The Royal Courts — Events — AFFINITY '26",
  path: "/events/",
});

/**
 * Phase 09 — the events explorer ("The Royal Courts"). Server Component:
 * reads the centralized data layer once and hands it to `EventsExplorer`
 * (a client component) for the interactive search/filter/grid — keeping
 * the data import in one place rather than letting the client component
 * reach into `data/` itself.
 */
export default function EventsPage() {
  return <EventsExplorer events={allEvents} />;
}
