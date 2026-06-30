import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          {eyebrow}
        </p>
      )}
      <h1
        className={`font-display text-4xl md:text-[56px] uppercase tracking-wide ${
          dark ? "text-on-dark" : "text-foreground"
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`mt-3 text-base max-w-lg ${
            dark ? "text-on-dark-muted" : "text-muted-foreground"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
