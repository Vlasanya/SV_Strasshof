import { MessageCircle } from "lucide-react";
import type { ClubInfo } from "@/lib/config";
import { clubSocialLinks } from "@/lib/social";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS = {
  instagram: InstagramIcon,
  whatsapp: MessageCircle,
} as const;

export function SocialLinks({
  club,
  className,
  iconClassName = "w-5 h-5",
  variant = "dark",
}: {
  club: ClubInfo;
  className?: string;
  iconClassName?: string;
  variant?: "dark" | "light";
}) {
  const links = clubSocialLinks(club);
  if (links.length === 0) return null;

  const linkClass =
    variant === "light"
      ? "inline-flex items-center justify-center rounded-lg border border-border p-2.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
      : "inline-flex items-center justify-center rounded-lg border border-white/15 p-2.5 text-on-dark/80 hover:text-primary hover:border-primary/40 transition-colors";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map((link) => {
        const Icon = ICONS[link.id];
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className={linkClass}
          >
            <Icon className={iconClassName} aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
