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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        {phone}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Contactar</h3>

            <p className="text-sm text-muted-foreground mt-2">
              ¿Cómo quieres contactar con este número?
            </p>

            <div className="flex flex-col gap-3 mt-5">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Llamar
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-muted transition-colors text-black"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
