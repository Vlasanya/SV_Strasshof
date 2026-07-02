export const CONTACT_SUBJECT_OPTIONS = [
  "Anmeldung",
  "Sponsoring",
  "Shop",
  "Datenschutz / Abmeldung",
  "Sonstiges",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECT_OPTIONS)[number];

export type ContactFormFields = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

/** Pre-select Betreff when linking to /kontakt from another section. */
export function kontaktHref(fromPathname: string): string {
  if (fromPathname.startsWith("/shop")) {
    return "/kontakt?betreff=Shop";
  }
  if (fromPathname.startsWith("/sponsoring")) {
    return "/kontakt?betreff=Sponsoring";
  }
  return "/kontakt";
}

export function validateContactForm(fields: ContactFormFields): string | null {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const phone = fields.phone.trim();
  const subject = fields.subject.trim();
  const message = fields.message.trim();

  if (!name || !email || !message) {
    return "Bitte Name, E-Mail und Nachricht ausfüllen.";
  }
  if (!subject) {
    return "Bitte einen Betreff wählen.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Bitte eine gültige E-Mail-Adresse eingeben.";
  }
  if (message.length < 10) {
    return "Die Nachricht muss mindestens 10 Zeichen lang sein.";
  }
  if (phone && !/^[+0-9 ()-]{6,20}$/.test(phone)) {
    return "Ungültige Telefonnummer";
  }

  return null;
}
