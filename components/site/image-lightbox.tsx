"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Global image lightbox for the public site. Uses click delegation so no page
 * needs to change: clicking any content image inside <main> opens it full-size.
 *
 * Skipped on purpose:
 *  - images inside an <a> (those are navigational thumbnails → let them link)
 *  - images marked with `data-no-zoom`
 *  - tiny images (icons, small logos/crests) below a size threshold
 */
const MIN_SIZE = 48;

function isZoomable(img: HTMLImageElement): boolean {
  if (!img.closest("main")) return false;
  if (img.closest("a")) return false;
  if (img.hasAttribute("data-no-zoom")) return false;
  const rect = img.getBoundingClientRect();
  return rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;
}

export function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  // Open on clicks on eligible images anywhere in the page.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      const img = target?.closest("img") as HTMLImageElement | null;
      if (!img || !isZoomable(img)) return;
      e.preventDefault();
      setSrc(img.currentSrc || img.src);
      setAlt(img.alt || "");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Show a zoom cursor on eligible images (initial + dynamic content).
  useEffect(() => {
    function mark() {
      document.querySelectorAll<HTMLImageElement>("main img").forEach((img) => {
        if (isZoomable(img)) img.style.cursor = "zoom-in";
      });
    }
    mark();
    const observer = new MutationObserver(() => mark());
    const main = document.querySelector("main");
    if (main) observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!src) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSrc(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [src]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 cursor-zoom-out"
      onClick={() => setSrc(null)}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => setSrc(null)}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl cursor-default"
      />
    </div>
  );
}
