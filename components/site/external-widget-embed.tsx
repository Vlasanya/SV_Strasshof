"use client";

import { useEffect, useRef } from "react";

/** Renders admin-pasted iframe/widget HTML (ÖFB, MeinTurnierplan, …). */
export function ExternalWidgetEmbed({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    const scripts = el.querySelectorAll("script");
    for (const old of scripts) {
      const script = document.createElement("script");
      for (const attr of old.attributes) {
        script.setAttribute(attr.name, attr.value);
      }
      if (old.textContent) script.textContent = old.textContent;
      old.replaceWith(script);
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className="external-widget-embed rounded-xl overflow-hidden bg-white/95 min-h-[200px]"
    />
  );
}
