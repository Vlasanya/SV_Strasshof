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
  if (!expiresAt) return { label: "Ablauf unbekannt", tone: "warn" };
  const ms = Date.parse(expiresAt) - Date.now();
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return { label: "abgelaufen", tone: "danger" };
  if (days <= 10) return { label: `läuft in ${days} Tag(en) ab`, tone: "warn" };
  return { label: `noch ${days} Tag(e) gültig`, tone: "ok" };
}

export function InstagramSettingsForm({
  status,
  igMention = "",
  igDefaultHashtags = "",
  hasDeleteToken = false,
}: {
  status: InstagramStatus;
  igMention?: string;
  igDefaultHashtags?: string;
  hasDeleteToken?: boolean;
}) {
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
      if (res.ok) toast.success("Instagram-Token erneuert.");
      else toast.error(res.error ?? "Token konnte nicht erneuert werden.");
      setBusy(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium text-foreground">
            Status:{" "}
            {status.hasToken ? (
              <span className="text-emerald-600">verbunden</span>
            ) : (
              <span className="text-red-600">kein Token</span>
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
          {busy || pending ? "Wird erneuert…" : "Token jetzt erneuern"}
        </button>
      </div>

      <AdminForm
        action={upsertInstagramSettings}
        submitLabel="Instagram speichern"
        successMessage="Instagram aktualisiert."
      >
        <TextField
          label="Instagram Business Account ID"
          name="ig_business_account_id"
          defaultValue={status.businessId}
          placeholder="178414..."
          hint="Die user_id des Business-Accounts (über /me?fields=user_id)."
        />
        <TextField
          label="Long-Lived Token"
          name="ig_access_token"
          type="password"
          placeholder={
            status.hasToken
              ? "•••••• (leer lassen, um unverändert zu lassen)"
              : "Hier den ~60-Tage-Token einfügen"
          }
          hint="Wird sicher gespeichert und vor Ablauf automatisch erneuert. Leer lassen, wenn nur die ID geändert wird."
        />
        <TextField
          label="Erwähnung (@verein)"
          name="ig_mention"
          defaultValue={igMention}
          placeholder="@askoestasshof"
        />
        <TextField
          label="Standard-Hashtags"
          name="ig_default_hashtags"
          defaultValue={igDefaultHashtags}
          placeholder="#Strasshof #fussball"
        />
        <TextField
          label="Token zum Löschen (optional)"
          name="ig_delete_access_token"
          type="password"
          placeholder={
            hasDeleteToken
              ? "•••••• (leer lassen, um unverändert zu lassen)"
              : "Facebook-Login-Token mit instagram_manage_contents"
          }
          hint="Nur nötig, um News-Posts von Instagram zu löschen."
        />
      </AdminForm>
    </div>
  );
}
