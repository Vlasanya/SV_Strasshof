"use client";

import { Phone, MessageCircle } from "lucide-react";
import { useState } from "react";

export function ContactPhoneActions({
  phone,
  whatsappNumber,
}: {
  phone: string;
  whatsappNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const whatsappHref = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden text-sm text-muted-foreground transition-colors hover:text-primary md:inline"
      >
        {phone}
      </a>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground transition-colors hover:text-primary md:hidden"
      >
        {phone}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 md:hidden">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Kontakt</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Wie möchtest du diese Nummer erreichen?
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-90"
              >
                <Phone className="h-4 w-4" />
                Anrufen
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
