export type JoinFormFields = {
  birthYear: string;
  teamId: string;
  teamName: string;
  childName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
};

/** Birth years for youth football (approx. U5–U19). */
export function youthBirthYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const youngest = currentYear - 4;
  const oldest = currentYear - 19;
  const years: number[] = [];
  for (let y = youngest; y >= oldest; y--) years.push(y);
  return years;
}

export function validateJoinStep(
  step: 1 | 2 | 3,
  fields: JoinFormFields,
): string | null {
  if (step === 1) {
    const year = Number(fields.birthYear);
    const allowed = youthBirthYearOptions();
    if (!fields.birthYear || !allowed.includes(year)) {
      return "Bitte das Geburtsjahr des Kindes wählen.";
    }
    return null;
  }

  if (step === 2) {
    if (!fields.teamName.trim()) {
      return "Bitte eine Mannschaft wählen oder „Noch unsicher“ auswählen.";
    }
    return null;
  }

  const contactName = fields.contactName.trim();
  const email = fields.email.trim();
  const phone = fields.phone.trim();
  const message = fields.message.trim();

  if (!contactName) {
    return "Bitte den Namen einer Kontaktperson angeben.";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Bitte eine gültige E-Mail-Adresse eingeben.";
  }
  if (!phone) {
    return "Bitte eine Telefonnummer angeben (für Rückfragen).";
  }
  if (!/^[+0-9 ()/-]{6,24}$/.test(phone)) {
    return "Ungültige Telefonnummer.";
  }
  if (message.length > 2000) {
    return "Die Nachricht ist zu lang (max. 2000 Zeichen).";
  }

  return null;
}

export function validateJoinForm(fields: JoinFormFields): string | null {
  return (
    validateJoinStep(1, fields) ??
    validateJoinStep(2, fields) ??
    validateJoinStep(3, fields)
  );
}
