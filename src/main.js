import './style.css';
import { draftBeerData } from './data/beerData.js';
import { menuCategories } from './data/fullMenuData.js';
import { reviewsData, yandexPubInfo } from './data/reviewsData.js';
import { CaptchaGame } from './components/CaptchaModal.js';
import { HalftoneCanvas } from './components/HalftoneCanvas.js';
import { FoodTicker } from './components/FoodTicker.js';
import { PubHistoryBook } from './components/PubHistoryBook.js';
import { EventsPosters } from './components/EventsPosters.js';
import { AtmosphereGallery } from './components/AtmosphereGallery.js';
import { MorecambeTracker } from './components/MorecambeTracker.js';
import { TrailerModal } from './components/TrailerModal.js';
import { VinylPlayer } from './components/VinylPlayer.js';
import { sound } from './utils/audio.js';
import { initMetrika } from './utils/metrika.js';
import { initScrollReveals } from './utils/scrollReveals.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';

initMetrika();

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,resize',
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Global state
let currentCategory = 'draft';
let currentCategoryIndex = 0;
let currentStoryIndex = 0;
let currentEventIndex = 0;
let currentSubfilter = 'all';
let isMenuExpanded = false;
const categoryExpandedState = {};
let isReviewsExpanded = false;
let currentCarouselIndex = 0;
let carouselTimer = null;
let isCarouselHovered = false;
let lenis = null;
let halftoneCanvas = null;
let suppressMenuCardClickUntil = 0;
let dishHighlightTimeout = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis 60fps Smooth Scroll
  initSmoothScroll();

  // 2. Initialize Kinetic Halftone Dot Matrix Red & Black Canvas
  halftoneCanvas = new HalftoneCanvas('beer-atmosphere-canvas');

  // 3. 3D Mouse Parallax on Hero Mascot Shrimp
  initShrimpParallax();

  // 4. Kinetic Odometers for Hero Stats
  initStatsOdometers();

  // 5. Trailer & Choice Modal
  const trailerModal = new TrailerModal({
    vkVideoUrl: 'https://vkvideo.ru/video_ext.php?oid=200001415193&id=456239017&hash=f5a29f9fda8282d1&hd=3&autoplay=1',
    localFallbackVideo: './atmos_video_05.mp4',
    onEnterSite: () => {
      initScrollReveals(document.getElementById('smooth-content'));
      ScrollTrigger.refresh();
    }
  });

  // Captcha Puzzle Mini-game Mount -> triggers trailer choice on solve/skip
  const captchaMount = document.getElementById('captcha-mount');
  const captcha = new CaptchaGame(() => {
    trailerModal.showChoice();
  });
  captcha.mount(captchaMount);

  // Global event delegation for re-watching trailer (Nav, Drawer, Atmosphere)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#btn-open-pub-trailer, #btn-nav-trailer, #btn-drawer-trailer');
    if (trigger) {
      e.preventDefault();
      try { sound.playClick(); } catch (_) {}
      if (trigger.id === 'btn-drawer-trailer') {
        const mobileDrawer = document.getElementById('mobile-nav-drawer');
        if (mobileDrawer) {
          mobileDrawer.classList.remove('opacity-100', 'pointer-events-auto');
          mobileDrawer.classList.add('opacity-0', 'pointer-events-none');
          document.body.style.overflow = '';
        }
      }
      trailerModal.openPlayer();
    }
  });



  // 7. Sound & Background Music toggle (Desktop & Mobile Drawer)
  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const drawerSoundBtn = document.getElementById('btn-drawer-sound');
  const drawerSoundIcon = document.getElementById('drawer-sound-icon');
  const drawerSoundState = document.getElementById('drawer-sound-state');

  function updateSoundUI(state) {
    if (soundIcon) {
      soundIcon.innerHTML = state.muted ? '<svg class="w-4 h-4 fill-current text-neutral-500" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>' : '<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    }
    if (soundBtn) {
      soundBtn.title = state.muted 
        ? 'Включить фоновую музыку и звуки' 
        : `Фоновая музыка: ${state.trackTitle} (Клик — пауза)`;
      if (!state.muted && state.isMusicPlaying) {
        soundBtn.classList.add('border-red-500/50', 'text-red-400');
        soundBtn.classList.remove('border-white/8', 'text-neutral-300');
      } else {
        soundBtn.classList.remove('border-red-500/50', 'text-red-400');
        soundBtn.classList.add('border-white/8', 'text-neutral-300');
      }
    }
    if (drawerSoundIcon && drawerSoundState) {
      drawerSoundIcon.innerHTML = state.muted ? '<svg class="w-4 h-4 fill-current text-neutral-500" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>' : '<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
      drawerSoundState.textContent = state.muted ? 'ВЫКЛ' : 'ВКЛ';
      if (state.muted) {
        drawerSoundState.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-neutral-400 border border-white/10';
      } else {
        drawerSoundState.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-400 border border-red-500/30';
      }
    }
  }

  sound.onStateChange(updateSoundUI);

  const handleSoundToggle = () => {
    const isMuted = sound.toggleMute();
    if (isMuted) {
      showToast('МУЗЫКА НА ПАУЗЕ');
    } else {
      sound.playClick();
      showToast(`${sound.trackTitle || "You'll Never Walk Alone"} — В эфире`);
    }
  };

  if (soundBtn) {
    soundBtn.addEventListener('click', handleSoundToggle);
  }

  if (drawerSoundBtn) {
    drawerSoundBtn.addEventListener('click', handleSoundToggle);
  }

  // 8. Delivery & Pickup buttons
  const closedLockModalSvg = `
    <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
      <svg class="w-9 h-9 text-slate-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" stroke="#f1f5f9" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="4" y="10" width="16" height="12" rx="3" fill="#cbd5e1" stroke="#f8fafc" stroke-width="1.5"/>
        <circle cx="12" cy="15" r="1.5" fill="#0f172a"/>
        <path d="M12 16.5V18.5" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </div>
  `;

  const halfOpenLockModalSvg = `
    <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
      <svg class="w-9 h-9 text-slate-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 5C7 3.34315 8.34315 2 10 2C11.6569 2 13 3.34315 13 5V10" stroke="#f1f5f9" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="4" y="10" width="16" height="12" rx="3" fill="#cbd5e1" stroke="#f8fafc" stroke-width="1.5"/>
        <circle cx="12" cy="15" r="1.5" fill="#0f172a"/>
        <path d="M12 16.5V18.5" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </div>
  `;

  const deliveryBtn = document.getElementById('btn-delivery-lock');
  if (deliveryBtn) {
    deliveryBtn.addEventListener('click', () => {
      sound.playClick();
      openInfoModal(
        closedLockModalSvg,
        'ДОСТАВКА ПОКА НЕДОСТУПНА',
        'Мы тщательно прорабатываем термоупаковку для крафта и логистику горячих блюд. Совсем скоро доставка появится в вашем районе!'
      );
    });
  }

  const pickupBtn = document.getElementById('btn-pickup-halflock');
  if (pickupBtn) {
    pickupBtn.addEventListener('click', () => {
      sound.playClick();
      openInfoModal(
        halfOpenLockModalSvg,
        'САМОВЫВОЗ СКОРО',
        'Сервис быстрого самовывоза сейчас находится на финальной стадии настройки. Совсем скоро вы сможете оформлять предзаказ прямо с сайта и забирать свежий холодный розлив без очереди!'
      );
    });
  }



  // 8b. Mobile Navigation Drawer & Hamburger Toggle
  const mobileToggle = document.getElementById('btn-mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileClose = document.getElementById('btn-close-mobile-menu');

  function openMobileMenu() {
    sound.playClick();
    if (mobileToggle) mobileToggle.classList.add('is-active');
    if (mobileDrawer) {
      mobileDrawer.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      gsap.fromTo(
        mobileDrawer.querySelectorAll('nav a, .border-t > *'),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out', overwrite: 'auto' }
      );
    }
    if (lenis) lenis.stop();
  }

  function closeMobileMenu() {
    sound.playClick();
    if (mobileToggle) mobileToggle.classList.remove('is-active');
    if (mobileDrawer) {
      mobileDrawer.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    }
    if (lenis) lenis.start();
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileMenu);
  }

  // Mobile nav links: close drawer and smoothly scroll with Lenis
  document.querySelectorAll('[data-mobile-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      closeMobileMenu();
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target && lenis) {
          const offset = window.innerWidth <= 768 ? -55 : -70;
          lenis.scrollTo(target, { offset, duration: 0.9 });
        }
      }
    });
  });

  // Drawer delivery & pickup buttons
  const drawerDelivery = document.getElementById('btn-drawer-delivery');
  if (drawerDelivery) {
    drawerDelivery.addEventListener('click', () => {
      closeMobileMenu();
      sound.playClick();
      openInfoModal(
        closedLockModalSvg,
        'ДОСТАВКА ПОКА НЕДОСТУПНА',
        'Мы тщательно прорабатываем термоупаковку для крафта и логистику горячих блюд. Совсем скоро доставка появится в вашем районе!'
      );
    });
  }

  const drawerPickup = document.getElementById('btn-drawer-pickup');
  if (drawerPickup) {
    drawerPickup.addEventListener('click', () => {
      closeMobileMenu();
      sound.playClick();
      openInfoModal(
        halfOpenLockModalSvg,
        'САМОВЫВОЗ СКОРО',
        'Сервис быстрого самовывоза сейчас находится на финальной стадии настройки. Совсем скоро вы сможете оформлять предзаказ прямо с сайта и забирать свежий холодный розлив без очереди!'
      );
    });
  }



  // 8c. Subtle tactile bounce on Mascot Shrimps (no quote popups/toasts)
  const peekingShrimp = document.getElementById('menu-peeking-shrimp');
  if (peekingShrimp) {
    peekingShrimp.addEventListener('click', () => {
      const img = peekingShrimp.querySelector('.peeking-shrimp-img');
      if (img) {
        gsap.timeline()
          .to(img, { scale: 1.08, rotate: -4, duration: 0.14, ease: 'back.out(2)' })
          .to(img, { rotate: 4, duration: 0.12 })
          .to(img, { scale: 1, rotate: 0, duration: 0.24, ease: 'power2.out' });
      }
    });
  }

  const topShrimp = document.getElementById('menu-top-shrimp');
  if (topShrimp) {
    topShrimp.addEventListener('click', () => {
      const img = topShrimp.querySelector('.mobile-top-shrimp-img');
      if (img) {
        gsap.timeline()
          .to(img, { scale: 1.08, y: -6, duration: 0.14, ease: 'back.out(2)' })
          .to(img, { y: 2, duration: 0.12 })
          .to(img, { scale: 1, y: 0, duration: 0.24, ease: 'power2.out' });
      }
    });
  }

  const heroShrimpImg = document.getElementById('hero-shrimp-img');
  if (heroShrimpImg) {
    heroShrimpImg.addEventListener('click', () => {
      gsap.timeline()
        .to(heroShrimpImg, { scale: 1.04, rotate: -2, duration: 0.16, ease: 'back.out(2)' })
        .to(heroShrimpImg, { rotate: 2, duration: 0.14 })
        .to(heroShrimpImg, { scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out' });
    });
  }

  // 9. Navigation tab switches
  document.querySelectorAll('[data-tab-trigger]').forEach(link => {
    link.addEventListener('click', () => {
      const tab = link.dataset.tabTrigger;
      if (tab === 'draft') {
        switchCategory(tab);
      } else if (tab === 'shrimp') {
        openInfoModal(
          '<svg class="w-8 h-8 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>',
          'ШРИМПЫ & КУХНЯ ГОТОВЯТСЯ К СТАРТУ!',
          'Шеф лично тестирует тигровые креветки в соусе Sweet Chili и топит чесночное масло. Основная кухня откроется со дня на день — пока разминайтесь свежим крафтом!'
        );
      }
    });
  });

  // 10. Horizontal Swiper Menu across all 13 categories
  initMenuSwiper();

  // 10b. Infinite Marquee Food Ticker at bottom of Menu Deck
  const foodTicker = new FoodTicker('menu-food-marquee', {
    onDishClick: (dish) => {
      openDishModal(dish.menuCategoryId, dish.menuItemId);
    }
  });
  foodTicker.mount();

  // 10c. Interactive Pub History Book
  const historyBook = new PubHistoryBook('pub-history-book-mount');
  historyBook.mount();

  // 10d. Events 9:16 Vertical Posters Carousel
  const eventsPosters = new EventsPosters('events-posters-mount');
  eventsPosters.mount();

  // 10e. Atmosphere Ticker & Fullscreen Photo Gallery Modal
  const atmosphereGallery = new AtmosphereGallery('atmosphere-deck-mount', 'atmosphere-gallery-modal-root');
  atmosphereGallery.mount();

  // 10e-2. Pub Vinyl Playlist Turntable
  const vinylPlayer = new VinylPlayer('playlist-deck-mount');
  vinylPlayer.mount();

  // 10f. Morecambe F.C. Match Tracker
  const morecambeTracker = new MorecambeTracker('morecambe-mount');
  morecambeTracker.mount();

  // 11. Draft Sub-filters
  document.querySelectorAll('[data-filter-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      document.querySelectorAll('[data-filter-style]').forEach(b => {
        b.classList.remove('bg-black', 'text-white');
        b.classList.add('bg-neutral-200/80', 'text-neutral-800');
      });
      btn.classList.add('bg-black', 'text-white');
      btn.classList.remove('bg-neutral-200/80', 'text-neutral-800');
      currentSubfilter = btn.dataset.filterStyle;
      renderDraftBeerCards();
    });
  });

  // 14. Vinyl Card sound feedback
  const vinylCard = document.getElementById('card-vinyl');
  if (vinylCard) {
    vinylCard.addEventListener('mouseenter', () => {
      sound.playClick();
    });
    vinylCard.addEventListener('click', () => {
      if (sound.muted) {
        sound.toggleMute();
      } else {
        sound.playClick();
      }
      showToast('В эфире ShrimpPub: Gerry & The Pacemakers — You\'ll Never Walk Alone');
    });
  }

  // 15. Reviews Animated Carousel Controls & Auto-advance (4s pause per review)
  const prevReviewBtn = document.getElementById('btn-reviews-prev');
  const nextReviewBtn = document.getElementById('btn-reviews-next');
  const toggleMoreReviewsBtn = document.getElementById('btn-toggle-more-reviews');
  const reviewsCarouselWrapper = document.getElementById('reviews-carousel-wrapper');

  if (prevReviewBtn) {
    prevReviewBtn.addEventListener('click', () => {
      sound.playClick();
      prevCarouselSlide();
      startCarouselTimer();
    });
  }

  if (nextReviewBtn) {
    nextReviewBtn.addEventListener('click', () => {
      sound.playClick();
      nextCarouselSlide();
      startCarouselTimer();
    });
  }

  if (toggleMoreReviewsBtn) {
    toggleMoreReviewsBtn.addEventListener('click', () => {
      sound.playClick();
      isReviewsExpanded = !isReviewsExpanded;
      currentCarouselIndex = 0;
      renderReviewsCarousel();

      const btnText = document.getElementById('btn-toggle-more-reviews-text');
      const btnIcon = document.getElementById('btn-toggle-more-reviews-icon');
      if (btnText) {
        btnText.textContent = isReviewsExpanded ? 'СВЕРНУТЬ ДО 3 ОТЗЫВОВ' : 'ПОКАЗАТЬ БОЛЬШЕ ОТЗЫВОВ';
      }
      if (btnIcon) {
        btnIcon.textContent = isReviewsExpanded ? '↑' : '↓';
      }

      if (!isReviewsExpanded && lenis) {
        lenis.scrollTo('#reviews-deck', { offset: -50, duration: 0.8 });
      }
    });
  }

  if (reviewsCarouselWrapper) {
    reviewsCarouselWrapper.addEventListener('mouseenter', () => {
      isCarouselHovered = true;
    });
    reviewsCarouselWrapper.addEventListener('mouseleave', () => {
      isCarouselHovered = false;
      startCarouselTimer();
    });
    reviewsCarouselWrapper.addEventListener('touchstart', () => {
      isCarouselHovered = true;
    }, { passive: true });
    reviewsCarouselWrapper.addEventListener('touchend', () => {
      setTimeout(() => {
        isCarouselHovered = false;
        startCarouselTimer();
      }, 2500);
    }, { passive: true });
  }

  // Initial Reviews render and start 4-second carousel timer
  renderReviewsCarousel();
  startCarouselTimer();

  // 16. Write Review Button
  const writeReviewBtn = document.getElementById('btn-write-review');
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', () => {
      sound.playClick();
      openInfoModal(
        '<svg class="w-8 h-8 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
        'НАПИШИТЕ ОТЗЫВ НА ЯНДЕКС КАРТАХ',
        'Мы очень ценим ваше мнение! Перейдите на страницу паба в Яндекс Картах и поделитесь своими впечатлениями. Бармен передаст вам комплимент при следующем визите!'
      );
      const actionBtn = document.getElementById('modal-action-btn');
      if (actionBtn) {
        actionBtn.textContent = 'Перейти в Яндекс Карты ↗';
        actionBtn.onclick = () => {
          window.open(yandexPubInfo.yandexUrl, '_blank');
          closeInfoModal();
        };
      }
    });
  }

  // 17. Booking slider & submit
  const guestSlider = document.getElementById('guest-slider');
  const guestLabel = document.getElementById('guest-count-label');
  if (guestSlider && guestLabel) {
    guestSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      sound.playClick();
      let desc = '';
      if (val === 1) desc = '1 персона (Интроверт с IPA — никто не посягнет на твои гренки)';
      else if (val === 2) desc = '2 персоны (Романтический дуэт — она оценит вишневый Kriek)';
      else if (val <= 4) desc = `${val} персоны (Совет директоров по дегустации хмеля)`;
      else if (val <= 6) desc = `${val} персон (Шримповый спецназ — бармен уже охлаждает гроулеры)`;
      else desc = `${val} персон (Стая креветок — главное: никакого вареного укропа!)`;
      guestLabel.textContent = desc;
    });
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playBeerVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#ff1e27', '#ffffff', '#f59e0b']
        });
      } catch (err) {}
      openInfoModal(
        '<svg class="w-8 h-8 text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        'СТОЛИК ЗАБРОНИРОВАН!',
        'Спасибо! Ваша бронь принята. Бармен свяжется с вами по указанному телефону в течение 10 минут. До скорой встречи в ShrimpPub!'
      );
      bookingForm.reset();
    });
  }

  // 18. Modal Close (Info Modal & Dish Detail Modal)
  const modalClose = document.getElementById('modal-close');
  const modalActionBtn = document.getElementById('modal-action-btn');
  const infoModal = document.getElementById('info-modal');
  if (modalClose) modalClose.addEventListener('click', closeInfoModal);
  if (modalActionBtn) modalActionBtn.addEventListener('click', closeInfoModal);
  if (infoModal) {
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) closeInfoModal();
    });
  }

  const dishModal = document.getElementById('dish-detail-modal');
  const dishModalClose = document.getElementById('dish-modal-close');
  if (dishModalClose) dishModalClose.addEventListener('click', closeDishModal);
  if (dishModal) {
    dishModal.addEventListener('click', (e) => {
      if (e.target === dishModal) closeDishModal();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModal();
      closeInfoModal();
    }
  });

  // 19. Smooth scroll for all hash links with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target && lenis) {
          e.preventDefault();
          try { sound.playClick(); } catch (err) {}
          lenis.scrollTo(target, { offset: -70, duration: 0.9 });
        }
      }
    });
  });

  initHeroScrollParallax();
});

// Initialize Lenis Smooth Scroll (60fps synced with GSAP)
function initSmoothScroll() {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });
  window.__shrimpLenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// 3D Mouse Parallax on Mascot Shrimp
function initShrimpParallax() {
  const shrimp = document.getElementById('hero-shrimp-img');
  if (!shrimp || reducedMotion.matches) return;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || window.scrollY > window.innerHeight) return;
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    gsap.to(shrimp, {
      rotateY: nx * 14,
      rotateX: -ny * 12,
      x: nx * 18,
      y: ny * 14,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }, { passive: true });
}

// Kinetic Odometers for Hero Stats
function initStatsOdometers() {
  const cranesEl = document.getElementById('odometer-cranes');
  const ratingEl = document.getElementById('odometer-rating');
  const rating = Number(yandexPubInfo.rating);
  const ratingFormat = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  document.querySelectorAll('[data-yandex-rating]').forEach((element) => {
    element.textContent = ratingFormat.format(rating);
  });

  if (cranesEl) {
    const obj = { count: 0 };
    gsap.to(obj, {
      count: draftBeerData.length,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cranesEl,
        start: 'top 95%',
        once: true,
      },
      onUpdate: () => {
        cranesEl.textContent = Math.round(obj.count);
      }
    });
  }

  if (ratingEl) {
    const obj = { val: 0.0 };
    gsap.to(obj, {
      val: rating,
      duration: 2.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ratingEl,
        start: 'top 95%',
        once: true,
      },
      onUpdate: () => {
        ratingEl.textContent = ratingFormat.format(obj.val);
      }
    });
  }
}

function initHeroScrollParallax() {
  const hero = document.getElementById('hero');
  if (hero && !reducedMotion.matches) {
    gsap.to(hero, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      }
    });
  }
}

// ==================== UNIFIED HORIZONTAL MENU SWIPER (13 CATEGORIES) ====================
function initMenuSwiper() {
  const chipsContainer = document.getElementById('menu-quick-chips');
  const swiperViewport = document.getElementById('menu-swiper-viewport');
  const btnPrev = document.getElementById('menu-btn-prev');
  const btnNext = document.getElementById('menu-btn-next');
  const swipeHint = document.getElementById('menu-swipe-hint');
  const expandBtn = document.getElementById('btn-toggle-all-beers');

  if (!chipsContainer || !swiperViewport) return;

  // Render quick chips for all 13 categories
  chipsContainer.innerHTML = '';
  menuCategories.forEach((cat, idx) => {
    const chip = document.createElement('button');
    const isActive = idx === currentCategoryIndex;
    chip.className = `menu-pill-chip ${isActive ? 'flex active bg-black text-white' : 'hidden sm:flex bg-white text-neutral-800 hover:bg-neutral-100'} px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold font-mono-tech tracking-wider uppercase whitespace-nowrap border border-black/10 items-center gap-1.5 shrink-0 select-none`;
    chip.dataset.catIdx = idx;
    chip.innerHTML = `
      <span class="font-unbounded font-black ${isActive ? 'text-red-400' : 'text-red-600'} text-[10px] sm:text-[11px]">${cat.num}.</span>
      <span>${cat.title}</span>
      <span class="px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'} text-[9px] font-bold">${cat.badge}</span>
    `;
    chip.addEventListener('click', () => {
      sound.playClick();
      goToMenuCategory(idx, idx > currentCategoryIndex ? 'next' : 'prev');
    });
    chipsContainer.appendChild(chip);
  });

  // Expand / collapse all beers button listener
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      sound.playClick();
      isMenuExpanded = !isMenuExpanded;
      renderDraftBeerCards();
      if (!isMenuExpanded && lenis) {
        lenis.scrollTo('#menu-deck', { offset: -50, duration: 0.8 });
      }
    });
  }

  // Next / Prev Button listeners (Infinite cyclical wrap: 1 <-> 13)
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      sound.playClick();
      const prevIdx = (currentCategoryIndex - 1 + menuCategories.length) % menuCategories.length;
      goToMenuCategory(prevIdx, 'prev');
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      sound.playClick();
      const nextIdx = (currentCategoryIndex + 1) % menuCategories.length;
      goToMenuCategory(nextIdx, 'next');
    });
  }

  if (swipeHint) {
    swipeHint.addEventListener('click', () => {
      sound.playClick();
      const nextIdx = (currentCategoryIndex + 1) % menuCategories.length;
      goToMenuCategory(nextIdx, 'next');
    });
  }

  let swipe = null;
  swiperViewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || !e.isPrimary) return;
    swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: null };
  });

  swiperViewport.addEventListener('pointermove', (e) => {
    if (!swipe || e.pointerId !== swipe.id || swipe.horizontal !== null) return;
    const x = Math.abs(e.clientX - swipe.x);
    const y = Math.abs(e.clientY - swipe.y);
    if (Math.hypot(x, y) > 12) swipe.horizontal = x > y * 1.35;
  }, { passive: true });

  swiperViewport.addEventListener('pointercancel', (e) => {
    if (swipe?.id === e.pointerId) swipe = null;
  });

  swiperViewport.addEventListener('pointerup', (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const x = swipe.x - e.clientX;
    const y = swipe.y - e.clientY;
    const horizontal = swipe.horizontal;
    swipe = null;
    if (Math.hypot(x, y) > 12) suppressMenuCardClickUntil = Date.now() + 300;
    if (!horizontal || Math.abs(x) < 45 || Math.abs(x) <= Math.abs(y) * 1.35) return;

    sound.playClick();
    const delta = Math.sign(x);
    const length = menuCategories.length;
    const nextIdx = (currentCategoryIndex + delta + length) % length;
    goToMenuCategory(nextIdx, delta > 0 ? 'next' : 'prev');
  });

  // Mouse drag support for desktop (Bidirectional cyclical wrap)
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;
  swiperViewport.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
  });
  window.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const diffX = mouseStartX - e.clientX;
    const diffY = mouseStartY - e.clientY;
    if (Math.hypot(diffX, diffY) > 10) {
      suppressMenuCardClickUntil = Date.now() + 300;
    }
    if (Math.abs(diffX) > 65) {
      if (diffX > 0) {
        sound.playClick();
        const nextIdx = (currentCategoryIndex + 1) % menuCategories.length;
        goToMenuCategory(nextIdx, 'next');
      } else if (diffX < 0) {
        sound.playClick();
        const prevIdx = (currentCategoryIndex - 1 + menuCategories.length) % menuCategories.length;
        goToMenuCategory(prevIdx, 'prev');
      }
    }
  });

  // Initial render
  goToMenuCategory(0, 'next', false);
}

function goToMenuCategory(index, direction = 'next', animate = true) {
  if (index < 0 || index >= menuCategories.length) return;
  currentCategoryIndex = index;
  const cat = menuCategories[currentCategoryIndex];

  // Update Header text
  const counterEl = document.getElementById('menu-counter-indicator');
  const numEl = document.getElementById('menu-category-num');
  const titleEl = document.getElementById('menu-category-title');
  const badgeEl = document.getElementById('menu-category-badge');
  const descEl = document.getElementById('menu-category-desc');

  if (counterEl) {
    counterEl.textContent = `${String(currentCategoryIndex + 1).padStart(2, '0')} / ${String(menuCategories.length).padStart(2, '0')}`;
  }
  if (numEl) {
    numEl.textContent = `РАЗДЕЛ ${cat.num}`;
  }
  if (titleEl) {
    titleEl.textContent = cat.title.toUpperCase();
  }
  if (badgeEl) {
    badgeEl.textContent = cat.badge;
  }
  if (descEl) {
    descEl.textContent = cat.description;
  }

  // Update chips: on mobile ONLY active chip is displayed (hidden sm:flex on others)
  const chips = document.querySelectorAll('#menu-quick-chips .menu-pill-chip');
  chips.forEach((chip, idx) => {
    if (idx === currentCategoryIndex) {
      chip.className = 'menu-pill-chip flex active bg-black text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold font-mono-tech tracking-wider uppercase whitespace-nowrap border border-black items-center gap-1.5 shrink-0 select-none shadow-md';
      const strip = chip.parentElement;
      if (strip.scrollWidth > strip.clientWidth) {
        const offset = chip.getBoundingClientRect().left - strip.getBoundingClientRect().left;
        strip.scrollTo({ left: strip.scrollLeft + offset - (strip.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
      }
    } else {
      chip.className = 'menu-pill-chip hidden sm:flex bg-white text-neutral-800 hover:bg-neutral-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold font-mono-tech tracking-wider uppercase whitespace-nowrap border border-black/10 items-center gap-1.5 shrink-0 select-none';
    }
  });

  // Render active content
  renderActiveCategoryContent(false, animate, direction);
}

function renderActiveCategoryContent(isToggleAction = false, animate = true, direction = 'next') {
  const container = document.getElementById('menu-active-content');
  const beerControls = document.getElementById('draft-beer-controls');
  if (!container) return;

  const cat = menuCategories[currentCategoryIndex];

  if (cat.isBeerCategory) {
    // Show Beer Controls (subfilters + expand button)
    if (beerControls) beerControls.classList.remove('hidden');

    if (!container.querySelector('#menu-items-grid')) {
      container.innerHTML = `<div id="menu-items-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"></div>`;
    }
    renderDraftBeerCards();
  } else {
    // Hide Beer Controls for food / spirits categories
    if (beerControls) beerControls.classList.add('hidden');

    const items = cat.items || [];
    const isCatExpanded = !!categoryExpandedState[currentCategoryIndex];
    const displayItems = (!isCatExpanded && items.length > 3) ? items.slice(0, 3) : items;

    const existingGrid = isToggleAction && container.querySelector('#cat-dish-grid');
    const retainedCount = existingGrid ? Math.min(existingGrid.childElementCount, displayItems.length) : 0;
    const itemsHtml = displayItems.slice(retainedCount).map(item => {
      const badgesHtml = (item.badges || []).map(b => {
        let badgeStyle = 'bg-neutral-100 text-neutral-800';
        if (b.includes('Хит') || b.includes('Премиум') || b.includes('Шедевр') || b.includes('XXL')) {
          badgeStyle = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
        } else if (b.includes('Острое') || b.includes('Чили') || b.includes('Антипохмел')) {
          badgeStyle = 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
        }
        return `<span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono-tech ${badgeStyle} uppercase">${escapeHtml(b)}</span>`;
      }).join(' ');

      return `
        <div
          class="menu-dish-card group rounded-2xl p-4 sm:p-5 flex flex-col justify-between border select-none transition-all duration-200 hover:border-red-500/30 hover:shadow-md"
          data-category-id="${escapeHtml(cat.id)}"
          data-item-id="${escapeHtml(item.id)}"
        >
          <div>
            <!-- Top Badges & Price -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div data-reveal="badge" class="flex items-center gap-1.5 flex-wrap">
                ${badgesHtml}
                ${item.weight ? `<span class="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[9px] sm:text-[10px] font-mono-tech font-bold">${escapeHtml(item.weight)}</span>` : ''}
              </div>
              <div data-reveal="counter" class="menu-price text-sm sm:text-base font-extrabold text-red-600 shrink-0">
                ${escapeHtml(item.price)}
              </div>
            </div>

            <!-- Title -->
            <h4 data-reveal="title" class="text-sm sm:text-base font-black text-black uppercase font-unbounded tracking-tight leading-snug mb-1.5">
              ${escapeHtml(item.name)}
            </h4>

            <!-- Description / Ingredients -->
            ${item.desc ? `
              <p data-reveal="detail" class="text-[11px] sm:text-xs text-neutral-700 font-mono-tech leading-relaxed">
                ${escapeHtml(item.desc)}
              </p>
            ` : ''}
          </div>

          <!-- Bottom: Order & Freshness Bar -->
          <div data-reveal="detail" class="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono-tech">
            <span class="text-neutral-400">
              Shrimp Pub • Свежая подача
            </span>
            <span class="text-emerald-600 font-bold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              В наличии
            </span>
          </div>
        </div>
      `;
    }).join('');

    const toggleText = isCatExpanded ? 'СВЕРНУТЬ ДО 3 ПОЗИЦИЙ' : `ПОКАЗАТЬ ВСЕ ${items.length} ПОЗИЦИЙ`;
    const toggleCount = isCatExpanded ? 3 : items.length;
    const toggleBtnHtml = items.length > 3 ? `
      <div class="my-5 flex justify-center">
        <button 
          id="btn-toggle-cat-items" 
          class="btn-magnetic group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-black hover:bg-red-600 text-white font-black font-unbounded text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_30px_rgba(255,30,39,0.4)] cursor-pointer"
        >
          <svg class="w-4 h-4 fill-none stroke-current stroke-2 transition-transform duration-300 ${isCatExpanded ? 'rotate-180' : ''}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          <span data-toggle-label>${toggleText}</span>
          <span data-toggle-count class="px-2 py-0.5 rounded-full bg-red-600 group-hover:bg-white text-white group-hover:text-black text-[10px] font-mono-tech font-bold transition-colors">${toggleCount}</span>
        </button>
      </div>
    ` : '';

    if (existingGrid) {
      while (existingGrid.childElementCount > retainedCount) existingGrid.lastElementChild.remove();
      existingGrid.insertAdjacentHTML('beforeend', itemsHtml);
      const toggle = container.querySelector('#btn-toggle-cat-items');
      toggle.querySelector('[data-toggle-label]').textContent = toggleText;
      toggle.querySelector('[data-toggle-count]').textContent = toggleCount;
      toggle.querySelector('svg').classList.toggle('rotate-180', isCatExpanded);
    } else {
      container.innerHTML = `
        <div id="cat-dish-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          ${itemsHtml}
        </div>
        ${toggleBtnHtml}
      `;
    }

    // Wire click & keyboard open on photographed dish cards (ignoring swipe/drag)
    container.querySelectorAll(`.menu-dish-card[data-has-photo="1"]:nth-child(n+${retainedCount + 1})`).forEach((card) => {
      const handleCardOpen = () => {
        const categoryId = card.dataset.categoryId;
        const itemId = card.dataset.itemId;
        if (categoryId && itemId) {
          sound.playPick();
          openDishModal(categoryId, itemId);
        }
      };

      card.addEventListener('click', () => {
        if (Date.now() < suppressMenuCardClickUntil) return;
        handleCardOpen();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardOpen();
        }
      });
    });

    const catToggleBtn = document.getElementById('btn-toggle-cat-items');
    if (catToggleBtn && !existingGrid) {
      catToggleBtn.addEventListener('click', () => {
        sound.playClick();
        categoryExpandedState[currentCategoryIndex] = !categoryExpandedState[currentCategoryIndex];
        renderActiveCategoryContent(true, false);
        if (!categoryExpandedState[currentCategoryIndex] && lenis) {
          lenis.scrollTo('#menu-deck', { offset: -50, duration: 0.8 });
        }
      });
    }
  }

  // Entrance animation
  if (animate && !reducedMotion.matches) {
    gsap.fromTo(
      container,
      { opacity: 0, x: direction === 'next' ? 45 : -45 },
      { opacity: 1, x: 0, duration: 0.38, ease: 'power2.out' }
    );
  }
}

// Draft Beers Renderer (Preserves real-bar glasses and bochka nameplates)
function renderDraftBeerCards() {
  const grid = document.getElementById('menu-items-grid');
  const expandContainer = document.getElementById('menu-expand-container');
  const toggleBtnText = document.getElementById('btn-toggle-text');
  const toggleBtnBadge = document.getElementById('btn-toggle-badge');
  const toggleBtnIcon = document.getElementById('btn-toggle-icon');
  const menuDeck = document.getElementById('menu-deck');

  if (menuDeck) {
    if (isMenuExpanded) {
      menuDeck.classList.add('is-tall');
    } else {
      menuDeck.classList.remove('is-tall');
    }
  }

  if (!grid) return;
  const items = draftBeerData.filter(item => {
    let matchStyle = true;
    if (currentSubfilter === 'lager') matchStyle = item.category === 'lager';
    else if (currentSubfilter === 'wheat') matchStyle = item.category === 'wheat';
    else if (currentSubfilter === 'ipa') matchStyle = item.category === 'ipa' || item.category === 'ale';
    else if (currentSubfilter === 'stout') matchStyle = item.category === 'stout' || item.category === 'nitro';
    else if (currentSubfilter === 'fruit') matchStyle = item.category === 'fruit' || item.category === 'cider';
    else if (currentSubfilter === 'rotation') matchStyle = item.rotation === true;

    return matchStyle;
  });

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-neutral-500 font-mono-tech">
        Ничего не найдено. Спросите у бармена на кране!
      </div>
    `;
    if (expandContainer) expandContainer.classList.add('hidden');
    return;
  }

  const shouldLimit = !isMenuExpanded && items.length > 3;
  const displayItems = shouldLimit ? items.slice(0, 3) : items;
  const missingIds = new Set(displayItems.map(beer => String(beer.id)));
  for (const card of Array.from(grid.children)) {
    if (!missingIds.delete(card.dataset.beerId)) card.remove();
  }

  if (expandContainer) {
    if (items.length > 3) {
      expandContainer.classList.remove('hidden');
      if (toggleBtnText) {
        toggleBtnText.textContent = isMenuExpanded ? 'СВЕРНУТЬ' : 'ПОКАЗАТЬ ВСЕ';
      }
      if (toggleBtnBadge) {
        toggleBtnBadge.textContent = isMenuExpanded ? '3' : `${items.length}`;
      }
      if (toggleBtnIcon) {
        toggleBtnIcon.innerHTML = `<svg class="w-4 h-4 fill-none stroke-current stroke-2 transition-transform duration-300 ${isMenuExpanded ? 'rotate-180' : ''}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>`;
      }
    } else {
      expandContainer.classList.add('hidden');
    }
  }

  displayItems.forEach((beer, idx) => {
    if (!missingIds.has(String(beer.id))) return;
    const isDark = beer.beerColor === 'dark';
    const isPriorityBeer = idx < 3;
    const imgLoadAttrs = isPriorityBeer
      ? 'loading="eager" fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"';
    const card = document.createElement('div');
    card.className = `beer-tilt-card beer-card-wood group relative rounded-2xl sm:rounded-3xl border ${beer.rotation ? 'border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.35)]' : 'border-amber-950/40'} p-3.5 sm:p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden select-none`;
    card.dataset.beerId = beer.id;

    const topMediaHtml = beer.glassImage ? `
      <!-- Top: Authentic Draft Beer Photo from Pub (Square 1:1) -->
      <div data-reveal="photo" class="relative w-full aspect-square bg-neutral-900 select-none overflow-hidden rounded-2xl flex items-center justify-center z-10 shadow-lg border border-amber-500/20 group/glass">
        <img src="${beer.glassImage}" alt="${beer.nameRu}" ${imgLoadAttrs} class="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105" />
        
        <!-- Tap Badge Overlay -->
        <div class="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono-tech text-[10px] font-bold shadow-md">
          <span class="w-2 h-2 rounded-full ${isDark ? 'bg-amber-500' : 'bg-emerald-400'} animate-pulse"></span>
          <span>КРАН ${String(beer.id).padStart(2, '0')}</span>
        </div>
      </div>
    ` : `
      <!-- Top: Realistic Wooden Barrel with Engraved Nameplate -->
      <div data-reveal="photo" class="relative w-full aspect-[1536/1024] select-none overflow-visible flex items-center justify-center z-10">
        <img src="./bochka.png" alt="Пивная бочка ${beer.nameRu}" loading="lazy" decoding="async" class="w-full h-full object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-[0_12px_22px_rgba(0,0,0,0.65)]" />
        
        <div class="absolute top-[27%] left-[29%] w-[42%] h-[28%] flex flex-col items-center justify-center text-center px-1 pointer-events-none">
          <span class="text-[7px] sm:text-[9px] font-mono-tech text-[#5a2e12] uppercase font-bold tracking-wider leading-none mb-0.5 opacity-90">КРАН ${String(beer.id).padStart(2, '0')}</span>
          <span class="plate-engraved-text text-[10px] sm:text-[13px] leading-tight line-clamp-2 uppercase">${beer.nameRu}</span>
        </div>
      </div>
    `;

    card.innerHTML = `
      ${topMediaHtml}

      <!-- Bottom: Clean white mini-card with bold black titles -->
      <div 
        id="mini-card-${beer.id}" 
        class="relative mt-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-white/60 shadow-lg overflow-hidden flex flex-col justify-between min-h-[160px] z-10 transition-colors"
      >
        <div class="relative z-20">
          <div data-reveal="badge" class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-[9px] sm:text-[10px] font-mono-tech font-bold uppercase" title="${beer.country}">${beer.flag}</span>
              ${beer.popular ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-[9px] sm:text-[10px] font-mono-tech font-bold text-amber-800 uppercase">Хит</span>` : ''}
              <span class="px-2 py-0.5 rounded-full ${isDark ? 'bg-neutral-900 text-amber-300' : 'bg-amber-100 text-amber-900'} text-[9px] sm:text-[10px] font-mono-tech font-bold uppercase">${isDark ? 'Темное' : 'Светлое'}</span>
            </div>
            <div class="text-[11px] sm:text-xs font-mono-tech text-red-600 font-bold shrink-0">
              ${beer.abv ? `ABV ${beer.abv}` : ''}
            </div>
          </div>

          <!-- Pure Black Title -->
          <h3 data-reveal="title" class="text-sm sm:text-base font-black text-black uppercase font-unbounded tracking-tight leading-snug mb-1">
            ${beer.nameRu}
          </h3>

          <div data-reveal="detail" class="text-[10px] sm:text-xs text-neutral-500 font-mono-tech mb-1">
            ${beer.nameEn} ${beer.og ? `• OG ${beer.og}` : ''} ${beer.ibu ? `• IBU ${beer.ibu}` : ''}
          </div>

          <p data-reveal="detail" class="text-[11px] sm:text-xs text-neutral-800 font-normal leading-relaxed line-clamp-2">
            ${beer.desc}
          </p>
        </div>

        <div class="relative z-20 pt-2.5 sm:pt-3 mt-2 border-t border-neutral-200/80 flex items-center justify-between">
          <div data-reveal="counter" class="flex items-center gap-2.5 sm:gap-3 font-mono-tech">
            <div>
              <span class="text-neutral-400 block text-[8px] sm:text-[9px] font-bold">0,33 Л</span>
              <span class="menu-price text-black font-extrabold text-sm sm:text-base">${beer.price33}</span>
            </div>
            <div class="h-4 sm:h-5 w-px bg-neutral-200"></div>
            <div>
              <span class="text-neutral-400 block text-[8px] sm:text-[9px] font-bold">0,5 Л</span>
              <span class="menu-price text-red-600 font-extrabold text-sm sm:text-base">${beer.price50}</span>
            </div>
          </div>

          <div data-reveal="badge" class="text-[10px] font-mono-tech font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${beer.rotation ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'}">
            <span class="w-1.5 h-1.5 rounded-full ${beer.rotation ? 'bg-red-600' : 'bg-emerald-500'}"></span>
            <span>${beer.rotation ? 'РОТАЦИЯ' : 'НА КРАНЕ'}</span>
          </div>
        </div>

      </div>
    `;

    grid.insertBefore(card, grid.children[idx] || null);
  });

  attachCardTiltListeners();
}

// Backward-compatible switchCategory helper
function switchCategory(cat) {
  if (cat === 'draft') {
    goToMenuCategory(0, 'next');
  } else {
    const foundIdx = menuCategories.findIndex(c => c.id === cat);
    if (foundIdx !== -1) {
      goToMenuCategory(foundIdx, foundIdx > currentCategoryIndex ? 'next' : 'prev');
    }
  }
}
window.switchCategory = switchCategory;

// Card Interaction: Flat static cards (3D tilt/parallax disabled as requested)
function attachCardTiltListeners() {
  document.querySelectorAll('.beer-tilt-card').forEach(card => {
    card.style.transform = 'none';
  });
}

// Beer card interactions: pouring feature disabled
window.pourBeerFromBarrel = () => {};

// Quick order global helper
window.quickOrder = (name) => {
  sound.playClick();
};

// Reviews Carousel Helper & Logic
function getActiveReviews() {
  return isReviewsExpanded ? reviewsData : reviewsData.slice(0, 3);
}

function updateCarouselView() {
  const track = document.getElementById('reviews-track');
  const dotsContainer = document.getElementById('reviews-carousel-dots');
  const list = getActiveReviews();

  if (list.length === 0) return;
  if (currentCarouselIndex >= list.length) {
    currentCarouselIndex = 0;
  } else if (currentCarouselIndex < 0) {
    currentCarouselIndex = list.length - 1;
  }

  if (track) {
    track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
  }

  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      if (idx === currentCarouselIndex) {
        dot.className = 'carousel-dot h-2 w-6 rounded-full bg-red-600 transition-all duration-300';
      } else {
        dot.className = 'carousel-dot h-2 w-2 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all duration-300 cursor-pointer';
      }
    });
  }
}

function nextCarouselSlide() {
  const list = getActiveReviews();
  if (list.length <= 1) return;
  currentCarouselIndex = (currentCarouselIndex + 1) % list.length;
  updateCarouselView();
}

function prevCarouselSlide() {
  const list = getActiveReviews();
  if (list.length <= 1) return;
  currentCarouselIndex = (currentCarouselIndex - 1 + list.length) % list.length;
  updateCarouselView();
}

function startCarouselTimer() {
  stopCarouselTimer();
  carouselTimer = setInterval(() => {
    if (!isCarouselHovered) {
      nextCarouselSlide();
    }
  }, 3000);
}

function stopCarouselTimer() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function renderReviewsCarousel() {
  const track = document.getElementById('reviews-track');
  const dotsContainer = document.getElementById('reviews-carousel-dots');
  const expandedGrid = document.getElementById('reviews-expanded-grid');
  if (!track) return;

  const list = getActiveReviews();
  track.innerHTML = '';

  list.forEach((rev) => {
    const slide = document.createElement('div');
    slide.className = 'review-slide w-full min-w-full flex-shrink-0 px-1 sm:px-2';
    
    slide.innerHTML = `
      <div class="beer-tilt-card p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white flex flex-col justify-between hover:bg-black transition-all shadow-xl border border-white/10 max-w-2xl mx-auto">
        <div>
          <div data-reveal="badge" class="flex items-center justify-between mb-2.5 sm:mb-3">
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full ${rev.avatarBg} text-white font-bold flex items-center justify-center text-xs sm:text-sm font-unbounded shadow">
                ${rev.author[0]}
              </div>
              <div>
                <div class="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 font-unbounded">
                  ${rev.author}
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Верифицирован Яндекс"></span>
                </div>
                <div class="text-[9px] text-neutral-400 font-mono-tech">${rev.level}</div>
              </div>
            </div>
            <div class="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
              <div class="flex items-center gap-0.5 text-amber-400">
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <span class="text-[9px] font-bold text-amber-300 font-mono-tech">5.0</span>
            </div>
          </div>

          <p data-reveal="detail" class="text-xs sm:text-sm text-neutral-200 leading-relaxed mb-2.5 sm:mb-3 font-mono-tech">
            "${rev.text}"
          </p>

          <div data-reveal="badge" class="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            ${rev.tags.map(t => `<span class="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono-tech text-neutral-300">#${t}</span>`).join('')}
          </div>
        </div>

        <div data-reveal="detail" class="pt-2 sm:pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-tech text-neutral-400">
          <span>${rev.date}</span>
          <a 
            href="${yandexPubInfo.yandexUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <span>Яндекс Карты</span>
            <svg class="w-3 h-3 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </a>
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    list.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = idx === currentCarouselIndex 
        ? 'carousel-dot h-2 w-6 rounded-full bg-red-600 transition-all duration-300' 
        : 'carousel-dot h-2 w-2 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all duration-300 cursor-pointer';
      dot.setAttribute('aria-label', `Отзыв ${idx + 1}`);
      dot.addEventListener('click', () => {
        sound.playClick();
        currentCarouselIndex = idx;
        updateCarouselView();
        startCarouselTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Render expanded grid when user clicked "Показать больше"
  if (expandedGrid) {
    if (isReviewsExpanded) {
      expandedGrid.classList.remove('hidden');
      expandedGrid.innerHTML = '';
      reviewsData.forEach((rev) => {
        const card = document.createElement('div');
        card.className = `beer-tilt-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-neutral-900 text-white flex flex-col justify-between hover:bg-black transition-all shadow-lg border border-white/5`;
        card.innerHTML = `
          <div>
            <div data-reveal="badge" class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full ${rev.avatarBg} text-white font-bold flex items-center justify-center text-xs font-unbounded">
                  ${rev.author[0]}
                </div>
                <div>
                  <div class="text-xs font-bold text-white flex items-center gap-1 font-unbounded">
                    ${rev.author}
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div class="text-[9px] text-neutral-400 font-mono-tech">${rev.level}</div>
                </div>
              </div>
              <div class="flex items-center gap-0.5 text-amber-400">
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
            </div>
            <p data-reveal="detail" class="text-[11px] sm:text-xs text-neutral-300 leading-relaxed mb-3 font-mono-tech">"${rev.text}"</p>
            <div data-reveal="badge" class="flex flex-wrap gap-1 mb-3">
              ${rev.tags.map(t => `<span class="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono-tech text-neutral-400">#${t}</span>`).join('')}
            </div>
          </div>
          <div data-reveal="detail" class="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-tech text-neutral-400">
            <span>${rev.date}</span>
            <span class="text-amber-400 font-bold inline-flex items-center gap-1">
              <span>Яндекс Карты</span>
              <svg class="w-3 h-3 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </div>
        `;
        expandedGrid.appendChild(card);
      });
    } else {
      expandedGrid.classList.add('hidden');
      expandedGrid.innerHTML = '';
    }
  }

  updateCarouselView();
  attachCardTiltListeners();
}

// Modal helper
function openInfoModal(icon, title, body) {
  const modal = document.getElementById('info-modal');
  const iconEl = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const actionBtn = document.getElementById('modal-action-btn');

  if (iconEl) {
    if (typeof icon === 'string' && icon.trim().startsWith('<')) {
      iconEl.innerHTML = icon;
    } else {
      iconEl.textContent = icon;
    }
  }
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.textContent = body;
  if (actionBtn) {
    actionBtn.textContent = 'ПОНЯТНО';
    actionBtn.onclick = closeInfoModal;
  }

  if (modal) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
  }
}

function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
  }
}

// Rich Dish Detail Modal (FoodTicker & Menu Cards)
function openDishModal(categoryIdOrDish, itemId) {
  let categoryId = categoryIdOrDish;
  let targetItemId = itemId;
  let fallbackDish = null;

  if (categoryIdOrDish && typeof categoryIdOrDish === 'object') {
    fallbackDish = categoryIdOrDish;
    categoryId = categoryIdOrDish.menuCategoryId || categoryIdOrDish.categoryId;
    targetItemId = categoryIdOrDish.menuItemId || categoryIdOrDish.itemId || categoryIdOrDish.id;
  }

  const cat = menuCategories.find(c => c.id === categoryId);
  const item = cat?.items?.find(i => i.id === targetItemId) || fallbackDish;
  const modal = document.getElementById('dish-detail-modal');
  const dialog = document.getElementById('dish-modal-dialog');
  const content = document.getElementById('dish-modal-content');
  if (!item || !modal || !content) return;

  const categoryLabel = cat
    ? `${cat.icon} ${cat.title}`
    : (item.category || 'Меню Shrimp Pub');

  const badgesList = Array.isArray(item.badges)
    ? [...item.badges]
    : (item.badge ? [item.badge] : []);

  const hasSpicyBadge = badgesList.some(b =>
    /остр|чили|спайси|антипохмел/i.test(b)
  );
  if (item.spicy && !hasSpicyBadge) {
    badgesList.push('Острое');
  }

  const badgesHtml = badgesList.map((b) => {
    let badgeClass = 'bg-white/10 text-neutral-200 border-white/15';
    if (/хит|премиум|шедевр|xxl|выгодно/i.test(b)) {
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else if (/остр|чили|спайси|антипохмел/i.test(b)) {
      badgeClass = 'bg-red-600/25 text-red-300 border-red-500/45';
    }
    return `<span class="px-2.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-mono-tech font-bold uppercase ${badgeClass}">${escapeHtml(b)}</span>`;
  }).join('');

  const spicyChipHtml = item.spicy
    ? `<span class="px-2.5 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/50 text-rose-200 text-[10px] sm:text-xs font-mono-tech font-bold uppercase">Пикантно</span>`
    : '';

  const weightChipHtml = item.weight
    ? `<span class="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-neutral-300 text-[10px] sm:text-xs font-mono-tech font-bold">${escapeHtml(item.weight)}</span>`
    : '';

  const modalImageSrc = item.modalImage || (item.image ? item.image.replace('dish_', 'dish_modal_') : null) || item.image;

  const mediaHtml = modalImageSrc
    ? `
      <div class="relative w-full aspect-[16/9] bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-white/10" style="background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);">
        <img
          src="./${escapeHtml(modalImageSrc)}"
          alt="${escapeHtml(item.imageAlt || item.name)}"
          loading="eager"
          decoding="async"
          class="w-full h-full object-cover sm:object-contain object-center drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] select-none"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
        <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 pointer-events-none z-10">
          <span class="pointer-events-auto px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider text-red-400 shadow-md">
            ${escapeHtml(categoryLabel)}
          </span>
          <span class="menu-price pointer-events-auto px-3.5 py-1 rounded-xl bg-black/90 backdrop-blur-md border border-amber-500/45 text-amber-300 font-extrabold text-sm sm:text-lg shadow-xl">
            ${escapeHtml(item.price)}
          </span>
        </div>
      </div>
    `
    : `
      <div class="relative w-full py-6 px-5 sm:px-7 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-b border-white/10 flex items-center justify-between gap-3 pr-14">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 shrink-0"><svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg></span>
          <span class="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider text-red-400 truncate">
            ${escapeHtml(categoryLabel)}
          </span>
        </div>
        <span class="menu-price px-3.5 py-1 rounded-xl bg-black/85 border border-amber-500/45 text-amber-300 font-extrabold text-sm sm:text-lg shrink-0">
          ${escapeHtml(item.price)}
        </span>
      </div>
    `;

  content.innerHTML = `
    ${mediaHtml}

    <div class="p-5 sm:p-7">
      <div class="flex flex-wrap items-center gap-1.5 mb-3">
        ${badgesHtml}
        ${spicyChipHtml}
        ${weightChipHtml}
      </div>

      <h3 id="dish-modal-title" class="text-lg sm:text-2xl font-black uppercase text-white font-unbounded leading-snug tracking-tight">
        ${escapeHtml(item.name)}
      </h3>

      ${item.desc ? `
        <p class="text-xs sm:text-sm text-neutral-300 font-mono-tech mt-3 leading-relaxed">
          ${escapeHtml(item.desc)}
        </p>
      ` : ''}

      <div class="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-tech text-neutral-400">
        <span>Shrimp Pub • Свежая подача из-под ножа</span>
        <span class="text-emerald-400 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          В наличии
        </span>
      </div>

      <div class="mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        ${cat ? `
          <button
            id="dish-modal-open-menu"
            type="button"
            class="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-black font-unbounded text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
          >
            <span>Открыть в меню</span>
            <span>↗</span>
          </button>
        ` : ''}

        <a
          href="#booking-deck"
          id="dish-modal-book-table"
          class="btn-magnetic w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black font-unbounded text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,30,39,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>Забронировать стол</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  if (dialog) {
    dialog.classList.remove('scale-95');
    dialog.classList.add('scale-100');
  }
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();

  const openMenuBtn = document.getElementById('dish-modal-open-menu');
  if (openMenuBtn && cat) {
    openMenuBtn.addEventListener('click', () => {
      sound.playClick();
      closeDishModal();
      revealAndHighlightDishInMenu(cat.id, item.id);
    });
  }

  const bookBtn = document.getElementById('dish-modal-book-table');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playClick();
      closeDishModal();
      const bookingDeck = document.getElementById('booking-deck');
      if (bookingDeck) {
        if (lenis) {
          lenis.scrollTo(bookingDeck, { offset: -70, duration: 0.9 });
        } else {
          bookingDeck.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
}

function closeDishModal() {
  const modal = document.getElementById('dish-detail-modal');
  const dialog = document.getElementById('dish-modal-dialog');
  if (!modal || modal.classList.contains('pointer-events-none')) return;

  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  if (dialog) {
    dialog.classList.add('scale-95');
    dialog.classList.remove('scale-100');
  }
  document.body.style.overflow = '';
  if (lenis) lenis.start();
}

function revealAndHighlightDishInMenu(categoryId, itemId) {
  const catIdx = menuCategories.findIndex(c => c.id === categoryId);
  if (catIdx === -1) return;

  const cat = menuCategories[catIdx];
  const items = cat.items || [];
  const itemIdx = items.findIndex(i => i.id === itemId);

  // Auto-expand category if item sits past the initial 3-item preview slice
  if (!cat.isBeerCategory && itemIdx >= 3) {
    categoryExpandedState[catIdx] = true;
  }

  switchCategory(categoryId);

  const menuDeck = document.getElementById('menu-deck');
  if (menuDeck) {
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      const targetCard =
        document.querySelector(`[data-category-id="${categoryId}"][data-item-id="${itemId}"]`) ||
        document.querySelector(`[data-item-id="${itemId}"]`);
      if (!targetCard) return;

      document.querySelectorAll('.dish-highlight-pulse').forEach((el) => {
        el.classList.remove('dish-highlight-pulse');
      });
      if (dishHighlightTimeout) {
        clearTimeout(dishHighlightTimeout);
      }

      if (lenis) {
        const offset = window.innerWidth <= 768 ? -80 : -105;
        lenis.scrollTo(targetCard, { offset, duration: 0.9 });
      } else {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      targetCard.classList.add('dish-highlight-pulse');
      gsap.fromTo(
        targetCard,
        { scale: 0.98 },
        { scale: 1.02, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }
      );

      dishHighlightTimeout = setTimeout(() => {
        targetCard.classList.remove('dish-highlight-pulse');
      }, 2800);
    }, 100);
  });
}

window.openDishModal = openDishModal;

// Toast helper
function showToast(text) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'px-5 py-3 rounded-2xl bg-black/90 border border-red-500/40 text-white text-xs font-mono-tech tracking-wider uppercase shadow-[0_0_30px_rgba(255,30,39,0.5)] transition-all duration-300 opacity-0 translate-y-2 pointer-events-auto';
  toast.textContent = text;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
