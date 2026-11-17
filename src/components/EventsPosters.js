import { activeEvents, passedEvents } from '../data/eventsData.js';
import { sound } from '../utils/audio.js';

const AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD_PX = 42;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Single centered poster carousel with strict slide order:
 * active posters -> editorial stub -> passed posters.
 * Auto-advances every 4s ONLY across active posters.
 */
export class EventsPosters {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.options = options;
    this.activeCount = activeEvents.length;
    this.passedCount = passedEvents.length;
    this.slides = this.buildSlides();
    this.currentIndex = 0;
    this.autoTimer = null;
    this.isHovered = false;
    this.isTouching = false;
    this.abortController = null;
  }

  buildSlides() {
    const stubSlide = {
      id: 'events-archive-stub',
      type: 'stub',
    };

    return [
      ...activeEvents.map((evt) => ({ ...evt, type: 'active' })),
      stubSlide,
      ...passedEvents.map((evt) => ({ ...evt, type: 'passed' })),
    ];
  }

  mount() {
    if (!this.container) return;
    this.destroy();
    this.abortController = new AbortController();
    this.slides = this.buildSlides();
    this.activeCount = activeEvents.length;
    this.passedCount = passedEvents.length;
    this.currentIndex = 0;

    this.render();
    this.attachEvents();
    this.updateUI({ immediate: true });
    this.syncAutoAdvance();
  }

  destroy() {
    this.clearAutoAdvance();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  isActiveSlide(index = this.currentIndex) {
    return this.activeCount > 0 && index >= 0 && index < this.activeCount;
  }

  clearAutoAdvance() {
    if (this.autoTimer !== null) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  syncAutoAdvance() {
    this.clearAutoAdvance();
    if (!this.isActiveSlide(this.currentIndex)) return;
    if (this.isHovered || this.isTouching) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    this.autoTimer = setInterval(() => {
      if (!this.isActiveSlide(this.currentIndex) || this.isHovered || this.isTouching) {
        this.clearAutoAdvance();
        return;
      }
      const nextActiveIndex = (this.currentIndex + 1) % this.activeCount;
      this.goToSlide(nextActiveIndex, { fromAuto: true });
    }, AUTO_ADVANCE_MS);
  }

  renderSlide(slide, idx) {
    if (slide.type === 'stub') {
      const nextPassedBtn = this.passedCount > 0
        ? `
          <button
            type="button"
            data-stub-action="next-passed"
            class="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-red-600 text-white font-mono-tech text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-sm cursor-pointer active:scale-[0.98]"
          >
            Посмотреть прошедшие →
          </button>
        `
        : '';

      const backActiveBtn = this.activeCount > 0
        ? `
          <button
            type="button"
            data-stub-action="back-active"
            class="w-full py-2.5 px-4 rounded-xl bg-white/85 hover:bg-white text-neutral-800 border border-black/15 font-mono-tech text-xs font-bold tracking-wide transition-colors cursor-pointer active:scale-[0.98]"
          >
            ← К актуальным
          </button>
        `
        : '';

      return `
        <div class="event-slide w-full shrink-0 flex items-center justify-center" data-slide-index="${idx}" data-slide-type="stub">
          <div class="w-full aspect-[896/1280] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#fbf8f1] via-[#f7f2e7] to-[#efe7d6] text-[#110c0d] border border-black/10 p-5 sm:p-8 flex flex-col justify-between text-center select-none">
            <div class="flex flex-col items-center gap-2 pt-1">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-mono-tech font-bold uppercase tracking-widest text-neutral-600">
                <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                АФИША SHRIMP PUB
              </span>
              <div class="w-12 h-px bg-black/15 mt-1.5"></div>
            </div>

            <div class="my-auto px-1 flex flex-col items-center">
              <div class="text-[10px] sm:text-xs font-mono-tech uppercase tracking-[0.2em] text-red-600 font-bold mb-3">
                Архив событий
              </div>
              <p class="text-[15px] sm:text-lg font-black font-unbounded leading-snug tracking-tight text-neutral-900">
                «Актуальные мероприятия кончились, но вы можете посмотреть прошедшие»
              </p>
              <div class="w-14 h-0.5 bg-red-600/75 rounded-full mt-5"></div>
            </div>

            <div class="flex flex-col gap-2 pb-1">
              ${nextPassedBtn}
              ${backActiveBtn}
            </div>
          </div>
        </div>
      `;
    }

    const isPassed = slide.type === 'passed';
    const passedBadge = isPassed
      ? `
        <span class="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 px-3 py-1 rounded-full bg-neutral-950/85 backdrop-blur-md text-white border border-white/25 text-[10px] sm:text-[11px] font-mono-tech font-extrabold uppercase tracking-widest pointer-events-none select-none">
          ПРОШЕЛ
        </span>
      `
      : '';

    return `
      <div class="event-slide w-full shrink-0 flex items-center justify-center" data-slide-index="${idx}" data-slide-type="${escapeHtml(slide.type)}">
        <div
          class="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden"
          style="aspect-ratio: ${slide.width} / ${slide.height};"
        >
          <img
            src="./${escapeHtml(slide.image)}"
            alt="${escapeHtml(slide.alt || slide.title)}"
            width="${slide.width}"
            height="${slide.height}"
            loading="${idx === 0 ? 'eager' : 'lazy'}"
            decoding="async"
            draggable="false"
            class="w-full h-full object-cover block select-none pointer-events-none"
          />
          ${passedBadge}
        </div>
      </div>
    `;
  }

  render() {
    const slidesHtml = this.slides.map((slide, idx) => this.renderSlide(slide, idx)).join('');
    const dotsHtml = this.slides
      .map((slide, idx) => `
        <button
          type="button"
          class="events-dot h-2 rounded-full transition-all duration-300 cursor-pointer"
          data-dot-index="${idx}"
          aria-label="Перейти к слайду ${idx + 1}"
        ></button>
      `)
      .join('');

    this.container.innerHTML = `
      <div class="w-full relative">
        <!-- Section Header -->
        <div class="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-6 pb-3 border-b border-black/10">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge-asterisk !w-3.5 !h-3.5 !text-[8px]">*</span>
              <span class="text-[10px] sm:text-xs font-mono-tech uppercase font-bold tracking-widest text-red-600">
                АФИША СОБЫТИЙ
              </span>
            </div>
            <h2 class="text-base sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-tight font-unbounded">
              НАШИ МЕРОПРИЯТИЯ <span class="headline-capsule">EVENTS</span>
            </h2>
          </div>

          <span
            id="events-status-pill"
            class="px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider border"
          ></span>
        </div>

        <!-- Centered Single-Poster Carousel -->
        <div
          id="events-carousel-region"
          class="w-full flex flex-col items-center outline-none"
          tabindex="0"
          aria-roledescription="carousel"
          aria-label="Афиша мероприятий ShrimpPub"
        >
          <div class="w-full flex items-center justify-center gap-3 sm:gap-6">
            <!-- Desktop Left Arrow -->
            <button
              type="button"
              id="events-posters-prev"
              class="hidden sm:flex shrink-0 w-11 h-11 rounded-full bg-white hover:bg-black text-neutral-900 hover:text-white border border-black/15 items-center justify-center transition-all text-base font-bold shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-neutral-900"
              aria-label="Предыдущий слайд"
            >
              ←
            </button>

            <!-- Viewport: ONE complete centered poster at a time -->
            <div
              id="events-posters-viewport"
              class="w-full max-w-[336px] sm:max-w-[406px] rounded-2xl sm:rounded-3xl overflow-hidden select-none"
              style="touch-action: pan-y;"
            >
              <div
                id="events-posters-track"
                class="flex transition-transform duration-500 ease-out will-change-transform"
                style="transform: translateX(0%);"
              >
                ${slidesHtml}
              </div>
            </div>

            <!-- Desktop Right Arrow -->
            <button
              type="button"
              id="events-posters-next"
              class="hidden sm:flex shrink-0 w-11 h-11 rounded-full bg-white hover:bg-black text-neutral-900 hover:text-white border border-black/15 items-center justify-center transition-all text-base font-bold shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-neutral-900"
              aria-label="Следующий слайд"
            >
              →
            </button>
          </div>

          <!-- Bottom Controls: Mobile Arrows + Slide Dots + Step Indicator -->
          <div class="mt-2 sm:mt-3 flex items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              id="events-posters-prev-mobile"
              class="sm:hidden w-9 h-9 rounded-full bg-neutral-100 hover:bg-black hover:text-white border border-black/15 text-neutral-900 flex items-center justify-center text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Предыдущий слайд"
            >
              ←
            </button>

            <div id="events-posters-dots" class="flex items-center gap-2">
              ${dotsHtml}
            </div>

            <span
              id="events-posters-counter"
              class="px-2.5 py-1 rounded-full bg-neutral-100 border border-black/10 text-neutral-800 font-mono-tech text-[11px] font-bold tracking-wider"
            ></span>

            <button
              type="button"
              id="events-posters-next-mobile"
              class="sm:hidden w-9 h-9 rounded-full bg-neutral-100 hover:bg-black hover:text-white border border-black/15 text-neutral-900 flex items-center justify-center text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Следующий слайд"
            >
              →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  goToSlide(targetIndex, { immediate = false, fromAuto = false } = {}) {
    const clamped = Math.max(0, Math.min(targetIndex, this.slides.length - 1));
    this.currentIndex = clamped;
    this.updateUI({ immediate });
    if (!fromAuto) {
      this.syncAutoAdvance();
    }
  }

  updateUI({ immediate = false } = {}) {
    const track = this.container.querySelector('#events-posters-track');
    const counter = this.container.querySelector('#events-posters-counter');
    const statusPill = this.container.querySelector('#events-status-pill');
    const prevButtons = this.container.querySelectorAll('#events-posters-prev, #events-posters-prev-mobile');
    const nextButtons = this.container.querySelectorAll('#events-posters-next, #events-posters-next-mobile');
    const dots = this.container.querySelectorAll('.events-dot');

    if (track) {
      track.style.transition = immediate ? 'none' : '';
      track.style.transform = `translate3d(-${this.currentIndex * 100}%, 0, 0)`;
    }

    if (counter) {
      counter.textContent = `${String(this.currentIndex + 1).padStart(2, '0')} / ${String(this.slides.length).padStart(2, '0')}`;
    }

    const currentSlide = this.slides[this.currentIndex];
    if (statusPill && currentSlide) {
      if (currentSlide.type === 'active') {
        statusPill.textContent = 'Актуальное';
        statusPill.className = 'px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider border bg-red-50 text-red-700 border-red-200';
      } else if (currentSlide.type === 'stub') {
        statusPill.textContent = 'Архив';
        statusPill.className = 'px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider border bg-neutral-100 text-neutral-700 border-black/10';
      } else {
        statusPill.textContent = 'Прошедшее';
        statusPill.className = 'px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider border bg-neutral-900 text-white border-neutral-900';
      }
    }

    const atStart = this.currentIndex <= 0;
    const atEnd = this.currentIndex >= this.slides.length - 1;
    prevButtons.forEach((btn) => {
      btn.disabled = atStart;
    });
    nextButtons.forEach((btn) => {
      btn.disabled = atEnd;
    });

    dots.forEach((dot, idx) => {
      const slide = this.slides[idx];
      const isSelected = idx === this.currentIndex;
      if (isSelected) {
        const activeClass = slide && slide.type === 'active' ? 'bg-red-600' : 'bg-neutral-900';
        dot.className = `events-dot h-2 w-6 rounded-full transition-all duration-300 cursor-pointer ${activeClass}`;
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.className = 'events-dot h-2 w-2 rounded-full bg-neutral-300 hover:bg-neutral-500 transition-all duration-300 cursor-pointer';
        dot.removeAttribute('aria-current');
      }
    });
  }

  attachEvents() {
    const signal = this.abortController ? this.abortController.signal : undefined;
    const viewport = this.container.querySelector('#events-posters-viewport');
    const track = this.container.querySelector('#events-posters-track');
    const region = this.container.querySelector('#events-carousel-region');
    const prevButtons = this.container.querySelectorAll('#events-posters-prev, #events-posters-prev-mobile');
    const nextButtons = this.container.querySelectorAll('#events-posters-next, #events-posters-next-mobile');
    const dots = this.container.querySelectorAll('.events-dot');

    prevButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.currentIndex <= 0) return;
        sound.playClick();
        this.goToSlide(this.currentIndex - 1);
      }, { signal });
    });

    nextButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.currentIndex >= this.slides.length - 1) return;
        sound.playClick();
        this.goToSlide(this.currentIndex + 1);
      }, { signal });
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.dotIndex);
        if (Number.isNaN(target) || target === this.currentIndex) return;
        sound.playClick();
        this.goToSlide(target);
      }, { signal });
    });

    this.container.querySelectorAll('[data-stub-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.stubAction;
        sound.playClick();
        if (action === 'next-passed' && this.passedCount > 0) {
          this.goToSlide(this.activeCount + 1);
        } else if (action === 'back-active' && this.activeCount > 0) {
          this.goToSlide(0);
        }
      }, { signal });
    });

    if (region) {
      region.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.clearAutoAdvance();
      }, { signal });

      region.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.syncAutoAdvance();
      }, { signal });

      region.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && this.currentIndex > 0) {
          e.preventDefault();
          sound.playClick();
          this.goToSlide(this.currentIndex - 1);
        } else if (e.key === 'ArrowRight' && this.currentIndex < this.slides.length - 1) {
          e.preventDefault();
          sound.playClick();
          this.goToSlide(this.currentIndex + 1);
        }
      }, { signal });
    }

    if (viewport && track) {
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let tracking = false;
      let swipeMode = null; // null | 'horizontal' | 'vertical'

      const finishTouch = () => {
        if (!tracking) return;
        tracking = false;
        const wasHorizontal = swipeMode === 'horizontal';
        swipeMode = null;

        track.style.transition = '';
        if (wasHorizontal && Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
          if (deltaX < 0 && this.currentIndex < this.slides.length - 1) {
            sound.playClick();
            this.currentIndex += 1;
          } else if (deltaX > 0 && this.currentIndex > 0) {
            sound.playClick();
            this.currentIndex -= 1;
          }
        }
        deltaX = 0;
        this.isTouching = false;
        this.updateUI();
        this.syncAutoAdvance();
      };

      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        tracking = true;
        swipeMode = null;
        this.isTouching = true;
        this.clearAutoAdvance();
      }, { passive: true, signal });

      viewport.addEventListener('touchmove', (e) => {
        if (!tracking || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        if (swipeMode === null) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          swipeMode = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
        }

        if (swipeMode === 'vertical') return;

        e.preventDefault();
        deltaX = dx;
        // Subtle edge resistance on first/last slide
        const atEdge = (this.currentIndex === 0 && dx > 0) || (this.currentIndex === this.slides.length - 1 && dx < 0);
        const offsetPx = atEdge ? dx * 0.28 : dx;
        track.style.transition = 'none';
        track.style.transform = `translate3d(calc(-${this.currentIndex * 100}% + ${offsetPx}px), 0, 0)`;
      }, { passive: false, signal });

      viewport.addEventListener('touchend', finishTouch, { passive: true, signal });
      viewport.addEventListener('touchcancel', finishTouch, { passive: true, signal });
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.clearAutoAdvance();
        } else {
          this.syncAutoAdvance();
        }
      }, { signal });
    }
  }
}
