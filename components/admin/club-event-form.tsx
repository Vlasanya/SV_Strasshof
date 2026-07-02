"use client";

import { useState } from "react";
import { upsertClubEvent } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  SelectField,
  TextArea,
  TextField,
} from "@/components/admin/form-ui";
import {
  EVENT_TYPE_OPTIONS,
  suggestedEventDate,
  suggestedEventDatetimeLocal,
  toDateInputValue,
  toDatetimeLocalValue,
} from "@/lib/event-labels";
import { CLUB_FIELDS } from "@/lib/club-fields";
import { MEINTURNIERPLAN_WIDGET_HELP_URL } from "@/lib/meinturnierplan";
import type { ClubEvent, Team } from "@/lib/types";

export function ClubEventForm({
  event,
  teams,
}: {
  event?: ClubEvent;
  teams: Team[];
}) {
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [eventType, setEventType] = useState(
    event?.event_type ?? "training",
  );

  const teamOptions = [
    { value: "club", label: "Gesamtverein (alle Mannschaften)" },
    ...teams.map((t) => ({ value: String(t.id), label: t.name })),
  ];

  const defaultTeam =
    event?.team_id != null ? String(event.team_id) : "club";

  const defaultStartsAt =
    toDatetimeLocalValue(event?.starts_at) || suggestedEventDatetimeLocal();
  const defaultStartDate =
    toDateInputValue(event?.starts_at) || suggestedEventDate();

  return (
    <AdminForm action={upsertClubEvent} cancelHref="/admin/termine">
      {event && <input type="hidden" name="id" value={event.id} />}

      <TextField
        label="Titel"
        name="title"
        defaultValue={event?.title}
        required
        placeholder="z. B. Training, Mannschaftsfest"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Art <span className="text-primary">*</span>
        </label>
        <select
          name="event_type"
          value={eventType}
          onChange={(e) =>
            setEventType(
              e.target.value as (typeof EVENT_TYPE_OPTIONS)[number]["value"],
            )
          }
          required
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm"
        >
          {EVENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <SelectField
        label="Mannschaft"
        name="team_id"
        options={teamOptions}
        defaultValue={defaultTeam}
        required
      />

      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
        <input
          type="checkbox"
          name="all_day"
          defaultChecked={event?.all_day}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
        />
        Ganztägig
      </label>

      {allDay ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Startdatum"
            name="start_date"
            type="date"
            defaultValue={defaultStartDate}
            required
          />
          <TextField
            label="Enddatum (optional)"
            name="end_date"
            type="date"
            defaultValue={toDateInputValue(event?.ends_at)}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Beginn"
            name="starts_at"
            type="datetime-local"
            defaultValue={defaultStartsAt}
            required
          />
          <TextField
            label="Ende (optional)"
            name="ends_at"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(event?.ends_at)}
          />
        </div>
      )}

      <SelectField
        label="Platz / Spielfeld"
        name="field"
        options={CLUB_FIELDS.map((f) => ({ value: f.value, label: f.label }))}
        defaultValue={event?.field ?? ""}
      />

      <TextField
        label="Ort (Adresse, Zusatz)"
        name="location"
        defaultValue={event?.location ?? ""}
        placeholder="z. B. Sportplatz Strasshof"
      />

      <TextArea
        label="Beschreibung"
        name="description"
        rows={4}
        defaultValue={event?.description ?? ""}
      />

      {(eventType === "tournament" || event?.external_url || event?.external_widget) && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            MeinTurnierplan / externer Spielplan
          </p>
          <TextField
            label="Turnier-URL"
            name="external_url"
            defaultValue={event?.external_url ?? ""}
            placeholder="https://www.meinturnierplan.de/c/…"
          />
          <div>
            <TextArea
              label="Widget-Code (optional)"
              name="external_widget"
              rows={4}
              defaultValue={event?.external_widget ?? ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              HTML-Widget aus MeinTurnierplan einfügen (
              <a
                href={MEINTURNIERPLAN_WIDGET_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Anleitung
              </a>
              ). Ohne Widget wird ein Link zur Turnierseite angezeigt.
            </p>
          </div>
        </div>
      )}

      <CheckboxField
        label="Auf der öffentlichen Website anzeigen"
        name="published"
        defaultChecked={event?.published ?? true}
      />
    </AdminForm>
  );
}
