import { foodTickerDishes } from '../data/foodTickerData.js';
import { sound } from '../utils/audio.js';

const CAROUSEL_TRANSITION = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)';
const DEFAULT_INTERVAL_MS = 3000;
const DRAG_GUARD_PX = 10;
const CLONE_BUFFER_COUNT = 5;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseTranslateX(transformValue) {
  if (!transformValue || transformValue === 'none') return null;
  const match = transformValue.match(/matrix3d\(([^)]+)\)/) || transformValue.match(/matrix\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => parseFloat(part.trim()));
  if (transformValue.startsWith('matrix3d(') && parts.length >= 13) {
    return Number.isFinite(parts[12]) ? parts[12] : null;
  }
  if (parts.length >= 5) {
    return Number.isFinite(parts[4]) ? parts[4] : null;
  }
  return null;
}

export class FoodTicker {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.options = Object.assign({
      intervalMs: DEFAULT_INTERVAL_MS,
      onDishClick: null
    }, options);

    this.dishes = Array.isArray(foodTickerDishes) ? foodTickerDishes : [];
    this.totalDishes = this.dishes.length;
    this.cloneCount = this.totalDishes > 1 ? CLONE_BUFFER_COUNT : 0;
    this.currentIndex = 0;
    this.trackIndex = this.cloneCount;

    this.isHovered = false;
    this.isTouchPaused = false;
    this.isDragging = false;
    this.lastTouchTime = 0;

    this.autoAdvanceTimer = null;
    this.wrapFallbackTimer = null;
    this.touchResumeTimer = null;
    this.rafId = null;

    this.trackEl = null;
    this.counterEl = null;
    this.boundCleanupHandlers = [];
  }

  mount() {
    if (!this.container) return;
    this.destroy();
    this.currentIndex = 0;
    this.trackIndex = this.cloneCount;
    this.render();
    this.attachEvents();
    this.applyTrackTransform(this.trackIndex, false);
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.applyTrackTransform(this.trackIndex, false);
    });
    this.startAutoAdvance();
  }

  destroy() {
    this.stopAutoAdvance();
    if (this.wrapFallbackTimer) {
      clearTimeout(this.wrapFallbackTimer);
      this.wrapFallbackTimer = null;
    }
    if (this.touchResumeTimer) {
      clearTimeout(this.touchResumeTimer);
      this.touchResumeTimer = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.boundCleanupHandlers.forEach((cleanup) => cleanup());
    this.boundCleanupHandlers = [];
    this.isHovered = false;
    this.isTouchPaused = false;
    this.isDragging = false;
    this.trackEl = null;
    this.counterEl = null;
  }

  buildSlides() {
    if (this.totalDishes === 0) return [];
    if (this.totalDishes === 1) {
      return [{ dish: this.dishes[0], dishIdx: 0, isClone: false }];
    }
    const slides = [];
    for (let i = -this.cloneCount; i < this.totalDishes + this.cloneCount; i++) {
      const dishIdx = ((i % this.totalDishes) + this.totalDishes) % this.totalDishes;
      slides.push({
        dish: this.dishes[dishIdx],
        dishIdx,
        isClone: i < 0 || i >= this.totalDishes
      });
    }
    return slides;
  }

  render() {
    const slides = this.buildSlides();

    const cardsHtml = slides.map(({ dish, dishIdx, isClone }, slotIdx) => {
      const safeName = escapeHtml(dish.name);
      const safeAlt = escapeHtml(dish.imageAlt || dish.name);

      const mediaHtml = dish.image
        ? `
          <img
            src="./${escapeHtml(dish.image)}"
            alt="${safeAlt}"
            loading="lazy"
            decoding="async"
            draggable="false"
            data-fallback-emoji=""
            class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none block"
          />
        `
        : `<div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500"><svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg></div>`;

      return `
        <div
          class="food-ticker-card shrink-0 w-full sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)] h-[240px] sm:h-[250px] lg:h-[270px] rounded-2xl overflow-hidden bg-neutral-900 shadow-xl hover:shadow-[0_14px_36px_rgba(255,30,39,0.28)] cursor-pointer group flex items-center justify-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-shadow duration-300"
          data-dish-id="${escapeHtml(dish.id)}"
          data-dish-index="${dishIdx}"
          data-slot-index="${slotIdx}"
          ${isClone ? 'aria-hidden="true"' : `role="button" tabindex="0" aria-label="${safeName}"`}
        >
          ${mediaHtml}
        </div>
      `;
    }).join('');

    const totalFormatted = String(this.totalDishes).padStart(2, '0');

    this.container.innerHTML = `
      <div id="food-carousel-shell" class="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-950 border border-red-500/30 p-4 sm:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
        <!-- Header Row -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-white/10">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span class="text-[10px] sm:text-xs font-mono-tech uppercase font-bold tracking-widest text-red-500">
                КУХНЯ &amp; ЗАКУСКИ ОТ ШЕФА
              </span>
            </div>
            <h3 class="text-base sm:text-xl lg:text-2xl font-black uppercase text-white font-unbounded tracking-tight">
              ХИТЫ КУХНИ В КАДРЕ
            </h3>
            <p class="text-[11px] sm:text-xs font-mono-tech text-neutral-400 mt-1">
              Нажмите на любое фото — откроем состав, вес и цену блюда
            </p>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono-tech">
            <button
              id="food-carousel-prev"
              type="button"
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red-600 border border-white/15 text-white flex items-center justify-center transition-all text-sm font-bold shadow-sm cursor-pointer active:scale-95"
              aria-label="Предыдущее блюдо"
              title="Предыдущее блюдо"
            >
              ←
            </button>
            <span
              id="food-carousel-counter"
              class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200 text-xs font-bold tracking-wider tabular-nums"
            >
              01 / ${totalFormatted}
            </span>
            <button
              id="food-carousel-next"
              type="button"
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red-600 border border-white/15 text-white flex items-center justify-center transition-all text-sm font-bold shadow-sm cursor-pointer active:scale-95"
              aria-label="Следующее блюдо"
              title="Следующее блюдо"
            >
              →
            </button>
          </div>
        </div>

        <!-- Carousel Viewport (Only complete cards visible, zero peeking slivers) -->
        <div
          id="food-carousel-viewport"
          class="relative w-full overflow-hidden rounded-2xl"
          style="touch-action: pan-y;"
        >
          <div
            id="food-carousel-track"
            class="flex gap-3 sm:gap-4 w-full will-change-transform cursor-grab active:cursor-grabbing"
          >
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;
  }

  getStepWidth() {
    const track = this.trackEl;
    if (!track || !track.children.length) return 0;
    const first = track.children[0];
    const second = track.children[1];
    if (second) {
      const r1 = first.getBoundingClientRect();
      const r2 = second.getBoundingClientRect();
      const diff = r2.left - r1.left;
      if (diff > 0) return diff;
    }
    return first.getBoundingClientRect().width || first.offsetWidth || 0;
  }

  updateCounter() {
    if (!this.counterEl || this.totalDishes === 0) return;
    const current = String(this.currentIndex + 1).padStart(2, '0');
    const total = String(this.totalDishes).padStart(2, '0');
    this.counterEl.textContent = `${current} / ${total}`;
  }

  applyTrackTransform(index, animate = true) {
    const track = this.trackEl;
    if (!track) return;
    const step = this.getStepWidth();
    if (step <= 0) return;

    track.style.transition = animate ? CAROUSEL_TRANSITION : 'none';
    track.style.transform = `translate3d(${-index * step}px, 0, 0)`;
  }

  normalizeWrapBoundary(preserveVisualProgress = false) {
    if (this.totalDishes <= 1 || !this.trackEl) return;
    const minCore = this.cloneCount;
    const maxCore = this.cloneCount + this.totalDishes - 1;
    if (this.trackIndex >= minCore && this.trackIndex <= maxCore) return;

    let shiftSlides = 0;
    while (this.trackIndex + shiftSlides < minCore) shiftSlides += this.totalDishes;
    while (this.trackIndex + shiftSlides > maxCore) shiftSlides -= this.totalDishes;

    const currentVisualX = preserveVisualProgress
      ? parseTranslateX(window.getComputedStyle(this.trackEl).transform)
      : null;
    const step = this.getStepWidth();

    this.trackIndex += shiftSlides;
    if (preserveVisualProgress && currentVisualX !== null && step > 0) {
      this.trackEl.style.transition = 'none';
      this.trackEl.style.transform = `translate3d(${currentVisualX - shiftSlides * step}px, 0, 0)`;
    } else {
      this.applyTrackTransform(this.trackIndex, false);
    }
    void this.trackEl.offsetWidth;
  }

  goToTrackIndex(targetTrackIndex, animate = true) {
    if (this.totalDishes <= 1) return;
    if (this.wrapFallbackTimer) {
      clearTimeout(this.wrapFallbackTimer);
      this.wrapFallbackTimer = null;
    }

    this.trackIndex = targetTrackIndex;
    this.currentIndex = ((targetTrackIndex - this.cloneCount) % this.totalDishes + this.totalDishes) % this.totalDishes;
    this.updateCounter();
    this.applyTrackTransform(this.trackIndex, animate);

    const minCore = this.cloneCount;
    const maxCore = this.cloneCount + this.totalDishes - 1;
    if (this.trackIndex < minCore || this.trackIndex > maxCore) {
      if (animate) {
        this.wrapFallbackTimer = setTimeout(() => {
          this.wrapFallbackTimer = null;
          if (!this.isDragging) this.normalizeWrapBoundary(false);
        }, 540);
      } else {
        this.normalizeWrapBoundary(false);
      }
    }
  }

  stepBy(delta) {
    if (this.totalDishes <= 1 || !this.trackEl) return;
    if (this.getStepWidth() <= 0) return;
    this.normalizeWrapBoundary(true);
    this.goToTrackIndex(this.trackIndex + delta, true);
  }

  canAutoAdvance() {
    if (this.totalDishes <= 1) return false;
    if (!this.container || !this.container.isConnected) return false;
    if (typeof document !== 'undefined' && document.hidden) return false;
    if (this.isHovered || this.isTouchPaused || this.isDragging) return false;
    return true;
  }

  stopAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  startAutoAdvance() {
    this.stopAutoAdvance();
    if (!this.canAutoAdvance()) return;

    const intervalMs = Number(this.options.intervalMs) > 0 ? Number(this.options.intervalMs) : DEFAULT_INTERVAL_MS;
    this.autoAdvanceTimer = setInterval(() => {
      if (!this.container || !this.container.isConnected) {
        this.destroy();
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        this.stopAutoAdvance();
        return;
      }
      if (this.isHovered || this.isTouchPaused || this.isDragging) return;
      if (this.getStepWidth() <= 0) return;
      this.stepBy(1);
    }, intervalMs);
  }

  attachEvents() {
    const shell = this.container.querySelector('#food-carousel-shell');
    const viewport = this.container.querySelector('#food-carousel-viewport');
    const track = this.container.querySelector('#food-carousel-track');
    const prevBtn = this.container.querySelector('#food-carousel-prev');
    const nextBtn = this.container.querySelector('#food-carousel-next');
    const counterEl = this.container.querySelector('#food-carousel-counter');

    if (!shell || !viewport || !track) return;
    this.trackEl = track;
    this.counterEl = counterEl;

    const addGlobalListener = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      this.boundCleanupHandlers.push(() => target.removeEventListener(event, handler, options));
    };

    // Fallback if a dish image fails to load
    track.querySelectorAll('img[data-fallback-emoji]').forEach((img) => {
      img.addEventListener('error', () => {
        const div = document.createElement('div');
        div.className = 'w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500';
        div.innerHTML = '<svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg>';
        img.replaceWith(div);
      }, { once: true });
    });

    // Prevent native ghost image drag on desktop browsers
    track.addEventListener('dragstart', (e) => e.preventDefault());

    // Snap seamlessly back into primary slide range after wrap transition completes
    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (this.wrapFallbackTimer) {
        clearTimeout(this.wrapFallbackTimer);
        this.wrapFallbackTimer = null;
      }
      if (!this.isDragging) {
        this.normalizeWrapBoundary(false);
      }
    });

    // Prev / Next arrow controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        sound.playClick();
        this.stepBy(-1);
        this.startAutoAdvance();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sound.playClick();
        this.stepBy(1);
        this.startAutoAdvance();
      });
    }

    // Hover auto-pause (ignoring synthetic mouseenter fired immediately after touch)
    shell.addEventListener('mouseenter', () => {
      if (Date.now() - this.lastTouchTime < 800) return;
      this.isHovered = true;
      this.stopAutoAdvance();
    });
    shell.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.startAutoAdvance();
    });

    // Touch auto-pause & clean resume
    viewport.addEventListener('touchstart', () => {
      this.lastTouchTime = Date.now();
      if (this.touchResumeTimer) {
        clearTimeout(this.touchResumeTimer);
        this.touchResumeTimer = null;
      }
      this.isTouchPaused = true;
      this.stopAutoAdvance();
    }, { passive: true });

    const handleTouchRelease = () => {
      this.lastTouchTime = Date.now();
      this.isHovered = false;
      this.isTouchPaused = false;
      if (this.touchResumeTimer) {
        clearTimeout(this.touchResumeTimer);
      }
      this.touchResumeTimer = setTimeout(() => {
        this.touchResumeTimer = null;
        this.startAutoAdvance();
      }, 150);
    };
    viewport.addEventListener('touchend', handleTouchRelease, { passive: true });
    viewport.addEventListener('touchcancel', handleTouchRelease, { passive: true });

    // Horizontal swipe / mouse drag + 10px tap-vs-drag guard
    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let dragBaseX = 0;
    let dragDeltaX = 0;
    let dragAxis = null;
    let hasDragged = false;
    let suppressClickUntil = 0;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (this.wrapFallbackTimer) {
        clearTimeout(this.wrapFallbackTimer);
        this.wrapFallbackTimer = null;
      }

      this.normalizeWrapBoundary(true);
      const step = this.getStepWidth();
      const computedX = parseTranslateX(window.getComputedStyle(track).transform);

      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      dragBaseX = computedX !== null ? computedX : (-this.trackIndex * step);
      dragDeltaX = 0;
      dragAxis = null;
      hasDragged = false;
      this.isDragging = true;
      this.stopAutoAdvance();

      track.style.transition = 'none';
      track.style.transform = `translate3d(${dragBaseX}px, 0, 0)`;
    }, { passive: true });

    addGlobalListener(window, 'pointermove', (e) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const distance = Math.hypot(dx, dy);

      if (distance > DRAG_GUARD_PX) {
        hasDragged = true;
      }

      if (dragAxis === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          dragAxis = 'x';
        } else {
          // Vertical scroll gesture: release horizontal tracking cleanly
          dragAxis = 'y';
          activePointerId = null;
          this.isDragging = false;
          if (hasDragged) suppressClickUntil = Date.now() + 300;
          hasDragged = false;
          this.applyTrackTransform(this.trackIndex, true);
          this.startAutoAdvance();
          return;
        }
      }

      if (dragAxis === 'x') {
        dragDeltaX = dx;
        track.style.transition = 'none';
        track.style.transform = `translate3d(${dragBaseX + dx}px, 0, 0)`;
      }
    }, { passive: true });

    const finishPointerDrag = (e) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      activePointerId = null;
      this.isDragging = false;

      if (hasDragged) {
        suppressClickUntil = Date.now() + 300;
      }

      if (dragAxis === 'x') {
        const step = this.getStepWidth();
        const elapsed = Math.max(1, Date.now() - startTime);
        const isQuickFlick = Math.abs(dragDeltaX) > 30 && elapsed < 280;
        const threshold = step > 0 ? step * 0.18 : 50;
        let deltaSlides = 0;

        if (step > 0 && (Math.abs(dragDeltaX) >= threshold || isQuickFlick)) {
          const rawSlides = -dragDeltaX / step;
          deltaSlides = Math.abs(rawSlides) < 1 ? (dragDeltaX < 0 ? 1 : -1) : Math.round(rawSlides);
          deltaSlides = Math.max(-4, Math.min(4, deltaSlides));
        }
        this.goToTrackIndex(this.trackIndex + deltaSlides, true);
      } else {
        this.applyTrackTransform(this.trackIndex, true);
      }

      hasDragged = false;
      dragAxis = null;
      dragDeltaX = 0;
      this.startAutoAdvance();
    };

    addGlobalListener(window, 'pointerup', finishPointerDrag, { passive: true });
    addGlobalListener(window, 'pointercancel', finishPointerDrag, { passive: true });

    // Re-align slide offset on viewport resize
    addGlobalListener(window, 'resize', () => {
      this.applyTrackTransform(this.trackIndex, false);
    }, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        if (!this.isDragging) {
          this.applyTrackTransform(this.trackIndex, false);
        }
      });
      ro.observe(viewport);
      this.boundCleanupHandlers.push(() => ro.disconnect());
    }

    // Pause cleanly when page/tab is hidden and resume when visible again
    addGlobalListener(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoAdvance();
      } else {
        this.applyTrackTransform(this.trackIndex, false);
        this.startAutoAdvance();
      }
    });

    // Keyboard arrow support when focus is inside the carousel
    shell.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sound.playClick();
        this.stepBy(-1);
        this.startAutoAdvance();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        sound.playClick();
        this.stepBy(1);
        this.startAutoAdvance();
      }
    });

    const triggerDishOpen = (card) => {
      sound.playPick();
      const dishId = card.getAttribute('data-dish-id');
      const dish = this.dishes.find((d) => d.id === dishId);
      if (dish && typeof this.options.onDishClick === 'function') {
        this.options.onDishClick(dish);
      }
    };

    // Dish photo click & keyboard handler
    this.container.querySelectorAll('.food-ticker-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (hasDragged || Date.now() < suppressClickUntil) {
          return;
        }
        triggerDishOpen(card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerDishOpen(card);
        }
      });
    });
  }
}
