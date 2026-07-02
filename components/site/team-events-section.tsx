import Link from "next/link";
import { Calendar } from "lucide-react";
import { EventTypeBadge } from "@/components/event-type-badge";
import { clubFieldLabel } from "@/lib/club-fields";
import {
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/event-labels";
import type { ClubEvent } from "@/lib/types";

export function TeamEventsSection({ events }: { events: ClubEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-surface-dark-2 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display text-lg font-bold text-on-dark flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Termine
        </h2>
        <Link
          href="/termine"
          className="text-sm text-primary font-semibold hover:underline"
        >
          Alle Termine
        </Link>
      </div>
      <ul className="space-y-3">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="border-b border-white/10 last:border-0 pb-3 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <EventTypeBadge type={ev.event_type} tone="public" />
            </div>
            <p className="font-medium text-on-dark">{ev.title}</p>
            <p className="text-sm text-on-dark-muted">
              {formatEventDate(ev.starts_at, ev.all_day)}
              {" · "}
              {formatEventTimeRange(ev.starts_at, ev.ends_at, ev.all_day)}
              {ev.field ? ` · ${clubFieldLabel(ev.field)}` : ""}
              {ev.location ? ` · ${ev.location}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
