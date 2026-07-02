"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export function SiteZugangForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-access", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { ok?: boolean }) => {
        if (!cancelled && data.ok) {
          window.location.replace(next);
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/site-access", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Falsches Passwort. Bitte erneut versuchen.");
        return;
      }

      // Full navigation so proxy.ts sees the new cookie immediately.
      window.location.replace(next);
    } catch {
      setError("Verbindungsfehler. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <section className="section-dark min-h-[70vh] flex items-center justify-center">
        <p className="text-on-dark-muted text-sm">Laden…</p>
      </section>
    );
  }

  return (
    <section className="section-dark accent-diagonal min-h-[70vh] flex items-center">
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-16">
        <div className="rounded-xl border border-white/10 bg-surface-dark p-6 sm:p-8">
          <div className="flex items-center gap-3 text-on-dark mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-bold">Vereinsvorschau</h1>
          </div>
          <p className="text-sm text-on-dark-muted mb-6">
            Diese Testversion ist passwortgeschützt. Bitte das Vereinspasswort
            eingeben.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="site-password"
                className="block text-sm font-medium text-on-dark mb-1.5"
              >
                Passwort
              </label>
              <input
                id="site-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-white/20 bg-surface-dark-2 px-4 py-2.5 text-on-dark"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-90 disabled:opacity-60"
            >
              {loading ? "Prüfen…" : "Zugang"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
