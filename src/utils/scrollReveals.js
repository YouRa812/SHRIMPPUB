const cells = [
  '#menu-items-grid > *', '#cat-dish-grid > *', '#food-carousel-track > *',
  '#events-posters-track > *', '#reviews-track > *', '#reviews-expanded-grid > *',
  '#morecambe-mount article', '#vinyl-crate-track > *', '#atmosphere-marquee-track > *',
].join(', ');

const variants = {
  'hero-word': '.hero-title > span',
  mascot: '#hero-shrimp-container, #menu-top-shrimp, #menu-peeking-shrimp',
  panel: '.deck-card, #food-carousel-shell',
  book: '#pub-history-book-mount',
  poster: '#events-posters-track > *',
  sleeve: '#vinyl-crate-track > *',
  photo: '#food-carousel-track > *, #atmosphere-marquee-track > *',
  media: '#turntable-chassis, .deck-card img',
  card: cells,
  title: '.deck-card :is(h2, h3, h4)',
  badge: '.deck-card :has(> .badge-asterisk), #menu-category-badge, #events-status-pill',
  counter: '#hero [data-scroll-stat], #menu-counter-indicator, #menu-category-num, #food-carousel-counter, #events-posters-counter',
  control: '#hero a, .deck-card :is(a, button), #menu-swipe-hint',
  detail: '.deck-card p, #booking-form > *, [data-scroll-reveal-list] > *',
};
const targets = ['[data-reveal]', ...Object.values(variants)].join(', ');
// Inside an interactive object only the layers marked in its template enter separately.
const grouped = [cells, '#pub-history-book-mount', '#turntable-chassis',
  '#hero-shrimp-container', '#menu-top-shrimp', '#menu-peeking-shrimp',
  '#booking-form > *', '[data-scroll-reveal-list] > *'].join(', ');
const stage = {
  panel: 0, badge: 0, 'hero-word': 0, book: 30, card: 0, sleeve: 0, poster: 0,
  mascot: 90, title: 45, photo: 50, media: 45, detail: 80, counter: 95, control: 70,
};
const initialized = new WeakSet();

function visit(node, selector, callback) {
  if (!(node instanceof Element)) return;
  if (node.matches(selector)) callback(node);
  node.querySelectorAll(selector).forEach(callback);
}

export function initScrollReveals(root) {
  if (!root || initialized.has(root) || !('IntersectionObserver' in window)) return;
  initialized.add(root);

  // Stagger each row locally. A long list entering on a fast scroll cannot delay another section.
  const timing = new WeakMap();
  function play(element) {
    if (element.dataset.scrollRevealState !== 'pending') return;
    entrance.unobserve(element);
    element.style.setProperty('--reveal-delay', timing.get(element).delay + 'ms');
    element.dataset.scrollRevealState = 'playing';
    reset.observe(element);
  }

  // A small inset leaves the movement visible just inside the viewport.
  const inset = Math.min(64, Math.round(window.innerHeight * .08));
  const entrance = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.boundingClientRect.height && entry.boundingClientRect.width) play(entry.target);
    }
  }, { rootMargin: `0px 0px -${inset}px 0px`, threshold: [0, .01] });

  // Replay on a later visit after leaving by a clear vertical margin.
  // Horizontal carousel motion and small scroll reversals keep the current presentation.
  const reset = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting, rootBounds, boundingClientRect: rect } of entries) {
      if (isIntersecting || !rootBounds || !rect.height || target.matches(':focus-within')) continue;
      if (rect.bottom > rootBounds.top && rect.top < rootBounds.bottom) continue;
      reset.unobserve(target);
      target.dataset.scrollRevealState = 'pending';
      entrance.observe(target);
    }
  }, { rootMargin: '240px 0px' });

  function register(element) {
    if (element.dataset.scrollRevealState) return;
    const explicit = element.dataset.reveal;
    if (!explicit && element.parentElement?.closest(grouped)) return;
    const variant = explicit || Object.keys(variants).find((key) => element.matches(variants[key]));
    if (!(variant in stage)) return;

    const cell = element.closest(cells);
    const anchor = cell || element;
    const index = Array.prototype.indexOf.call(anchor.parentElement.children, anchor);
    const stagger = cell || variant === 'hero-word' || variant === 'control' ? index % 3 * 64 : 0;
    // Let the card land ahead of the printed title and the price below it.
    const insideCard = cell && cell !== element;
    const delay = stage[variant] + stagger + (insideCard ? 45 : 0);
    element.style.setProperty('--reveal-direction', index % 2 ? '1' : '-1');
    element.dataset.scrollRevealVariant = variant;
    element.dataset.scrollRevealState = 'pending';
    timing.set(element, { delay });

    if (element.matches(':focus-within')) show(element);
    else entrance.observe(element);
  }

  function show(element) {
    entrance.unobserve(element);
    element.dataset.scrollRevealState = 'shown';
    element.style.removeProperty('--reveal-delay');
    reset.observe(element);
  }

  root.addEventListener('animationend', ({ target, animationName }) => {
    if (animationName.startsWith('shrimp-reveal-') && target.dataset.scrollRevealState === 'playing') show(target);
  });
  root.addEventListener('focusin', ({ target }) => {
    for (let node = target; node && node !== root; node = node.parentElement) {
      if (node.dataset.scrollRevealState && node.dataset.scrollRevealState !== 'shown') show(node);
    }
    target.querySelectorAll('[data-scroll-reveal-state]').forEach(show);
  });

  const changes = new MutationObserver((records) => {
    for (const { addedNodes, removedNodes } of records) {
      for (const node of removedNodes) {
        if (root.contains(node)) continue;
        visit(node, '[data-scroll-reveal-state]', (element) => {
          entrance.unobserve(element);
          reset.unobserve(element);
          delete element.dataset.scrollRevealState;
          delete element.dataset.scrollRevealVariant;
          element.style.removeProperty('--reveal-delay');
          element.style.removeProperty('--reveal-direction');
        });
      }
      for (const node of addedNodes) {
        if (root.contains(node)) visit(node, targets, register);
      }
    }
  });
  root.querySelectorAll(targets).forEach(register);
  changes.observe(root, { childList: true, subtree: true });
}
