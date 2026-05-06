/** E.164 digits only for wa.me (no +) */
export function normalizeWhatsAppNumber(input: string): string {
  return input.replace(/\D/g, "");
}

export function whatsAppLink(phoneDigits: string, text: string): string {
  const q = encodeURIComponent(text);
  return `https://wa.me/${phoneDigits}?text=${q}`;
}
