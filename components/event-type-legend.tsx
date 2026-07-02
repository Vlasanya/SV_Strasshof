import { EVENT_TYPES } from "@/lib/event-labels";
import {
  EVENT_LEGEND_ORDER,
  eventTypeDotClass,
  type EventColorTone,
} from "@/lib/event-colors";
import { cn } from "@/lib/utils";
import type { ClubEventType } from "@/lib/types";

export function EventTypeLegend({
  tone = "admin",
  types = EVENT_LEGEND_ORDER,
  className,
}: {
  tone?: EventColorTone;
  types?: ClubEventType[];
  className?: string;
}) {
  const text =
    tone === "public" ? "text-on-dark-muted" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
        text,
        className,
      )}
    >
      <span className="font-semibold uppercase tracking-wide">Legende</span>
      {types.map((type) => (
        <span key={type} className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              eventTypeDotClass(type, tone),
            )}
            aria-hidden
          />
          {EVENT_TYPES[type]}
        </span>
      ))}
    </div>
  );
}
