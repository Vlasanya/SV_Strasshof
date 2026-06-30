"use client";

import { upsertAutomationSettings } from "@/app/admin/actions";
import { AdminForm, CheckboxField } from "@/components/admin/form-ui";

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
    <AdminForm
      action={upsertAutomationSettings}
      submitLabel="Guardar automatización"
      successMessage="Automatización actualizada."
    >
      <CheckboxField
        label="Publicar resultados automáticamente"
        name="auto_publish_results"
        defaultChecked={resultsEnabled}
      />
      <p className="text-xs text-muted-foreground">
        Tras la sincronización con la FFCV, se genera una imagen con los
        resultados de cada jornada, se crea una noticia y se publica en Instagram.
      </p>

      <CheckboxField
        label="Publicar próximos partidos automáticamente"
        name="auto_publish_fixtures"
        defaultChecked={fixturesEnabled}
      />
      <p className="text-xs text-muted-foreground">
        Cada viernes genera y publica una imagen con los partidos del fin de
        semana. Si no hay partidos (p. ej. fin de temporada), no se publica nada.
      </p>

      <p className="text-xs text-muted-foreground">
        Las jornadas ya publicadas no se repiten.
      </p>
      {!instagramReady && (
        <p className="text-xs text-amber-600">
          Instagram no está conectado: se crearán las noticias con su imagen,
          pero no se publicarán en Instagram hasta que configures el token arriba.
        </p>
      )}
    </AdminForm>
  );
}
