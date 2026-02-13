/**
 * Opens WhatsApp with a pre-filled message.
 * Uses web.whatsapp.com on desktop, wa.me on mobile.
 */
export function openWhatsApp(message: string) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const encoded = encodeURIComponent(message);
  const url = isMobile
    ? `https://wa.me/?text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;
  window.open(url, "_blank");
}
