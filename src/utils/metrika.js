export function initMetrika() {
  const counterId = import.meta.env.VITE_METRIKA_ID?.trim();
  if (!import.meta.env.PROD || !/^[1-9]\d*$/.test(counterId ?? '')) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical || new URL(canonical.href).origin !== window.location.origin) return;

  const id = Number(counterId);
  if (!Number.isSafeInteger(id)) return;

  window.ym ||= function () {
    (window.ym.a ||= []).push(arguments);
  };
  window.ym.l ||= Date.now();
  window.ym(id, 'init', {
    accurateTrackBounce: true,
    trackLinks: true,
    webvisor: false,
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.append(tag);

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;

    if (link.protocol === 'tel:') {
      window.ym(id, 'reachGoal', 'phone_click');
    } else if (link.getAttribute('href') === '#booking-deck') {
      window.ym(id, 'reachGoal', 'booking_section_click');
    } else if (link.hostname === 'yandex.ru' && /^\/maps\/org\/shrimp_pub\/225095015509\/?$/.test(link.pathname)) {
      window.ym(id, 'reachGoal', 'maps_click');
    }
  });
}
