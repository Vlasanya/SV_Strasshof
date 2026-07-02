import type { ClubInfo } from "@/lib/config";
import { phoneDisplayList, whatsappWaMeNumber } from "@/lib/phone";

/** Public Instagram profile URL from @handle or handle. */
export function instagramProfileUrl(
  handle: string | null | undefined,
): string | null {
  const raw = handle?.trim();
  if (!raw) return null;
  const slug = raw.replace(/^@/, "").replace(/\/+$/, "");
  if (!slug) return null;
  return `https://www.instagram.com/${encodeURIComponent(slug)}/`;
}

/** wa.me link for the club's first phone number. */
export function whatsappChatUrl(phone: string | null | undefined): string | null {
  const first = phoneDisplayList(phone)[0];
  if (!first) return null;
  return `https://wa.me/${whatsappWaMeNumber(first)}`;
}

export type SocialLink = {
  id: "instagram" | "whatsapp";
  href: string;
  label: string;
};

export function clubSocialLinks(club: ClubInfo): SocialLink[] {
  const links: SocialLink[] = [];
  const ig = instagramProfileUrl(club.instagram);
  if (ig) {
    links.push({ id: "instagram", href: ig, label: "Instagram" });
  }
  const wa = whatsappChatUrl(club.phone);
  if (wa) {
    links.push({ id: "whatsapp", href: wa, label: "WhatsApp" });
  }
  return links;
}
