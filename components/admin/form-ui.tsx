"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import type { ActionResult } from "@/app/admin/actions";
import { useConfirm } from "@/components/admin/confirm";
import { createContext, useContext } from "react";

const FormErrorContext = createContext<Record<string, string>>({});
function useFieldError(name: string) {
  const errors = useContext(FormErrorContext);
  return errors[name];
}

const fieldClass =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  hint,
  pattern,
  inputMode,
  title,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  pattern?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  title?: string;
}) {
  const error = useFieldError(name);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        pattern={pattern}
        inputMode={inputMode}
        title={title}
        step={type === "number" ? "0.01" : undefined}
        className={`
          w-full px-4 py-2.5 rounded-xl border 
          bg-input-background text-sm

          ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-border focus:ring-primary/30"
          }

          focus:outline-none 
          focus:ring-2
        `}
      />

      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
export function ImageUploadField({
  label,
  name,
  accept = "image/*",
  preview,
  required,
}: {
  label: string;
  name: string;
  accept?: string;
  preview?: string | null;
  required?: boolean;
}) {
  const error = useFieldError(name);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}

        {required && <span className="text-primary">*</span>}
      </label>

      <input
        type="file"
        name={name}
        accept={accept}
        required={required}
        className={`
w-full text-sm

${error ? "border border-red-500 rounded-lg" : ""}

`}
      />

      {preview && (
        <img
          src={preview}
          alt={label}
          className="
mt-3
h-40
rounded-xl
border
border-border
object-cover
"
        />
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  options: {
    label: string;
    value: string;
  }[];
  defaultValue?: string;
  required?: boolean;
}) {
  const error = useFieldError(name);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground mb-1.5"
      >
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={`
          w-full px-4 py-2.5 rounded-xl
          bg-input-background
          text-sm text-foreground
          focus:outline-none
          focus:ring-2

          ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-border focus:ring-primary/30"
          }

          border
        `}
      >
        <option value="" disabled>
          Bitte wählen...
        </option>

        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
export function TextArea({
  label,
  name,
  defaultValue,
  value,
  onChange,
  rows = 5,
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  const error = useFieldError(name);
  const isControlled = value !== undefined;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground mb-1.5"
      >
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        {...(isControlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: defaultValue ?? undefined })}
        className={`
          ${fieldClass}

          ${error ? "border-red-500 focus:ring-red-200" : ""}
        `}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}
export function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
      />
      {label}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-primary hover:brightness-90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
    >
      {pending ? " Wird veröffentlicht..." : label}
    </button>
  );
}

export function AdminForm({
  action,
  children,
  cancelHref,
  submitLabel = "Speichern",
  successMessage,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  cancelHref?: string;
  submitLabel?: string;
  successMessage?: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    ok: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;

    const required = Array.from(
      form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("[required]"),
    );

    const newErrors: Record<string, string> = {};

    required.forEach((field) => {
      if (!field.value.trim()) {
        newErrors[field.name] = "Dieses Feld ist erforderlich";
      }
    });

    if (Object.keys(newErrors).length) {
      e.preventDefault();

      setErrors(newErrors);

      return;
    }

    setErrors({});
  }

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.ok && successMessage) {
      toast.success(successMessage);
    }
  }, [state, successMessage]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      action={formAction}
      className="bg-card rounded-2xl border border-border p-6 space-y-5 max-w-2xl"
    >
      <FormErrorContext.Provider value={errors}>
        {children}
      </FormErrorContext.Provider>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />

        {cancelHref && (
          <Link
            href={cancelHref}
            className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2.5"
          >
            Abbrechen
          </Link>
        )}
      </div>
    </form>
  );
}

export function DeleteButton({
  action,
  id,
  confirmText = "Dieses Element löschen?",
}: {
  action: (formData: FormData) => void;
  id: number;
  confirmText?: string;
}) {
  const confirm = useConfirm();
  const formRef = useRef<HTMLFormElement>(null);

  function onClick() {
    void (async () => {
      const ok = await confirm({
        title: "Löschen",
        description: confirmText,
        confirmLabel: "Löschen",
        tone: "danger",
      });
      if (ok) formRef.current?.requestSubmit();
    })();
  }

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={onClick}
        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
        aria-label="Löschen"
      >
        <TrashIcon />
      </button>
    </form>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
