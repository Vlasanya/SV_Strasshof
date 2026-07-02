"use client";

import { CheckboxField } from "@/components/admin/form-ui";

/** Unused on Strasshof (no FFCV sync). Kept for reference; not linked from Einstellungen. */
export function AutomationSettingsForm({
  resultsEnabled,
  fixturesEnabled,
  instagramReady,
}: {
  resultsEnabled: boolean;
  fixturesEnabled: boolean;
  instagramReady: boolean;
}) {
  return (
    <div className="space-y-4 opacity-60 pointer-events-none">
      <CheckboxField
        label="Ergebnisse automatisch veröffentlichen (deaktiviert — kein ÖFB-Sync)"
        name="auto_publish_results"
        defaultChecked={resultsEnabled}
      />
      <CheckboxField
        label="Spielpläne automatisch veröffentlichen (deaktiviert)"
        name="auto_publish_fixtures"
        defaultChecked={fixturesEnabled}
      />
      {!instagramReady && (
        <p className="text-xs text-muted-foreground">
          Instagram ist nicht verbunden.
        </p>
      )}
    </div>
  );
}
