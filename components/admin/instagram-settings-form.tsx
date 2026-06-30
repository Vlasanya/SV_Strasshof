"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  refreshInstagramTokenNow,
  upsertInstagramSettings,
} from "@/app/admin/actions";
import { AdminForm, TextField } from "@/components/admin/form-ui";

export interface InstagramStatus {
  hasToken: boolean;
  businessId: string;
  expiresAt: string | null;
}

function describeExpiry(expiresAt: string | null): {
  label: string;
  tone: "ok" | "warn" | "danger";
} {
  if (!expiresAt) return { label: "caducidad desconocida", tone: "warn" };
  const ms = Date.parse(expiresAt) - Date.now();
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return { label: "caducado", tone: "danger" };
  if (days <= 10) return { label: `caduca en ${days} día(s)`, tone: "warn" };
  return { label: `válido ${days} día(s) más`, tone: "ok" };
}

export function InstagramSettingsForm({ status }: { status: InstagramStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const expiry = describeExpiry(status.expiresAt);
  const toneClass =
    expiry.tone === "ok"
      ? "text-emerald-600"
      : expiry.tone === "danger"
        ? "text-red-600"
        : "text-amber-600";

  function onRefresh() {
    setBusy(true);
    startTransition(async () => {
      const res = await refreshInstagramTokenNow();
      if (res.ok) toast.success("Token de Instagram renovado.");
      else toast.error(res.error ?? "No se pudo renovar el token.");
      setBusy(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium text-foreground">
            Estado:{" "}
            {status.hasToken ? (
              <span className="text-emerald-600">conectado</span>
            ) : (
              <span className="text-red-600">sin token</span>
            )}
          </p>
          {status.hasToken && (
            <p className={`text-xs ${toneClass}`}>Token {expiry.label}.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={busy || pending || !status.hasToken}
          className="inline-flex items-center gap-2 border border-border hover:bg-muted disabled:opacity-60 text-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          {busy || pending ? "Renovando..." : "Renovar token ahora"}
        </button>
      </div>

      <AdminForm
        action={upsertInstagramSettings}
        submitLabel="Guardar Instagram"
        successMessage="Instagram actualizado."
      >
        <TextField
          label="ID de cuenta de Instagram (Business)"
          name="ig_business_account_id"
          defaultValue={status.businessId}
          placeholder="178414..."
          hint="El user_id de la cuenta de empresa (lo obtienes con /me?fields=user_id)."
        />
        <TextField
          label="Token de larga duración"
          name="ig_access_token"
          type="password"
          placeholder={
            status.hasToken
              ? "•••••• (déjalo vacío para no cambiarlo)"
              : "Pega aquí el token de ~60 días"
          }
          hint="Se guarda de forma segura y se renueva automáticamente antes de caducar. Déjalo vacío si solo cambias el ID."
        />
      </AdminForm>
    </div>
  );
}
