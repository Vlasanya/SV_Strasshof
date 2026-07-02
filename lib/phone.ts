/** Split club phone field into display numbers. */
export function phoneDisplayList(phone: string | null | undefined): string[] {
  return (
    phone
      ?.split(/\s*[-,\n]\s*/g)
      .map((p) => p.trim())
      .filter(Boolean) ?? []
  );
}

/**
 * E.164 digits for wa.me links (no +).
 * Austrian numbers: strips leading 0, prepends 43 when no country code present.
 */
export function whatsappWaMeNumber(
  phone: string,
  defaultCountryCode = "43",
): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length >= 11 && digits.startsWith(defaultCountryCode)) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `${defaultCountryCode}${digits}`;
}
