"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { TextField, SelectField, TextArea } from "@/components/admin/form-ui";
import {
  submitContact,
  type ContactState,
} from "@/app/(site)/kontakt/actions";
import {
  type ContactFormFields,
  validateContactForm,
} from "@/lib/contact-validation";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-[#d9d9d9] bg-input-background text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptyFields: ContactFormFields = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-primary hover:brightness-90 disabled:opacity-60 text-primary-foreground font-semibold uppercase tracking-wide px-7 py-3 rounded-lg transition-all text-sm"
    >
      {pending ? "Wird gesendet…" : "Nachricht senden"}
      {!pending && <Send className="w-4 h-4" />}
    </button>
  );
}

export function ContactForm() {
  const [fields, setFields] = useState<ContactFormFields>(emptyFields);
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Nachricht gesendet! Wir melden uns bald bei dir.");
      setFields(emptyFields);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function updateField<K extends keyof ContactFormFields>(
    key: K,
    value: ContactFormFields[K],
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateContactForm(fields);
    if (error) {
      toast.error(error);
      return;
    }

    const formData = new FormData();
    formData.set("name", fields.name);
    formData.set("email", fields.email);
    formData.set("phone", fields.phone);
    formData.set("subject", fields.subject);
    formData.set("message", fields.message);
    formAction(formData);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Name *
          </label>
          <input
            id="name"
            name="name"
            value={fields.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={fields.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="z. B. 0664 1234567"
            value={fields.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Betreff *
          </label>
          <select
            id="subject"
            name="subject"
            value={fields.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            className={inputClass}
          >
            <option value="">Betreff wählen…</option>
            <option value="Anmeldung">Anmeldung</option>
            <option value="Sponsoring">Sponsoring</option>
            <option value="Datenschutz / Abmeldung">
              Datenschutz / Abmeldung
            </option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Nachricht *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={fields.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={inputClass}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
