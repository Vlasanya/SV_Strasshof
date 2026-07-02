import { EVENT_TYPES } from "@/lib/event-labels";
import { eventTypeChipClass, type EventColorTone } from "@/lib/event-colors";
import { cn } from "@/lib/utils";
import type { ClubEventType } from "@/lib/types";

export function EventTypeBadge({
  type,
  tone = "admin",
  className,
}: {
  type: ClubEventType;
  tone?: EventColorTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        eventTypeChipClass(type, tone),
        className,
      )}
    >
      {EVENT_TYPES[type]}
    </span>
  );
}
