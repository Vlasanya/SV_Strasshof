"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  upsertBrandingSettings,
  type BrandingSettingsInput,
} from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CheckboxField, TextArea, TextField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

const fileClass =
  "block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700 file:cursor-pointer";

// Upload an image to the public `branding` bucket from the browser (the admin
// session is authenticated) and return its public URL.
async function uploadBrandingImage(
  file: File,
  folder: string,
): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const ext =
    (file.name.split(".").pop() || "png")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "png";
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("branding")
    .upload(path, file, {
      contentType: file.type || "image/png",
      upsert: true,
    });
  if (error) throw new Error(error.message);
  return supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
}

export function BrandingSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const logo = settings["brand_logo_url"];
  const hero = settings["hero_image_url"];
  const posterBg = settings["poster_bg_url"];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const input: BrandingSettingsInput = {
        hero_eyebrow: String(fd.get("hero_eyebrow") ?? ""),
        hero_title: String(fd.get("hero_title") ?? ""),
        hero_title_highlight: String(fd.get("hero_title_highlight") ?? ""),
        hero_subtitle: String(fd.get("hero_subtitle") ?? ""),
        hero_cta_primary_label: String(fd.get("hero_cta_primary_label") ?? ""),
        hero_cta_secondary_label: String(
          fd.get("hero_cta_secondary_label") ?? "",
        ),
      };

      const images: [
        string,
        string,
        "brand_logo_url" | "hero_image_url" | "poster_bg_url",
      ][] = [
        ["logo_file", "remove_logo", "brand_logo_url"],
        ["hero_image_file", "remove_hero", "hero_image_url"],
        ["poster_bg_file", "remove_poster_bg", "poster_bg_url"],
      ];
      const folders: Record<string, string> = {
        brand_logo_url: "logo",
        hero_image_url: "hero",
        poster_bg_url: "poster",
      };

      for (const [fileField, removeField, key] of images) {
        const file = fd.get(fileField);
        if (file instanceof File && file.size > 0) {
          input[key] = await uploadBrandingImage(file, folders[key]);
        } else if (fd.get(removeField) === "on") {
          input[key] = "";
        }
      }

      const res = await upsertBrandingSettings(input);
      if (!res.ok) {
        toast.error(res.error ?? "No se pudo guardar");
        return;
      }
      toast.success("Marca actualizada.");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card rounded-2xl border border-border p-6 space-y-5 max-w-2xl"
    >
      {/* Logo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Logo
        </label>
        {logo ? (
          <img
            src={logo}
            alt="Logo actual"
            className="h-16 w-16 rounded-lg border border-border object-contain bg-white p-1"
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Sin logo: se usa el icono por defecto.
          </p>
        )}
        <input
          type="file"
          name="logo_file"
          accept="image/*"
          className={fileClass}
        />
        <p className="text-xs text-muted-foreground">
          PNG o SVG con fondo transparente. Cuadrado recomendado.
        </p>
        {/* {logo && (
          <CheckboxField label="Quitar el logo actual" name="remove_logo" />
        )} */}
      </div>

      <hr className="border-border" />

      {/* Hero image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Imagen de portada (hero)
        </label>
        {hero ? (
          <img
            src={hero}
            alt="Portada actual"
            className="h-28 w-full max-w-sm rounded-lg border border-border object-cover"
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Sin imagen propia: se usa la imagen por defecto.
          </p>
        )}
        <input
          type="file"
          name="hero_image_file"
          accept="image/*"
          className={fileClass}
        />
        <p className="text-xs text-muted-foreground">
          Apaisada y de alta resolución (mín. 1600×900). Se oscurece para que el
          texto se lea bien.
        </p>
        {hero && (
          <CheckboxField label="Quitar la imagen actual" name="remove_hero" />
        )}
      </div>

      <hr className="border-border" />

      {/* Poster / social-media default background */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Fondo por defecto para imágenes de partidos
        </label>
        {posterBg ? (
          <img
            src={posterBg}
            alt="Fondo de partidos actual"
            className="h-28 w-full max-w-sm rounded-lg border border-border object-cover"
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Sin fondo propio: se usa un degradado oscuro por defecto.
          </p>
        )}
        <input
          type="file"
          name="poster_bg_file"
          accept="image/*"
          className={fileClass}
        />
        <p className="text-xs text-muted-foreground">
          Se aplica automáticamente al generar imágenes/news de partidos
          (puedes cambiarlo o quitarlo en cada generación). Vertical u oscura
          funciona mejor; se le superpone un degradado para que el texto se lea.
        </p>
        {/* {posterBg && (
          <CheckboxField label="Quitar el fondo actual" name="remove_poster_bg" />
        )} */}
      </div>

      <hr className="border-border" />

      {/* Hero text */}
      {/* <TextField
        label="Etiqueta superior"
        name="hero_eyebrow"
        defaultValue={settings["hero_eyebrow"]}
        placeholder="Temporada 2025–26"
      /> */}
      {/* <TextField
        label="Título"
        name="hero_title"
        defaultValue={settings["hero_title"]}
        placeholder="U.D. Fonteta"
      /> */}
      {/* <TextField
        label="Palabra destacada (en rojo)"
        name="hero_title_highlight"
        defaultValue={settings["hero_title_highlight"]}
        hint="Si esta palabra aparece en el título, se resalta en color y en una línea aparte."
      /> */}
      {/* <TextArea
        label="Subtítulo"
        name="hero_subtitle"
        rows={3}
        defaultValue={settings["hero_subtitle"]}
      /> */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Botón principal"
          name="hero_cta_primary_label"
          defaultValue={settings["hero_cta_primary_label"]}
          placeholder="Inscripción"
        />
        <TextField
          label="Botón secundario"
          name="hero_cta_secondary_label"
          defaultValue={settings["hero_cta_secondary_label"]}
          placeholder="Ver equipos"
        />
      </div> */}

      <div className="pt-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {busy ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
