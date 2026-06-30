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
        label="Nombre"
        name="name"
        required
        defaultValue={item?.name}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Categoría"
          name="category"
          defaultValue={item?.category}
          placeholder="Equipación, Accesorios..."
        />
        <TextField
          label="Precio (€)"
          name="price"
          type="number"
          defaultValue={item?.price}
        />
      </div>

      <div>
        <ImageUploadField
          name="image_file"
          label="Imagen (URL)"
          preview={item?.image_url}
        />
      </div>
      <TextField
        label="Tallas"
        name="sizes"
        defaultValue={item?.sizes?.join(", ")}
        hint="Separadas por comas, p. ej. S, M, L, XL"
      />
      <TextField
        label="Posición"
        name="sort_order"
        type="number"
        defaultValue={item?.sort_order ?? 0}
        hint="Número menor aparece primero"
      />
      <CheckboxField
        label="Disponible"
        name="in_stock"
        defaultChecked={item?.in_stock ?? true}
      />
    </AdminForm>
  );
}
