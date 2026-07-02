"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  submitJoinInquiry,
  type JoinState,
} from "@/app/(site)/beitritt/actions";
import {
  type JoinFormFields,
  validateJoinStep,
  youthBirthYearOptions,
} from "@/lib/join-validation";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const UNSURE_TEAM = {
  id: "unsure",
  name: "Noch unsicher — der Verein berät mich",
};

const emptyFields: JoinFormFields = {
  birthYear: "",
  teamId: "",
  teamName: "",
  childName: "",
  contactName: "",
  email: "",
  phone: "",
  message: "",
};

type TeamOption = {
  id: number;
  name: string;
  category: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-primary hover:brightness-90 disabled:opacity-60 text-primary-foreground font-semibold uppercase tracking-wide px-7 py-3 rounded-lg transition-all text-sm"
    >
      {pending ? "Wird gesendet…" : "Anfrage senden"}
      {!pending && <Send className="w-4 h-4" />}
    </button>
  );
}

export function JoinWizard({ teams }: { teams: TeamOption[] }) {
  const birthYears = youthBirthYearOptions();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fields, setFields] = useState<JoinFormFields>(emptyFields);
  const [done, setDone] = useState(false);
  const [state, formAction] = useActionState<JoinState, FormData>(
    submitJoinInquiry,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(
        "Danke! Wir melden uns in Kürze bei dir mit der passenden Mannschaft.",
      );
      setDone(true);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function updateField<K extends keyof JoinFormFields>(
    key: K,
    value: JoinFormFields[K],
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function resetWizard() {
    setFields(emptyFields);
    setStep(1);
    setDone(false);
  }

  function nextStep() {
    const error = validateJoinStep(step, fields);
    if (error) {
      toast.error(error);
      return;
    }
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  }

  function prevStep() {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }

  function selectTeam(team: TeamOption | typeof UNSURE_TEAM) {
    if (team.id === UNSURE_TEAM.id) {
      updateField("teamId", "unsure");
      updateField("teamName", UNSURE_TEAM.name);
      return;
    }
    updateField("teamId", String(team.id));
    updateField("teamName", team.name);
  }

  function handleFinalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateJoinStep(3, fields);
    if (error) {
      toast.error(error);
      return;
    }
    const formData = new FormData();
    formData.set("birth_year", fields.birthYear);
    formData.set("team_id", fields.teamId);
    formData.set("team_name", fields.teamName);
    formData.set("child_name", fields.childName);
    formData.set("contact_name", fields.contactName);
    formData.set("email", fields.email);
    formData.set("phone", fields.phone);
    formData.set("message", fields.message);
    startTransition(() => {
      formAction(formData);
    });
  }

  if (done) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          Anfrage erhalten
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Vielen Dank! Unser Team meldet sich per E-Mail oder Telefon, um das
          passende Training zu besprechen.
        </p>
        <button
          type="button"
          onClick={resetWizard}
          className="mt-6 text-sm text-primary font-semibold hover:underline"
        >
          Weitere Anfrage senden
        </button>
      </div>
    );
  }

  const steps = [
    { n: 1, label: "Geburtsjahr" },
    { n: 2, label: "Mannschaft" },
    { n: 3, label: "Kontakt" },
  ] as const;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-8">
        {steps.map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                step >= n
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {step > n ? <Check className="w-4 h-4" /> : n}
            </div>
            <span
              className={cn(
                "text-xs font-medium truncate hidden sm:block",
                step === n ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className="h-px flex-1 bg-border min-w-2" />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Geburtsjahr des Kindes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              So finden wir die passende Altersgruppe.
            </p>
          </div>
          <div>
            <label
              htmlFor="birth_year"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Geburtsjahr *
            </label>
            <select
              id="birth_year"
              value={fields.birthYear}
              onChange={(e) => updateField("birthYear", e.target.value)}
              className={inputClass}
            >
              <option value="">Bitte wählen…</option>
              {birthYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              Weiter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              Mannschaft wählen
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Wähle die gewünschte Mannschaft oder „Noch unsicher“.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2">
            {teams.map((t) => {
              const selected = fields.teamId === String(t.id);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => selectTeam(t)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    {t.name}
                    {t.category && (
                      <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                        {t.category}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            <li className="sm:col-span-2">
              <button
                type="button"
                onClick={() => selectTeam(UNSURE_TEAM)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors",
                  fields.teamId === "unsure"
                    ? "border-primary bg-primary/5 font-semibold"
                    : "border-dashed border-border hover:border-primary/40",
                )}
              >
                {UNSURE_TEAM.name}
              </button>
            </li>
          </ul>
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              Weiter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form action={formAction} onSubmit={handleFinalSubmit} className="space-y-5">
          <div>
            <h2 className="font-semibold text-lg text-foreground">Kontakt</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Geb. {fields.birthYear}
              {fields.teamName ? ` · ${fields.teamName}` : ""}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="child_name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Name des Kindes (optional)
              </label>
              <input
                id="child_name"
                value={fields.childName}
                onChange={(e) => updateField("childName", e.target.value)}
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div>
              <label
                htmlFor="contact_name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Name Erziehungsberechtigte/r *
              </label>
              <input
                id="contact_name"
                value={fields.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                E-Mail *
              </label>
              <input
                id="email"
                type="email"
                value={fields.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Telefon *
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="z. B. 0664 1234567"
                value={fields.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Nachricht (optional)
            </label>
            <textarea
              id="message"
              rows={4}
              value={fields.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="z. B. bereits Fußballerfahrung, bevorzugte Trainingstage…"
              className={inputClass}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Mit dem Absenden willigst du ein, dass wir deine Angaben zur
            Bearbeitung der Anmeldung verwenden. Details in der{" "}
            <a href="/datenschutz" className="text-primary underline">
              Datenschutzerklärung
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
