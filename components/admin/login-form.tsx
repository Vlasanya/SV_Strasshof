"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

export function LoginForm({
  clubName,
  logoUrl,
}: {
  clubName: string;
  logoUrl?: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase ist nicht konfiguriert (prüfe .env.local).");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError("Anmeldedaten ungültig.");
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={clubName}
              className="w-12 h-12 rounded-xl object-contain mb-3"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <p className="font-display text-2xl font-black uppercase tracking-wide text-white">
            {clubName}
          </p>
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Admin-Bereich
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 space-y-4 shadow-xl"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
