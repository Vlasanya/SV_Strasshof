export type ContactFormFields = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function validateContactForm(fields: ContactFormFields): string | null {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const phone = fields.phone.trim();
  const subject = fields.subject.trim();
  const message = fields.message.trim();

  if (!name || !email || !message) {
    return "Por favor, completa nombre, email y mensaje.";
  }
  if (!subject) {
    return "Selecciona un asunto.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Introduce un email válido.";
  }
  if (message.length < 10) {
    return "El mensaje debe tener al menos 10 caracteres.";
  }
  if (phone && !/^[+0-9 ()-]{6,20}$/.test(phone)) {
    return "Teléfono inválido";
  }

  return null;
}
