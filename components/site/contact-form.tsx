"use client";

import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { formatShopOrderMessage } from "@/lib/shop-cart";
import {
  submitContact,
  type ContactState,
} from "@/app/(site)/kontakt/actions";
import {
  CONTACT_SUBJECT_OPTIONS,
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

function subjectFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): string {
  const betreff = searchParams.get("betreff")?.trim() ?? "";
  return (CONTACT_SUBJECT_OPTIONS as readonly string[]).includes(betreff)
    ? betreff
    : "";
}

function ContactFormInner() {
  const searchParams = useSearchParams();
  const { items, clearCart, hydrated: cartHydrated } = useCart();
  const [fields, setFields] = useState<ContactFormFields>(() => ({
    ...emptyFields,
    subject: subjectFromSearchParams(searchParams),
  }));
  const [shopMessagePrefilled, setShopMessagePrefilled] = useState(false);
  const pendingShopOrderRef = useRef(false);
  const handledSuccessRef = useRef(false);
  const lastErrorRef = useRef<string | undefined>(undefined);
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    { ok: false },
  );

  useEffect(() => {
    const subject = subjectFromSearchParams(searchParams);
    if (subject) {
      setFields((prev) =>
        prev.subject === subject ? prev : { ...prev, subject },
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (!cartHydrated || shopMessagePrefilled) return;
    const subject = subjectFromSearchParams(searchParams);
    if (subject !== "Shop" || items.length === 0) return;

    const orderMessage = formatShopOrderMessage(items);
    setFields((prev) => {
      if (prev.message.trim()) return prev;
      return { ...prev, subject: "Shop", message: orderMessage };
    });
    setShopMessagePrefilled(true);
  }, [cartHydrated, items, searchParams, shopMessagePrefilled]);

  useEffect(() => {
    if (state.ok) {
      if (handledSuccessRef.current) return;
      handledSuccessRef.current = true;
      toast.success("Nachricht gesendet! Wir melden uns bald bei dir.");
      if (pendingShopOrderRef.current) clearCart();
      pendingShopOrderRef.current = false;
      setFields(emptyFields);
      setShopMessagePrefilled(false);
      return;
    }

    handledSuccessRef.current = false;

    if (state.error && state.error !== lastErrorRef.current) {
      lastErrorRef.current = state.error;
      toast.error(state.error);
    } else if (!state.error) {
      lastErrorRef.current = undefined;
    }
  }, [state, clearCart]);

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
    pendingShopOrderRef.current = fields.subject === "Shop";
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
            {CONTACT_SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
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

export function ContactForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Laden…</p>}>
      <ContactFormInner />
    </Suspense>
  );
}
