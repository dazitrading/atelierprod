/**
 * Opens WhatsApp with a pre-filled message.
 * Uses web.whatsapp.com on desktop, wa.me on mobile.
 */
export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, "_blank");
}
