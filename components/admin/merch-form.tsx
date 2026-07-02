"use client";

import { upsertMerch } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  ImageUploadField,
  TextField,
} from "@/components/admin/form-ui";
import type { MerchItem } from "@/lib/types";

export function MerchForm({ item }: { item?: MerchItem }) {
  return (
    <AdminForm action={upsertMerch} cancelHref="/admin/shop">
      {item && <input type="hidden" name="id" value={item.id} />}
      <TextField
        label="Name"
        name="name"
        required
        defaultValue={item?.name}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Kategorie"
          name="category"
          defaultValue={item?.category}
          placeholder="Trikot, Accessoires…"
        />
        <TextField
          label="Preis (€)"
          name="price"
          type="number"
          defaultValue={item?.price}
        />
      </div>

      <div>
        <ImageUploadField
          name="image_file"
          label="Bild"
          preview={item?.image_url}
        />
      </div>
      <TextField
        label="Größen"
        name="sizes"
        defaultValue={item?.sizes?.join(", ")}
        hint="Kommagetrennt, z. B. S, M, L, XL"
      />
      <TextField
        label="Position"
        name="sort_order"
        type="number"
        defaultValue={item?.sort_order ?? 0}
        hint="Kleinere Zahl erscheint weiter oben"
      />
      <CheckboxField
        label="Verfügbar"
        name="in_stock"
        defaultChecked={item?.in_stock ?? true}
      />
    </AdminForm>
  );
}
