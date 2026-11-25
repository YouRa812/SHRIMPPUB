import { sound } from '../utils/audio.js';

const THEME_LABELS = {
  all: 'Все сюжеты',
  interior: 'Интерьер & Краны',
  guests: 'Гости & Вечера',
  music: 'Живой звук',
  details: 'Детали & Подача',
};

const THEME_ORDER = ['all', 'interior', 'guests', 'music', 'details'];

export const atmosphereFullGallery = [
  // ==================== 16 REAL PHOTOS ====================
  {
    id: 1,
    type: 'photo',
    src: './atmos_photo_01.webp',
    title: 'Барная стойка в огнях и цветах',
    category: 'interior',
    tag: 'Интерьер',
    caption: 'Тыквы-фонари, букеты цветов на стойке, шарфы клубов под потолком и надпись «You\'ll Never Walk Alone»',
    portrait: false,
  },
  {
    id: 2,
    type: 'photo',
    src: './atmos_photo_02.webp',
    title: 'Болельщики АПЛ у барной стойки',
    category: 'guests',
    tag: 'Гости',
    caption: 'Друзья в футбольных джерси Liverpool и Aston Villa с пинтой эля под сводом фанатских шарфов',
    portrait: true,
  },
  {
    id: 3,
    type: 'photo',
    src: './atmos_photo_03.webp',
    title: 'Костюмированный Хэллоуин',
    category: 'guests',
    tag: 'Вечеринка',
    caption: 'Яркие хэллоуинские образы, грим, улыбки и праздничный драйв пабной ночи',
    portrait: false,
  },
  {
    id: 4,
    type: 'photo',
    src: './atmos_photo_04.webp',
    title: 'Авторская настойка и дерзкая закуска',
    category: 'details',
    tag: 'Подача',
    caption: 'Рюмка тёмной настойки с необычной пикантной подачей прямо на стойке на фоне пивных кранов',
    portrait: true,
  },
  {
    id: 5,
    type: 'photo',
    src: './atmos_photo_05.webp',
    title: 'Живая память на дереве бара',
    category: 'details',
    tag: 'Детали',
    caption: 'Тёплое признание «Маша ты лучшая» от гостей, оставленное прямо на деревянной панели барной стойки',
    portrait: true,
  },
  {
    id: 6,
    type: 'photo',
    src: './atmos_photo_06.webp',
    title: 'Без кивка бармена не играю :)',
    category: 'guests',
    tag: 'Атмосфера',
    caption: 'Дружеское селфи у барной стойки рядом с гипсовым бюстом и легендарной табличкой',
    portrait: false,
  },
  {
    id: 7,
    type: 'photo',
    src: './atmos_photo_07.webp',
    title: 'Свежая пинта янтарного эля',
    category: 'guests',
    tag: 'Розлив',
    caption: 'Классический вечер за баром: высокий бокал янтарного эля, печатное меню и компания друзей',
    portrait: false,
  },
  {
    id: 8,
    type: 'photo',
    src: './atmos_photo_08.webp',
    title: 'Фирменный бокал «КРЕВЕТОЧКА»',
    category: 'details',
    tag: 'Юмор',
    caption: 'Фирменный бокал свежего разливного пива и заряд хорошего настроения от постоянных гостей',
    portrait: true,
  },
  {
    id: 9,
    type: 'photo',
    src: './atmos_photo_09.webp',
    title: 'Тёплый приём в центре зала',
    category: 'guests',
    tag: 'Гости',
    caption: 'Уютный вечерний свет, спортивные экраны и дружеское приветствие у входа в Shrimp Pub',
    portrait: true,
  },
  {
    id: 10,
    type: 'photo',
    src: './atmos_photo_10.webp',
    title: 'Спортивный вечер и трансляция',
    category: 'guests',
    tag: 'Спорт',
    caption: 'Тёплые объятия друзей с бокалом янтарного пива на фоне трансляции баскетбольного матча',
    portrait: true,
  },
  {
    id: 11,
    type: 'photo',
    src: './atmos_photo_11.webp',
    title: 'У стены с шарфом Morecambe F.C.',
    category: 'interior',
    tag: 'Morecambe',
    caption: 'Культовый шарф английских «Креветок» (Morecambe F.C.) и коллекция авторских картин на шотландской клетке',
    portrait: true,
  },
  {
    id: 12,
    type: 'photo',
    src: './atmos_photo_12.webp',
    title: 'Девчонки за баром и блеск вечера',
    category: 'interior',
    tag: 'Бар',
    caption: 'Яркое селфи на фоне бокалов Bernard, барного колокольчика и полок с редкими бутылками',
    portrait: false,
  },
  {
    id: 13,
    type: 'photo',
    src: './atmos_photo_13.webp',
    title: 'Кружевная шляпка и пинта',
    category: 'details',
    tag: 'Настроение',
    caption: 'Весёлый импровизированный образ за стойкой у коврика Jura рядом со свеженалитым пивом',
    portrait: true,
  },
  {
    id: 14,
    type: 'photo',
    src: './atmos_photo_14.webp',
    title: 'Эльфийские ушки и красная гитара',
    category: 'music',
    tag: 'Гитара',
    caption: 'Игровое настроение гостей на фоне алой акустической гитары и портретов на клетчатой стене',
    portrait: true,
  },
  {
    id: 15,
    type: 'photo',
    src: './atmos_photo_15.webp',
    title: 'Пятничный сбор у кранов Delirium',
    category: 'interior',
    tag: 'Краны',
    caption: 'Большая компания друзей за барной стойкой, меховые пивные краны №10–11 и коврик с розовым слоном',
    portrait: false,
  },
  {
    id: 16,
    type: 'photo',
    src: './atmos_photo_16.webp',
    title: 'Краны розлива в действии',
    category: 'interior',
    tag: 'Барная жизнь',
    caption: 'Взгляд из-за стойки: бирки сортов на кранах, бокалы с крафтом и оживлённый пятничный бар',
    portrait: false,
  },

  // ==================== 14 REAL VIDEOS ====================
  {
    id: 101,
    type: 'video',
    src: './atmos_video_01.mp4',
    poster: './atmos_video_01_poster.webp',
    duration: '0:21',
    title: 'Акустический сет у окна',
    category: 'music',
    tag: 'Живой звук',
    caption: 'Гитарист поёт у микрофона на фоне акустической гитары на стене и хэллоуинского декора',
    portrait: true,
  },
  {
    id: 102,
    type: 'video',
    src: './atmos_video_02.mp4',
    poster: './atmos_video_02_poster.webp',
    duration: '0:14',
    title: 'Полный зал и звон бокалов',
    category: 'guests',
    tag: 'Аншлаг',
    caption: 'Весёлый хор голосов, поднятые бокалы и море футбольных шарфов под потолком',
    portrait: false,
  },
  {
    id: 103,
    type: 'video',
    src: './atmos_video_03.mp4',
    poster: './atmos_video_03_poster.webp',
    duration: '0:15',
    title: 'Гитара за столиком среди друзей',
    category: 'music',
    tag: 'Акустика',
    caption: 'Камерное исполнение прямо за деревянным столом в кругу улыбающихся гостей',
    portrait: false,
  },
  {
    id: 104,
    type: 'video',
    src: './atmos_video_04.mp4',
    poster: './atmos_video_04_poster.webp',
    duration: '0:26',
    title: 'Живой куплет у кирпичной стены',
    category: 'music',
    tag: 'Песни',
    caption: 'Искренние эмоции, смех за соседним столом и звонкие струны акустической гитары',
    portrait: false,
  },
  {
    id: 105,
    type: 'video',
    src: './atmos_video_05.mp4',
    poster: './atmos_video_05_poster.webp',
    duration: '1:32',
    title: 'Большой акустический вечер',
    category: 'music',
    tag: 'Концерт',
    caption: 'Полторы минуты атмосферы живого концерта: весь зал подпевает под флагом Англии',
    portrait: true,
  },
  {
    id: 106,
    type: 'video',
    src: './atmos_video_06.mp4',
    poster: './atmos_video_06_poster.webp',
    duration: '0:12',
    title: 'Тёплые беседы и гул зала',
    category: 'guests',
    tag: 'Вечер',
    caption: 'Уютная посадка за столами, смех и живое общение в разгар пятничного вечера',
    portrait: true,
  },
  {
    id: 107,
    type: 'video',
    src: './atmos_video_07.mp4',
    poster: './atmos_video_07_poster.webp',
    duration: '0:18',
    title: 'Вечер у стойки под шарфами',
    category: 'guests',
    tag: 'Паб',
    caption: 'Бокалы янтарного пива, красная гитара на стене и весёлая компания в центре зала',
    portrait: false,
  },
  {
    id: 108,
    type: 'video',
    src: './atmos_video_08.mp4',
    poster: './atmos_video_08_poster.webp',
    duration: '0:51',
    title: 'Пятничный аншлаг и тосты',
    category: 'guests',
    tag: 'Друзья',
    caption: 'Два друга в кадре с бокалами и дружный поющий зал на заднем плане',
    portrait: true,
  },
  {
    id: 109,
    type: 'video',
    src: './atmos_video_09.mp4',
    poster: './atmos_video_09_poster.webp',
    duration: '0:08',
    title: 'Песни и огни телефонов',
    category: 'guests',
    tag: 'Драйв',
    caption: 'Момент общего драйва под потолочным флагом в переполненном зале',
    portrait: true,
  },
  {
    id: 110,
    type: 'video',
    src: './atmos_video_10.mp4',
    poster: './atmos_video_10_poster.webp',
    duration: '0:19',
    title: 'Ритм ночного паба',
    category: 'music',
    tag: 'Музыка',
    caption: 'Тёплый свет над баром и гости, качающиеся в такт живым аккордам',
    portrait: true,
  },
  {
    id: 111,
    type: 'video',
    src: './atmos_video_11.mp4',
    poster: './atmos_video_11_poster.webp',
    duration: '0:06',
    title: 'Шумная вечеринка у столов',
    category: 'guests',
    tag: 'Пятница',
    caption: 'Короткий срез шумного и душевного вечера с полными пинтами на деревянных столах',
    portrait: true,
  },
  {
    id: 112,
    type: 'video',
    src: './atmos_video_12.mp4',
    poster: './atmos_video_12_poster.webp',
    duration: '1:29',
    title: 'Сольный акустический сет',
    category: 'music',
    tag: 'Соло',
    caption: 'Полное живое исполнение под акустическую гитару у микрофона в центре зала',
    portrait: true,
  },
  {
    id: 113,
    type: 'video',
    src: './atmos_video_13.mp4',
    poster: './atmos_video_13_poster.webp',
    duration: '0:11',
    title: 'Камеры и хор на концерте',
    category: 'music',
    tag: 'Лайв',
    caption: 'Гости снимают яркое выступление на телефоны и поют вместе с музыкантом',
    portrait: true,
  },
  {
    id: 114,
    type: 'video',
    src: './atmos_video_14.mp4',
    poster: './atmos_video_14_poster.webp',
    duration: '0:33',
    title: 'Праздничные букеты и свет бара',
    category: 'interior',
    tag: 'Уют',
    caption: 'Яркие цветы на стойке, лампы Эдисона и футбольная трансляция на экране над баром',
    portrait: true,
  },
];

// 10 crisp real photos featured in the continuous marquee ticker
const MARQUEE_PHOTO_IDS = [1, 15, 2, 6, 4, 11, 7, 3, 12, 8];

export const atmospherePreviewPhotos = MARQUEE_PHOTO_IDS.map((id) =>
  atmosphereFullGallery.find((item) => item.id === id)
).filter(Boolean);

const PHOTO_COUNT = atmosphereFullGallery.filter((i) => i.type === 'photo').length;
const VIDEO_COUNT = atmosphereFullGallery.filter((i) => i.type === 'video').length;

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class AtmosphereGallery {
  constructor(sectionContainerId, modalContainerId) {
    this.sectionContainer = typeof sectionContainerId === 'string'
      ? document.getElementById(sectionContainerId)
      : sectionContainerId;
    this.modalContainer = typeof modalContainerId === 'string'
      ? document.getElementById(modalContainerId)
      : modalContainerId;
    this.currentMediaType = 'all'; // 'all' | 'photo' | 'video'
    this.currentCategory = 'all';  // 'all' | 'interior' | 'guests' | 'music' | 'details'
    this.lightboxItems = atmosphereFullGallery;
    this.lightboxIndex = 0;
    this.pausedBgMusicForVideo = false;
    this._boundKeyDown = null;
  }

  mount() {
    this.renderSection();
    this.renderModal();
    this.attachEvents();
  }

  getItemsByMediaType(mediaType = this.currentMediaType) {
    if (mediaType === 'all') return atmosphereFullGallery;
    return atmosphereFullGallery.filter((item) => item.type === mediaType);
  }

  getFilteredItems() {
    const byType = this.getItemsByMediaType(this.currentMediaType);
    if (this.currentCategory === 'all') return byType;
    return byType.filter((item) => item.category === this.currentCategory);
  }

  renderSection() {
    if (!this.sectionContainer) return;

    // Duplicate the 10 real photos twice for a seamless infinite CSS marquee loop
    const marqueeItems = [...atmospherePreviewPhotos, ...atmospherePreviewPhotos];

    const cardsHtml = marqueeItems.map((item) => {
      const safeTitle = escapeAttr(item.title);
      const posClass = item.portrait ? 'object-[50%_22%]' : 'object-center';

      return `
        <div
          class="atmosphere-preview-card shrink-0 w-[260px] h-[195px] sm:w-[340px] sm:h-[250px] md:w-[400px] md:h-[285px] rounded-2xl overflow-hidden bg-neutral-900 relative group select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          data-gallery-id="${item.id}"
          role="button"
          tabindex="0"
          aria-label="${safeTitle}"
        >
          <img
            src="${item.src}"
            alt="${safeTitle}"
            loading="lazy"
            decoding="async"
            draggable="false"
            class="w-full h-full object-cover ${posClass} transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          />
        </div>
      `;
    }).join('');

    this.sectionContainer.innerHTML = `
      <div class="w-full relative">
        <!-- Section Header Row -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-black/10">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge-asterisk !w-3.5 !h-3.5 !text-[8px]">*</span>
              <span class="text-[10px] sm:text-xs font-mono-tech uppercase font-bold tracking-widest text-red-600">
                ЖИВЫЕ МОМЕНТЫ ПАБА
              </span>
            </div>
            <h2 class="text-base sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-tight font-unbounded">
              ДУША & АТМОСФЕРА <span class="headline-capsule">PUB LIFE</span>
            </h2>
            <p class="text-[11px] sm:text-xs text-neutral-600 font-mono-tech mt-1 max-w-xl">
              Настоящие вечера на Энгельса 58А: краны с крафтом, живые акустические концерты, шарфы клубов и улыбки друзей.
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap shrink-0">
            <!-- Trailer Button -->
            <button
              id="btn-open-pub-trailer"
              type="button"
              class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-neutral-900 hover:bg-black border border-neutral-700 text-white font-black font-unbounded text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0"
              title="Смотреть официальный трейлер паба"
            >
              <svg class="w-4 h-4 text-red-500 fill-current shrink-0" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span>ТРЕЙЛЕР ПАБА</span>
            </button>

            <!-- Big Action Button to Open Full Gallery -->
            <button
              id="btn-open-atmosphere-gallery"
              class="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black font-unbounded text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(255,30,39,0.35)] transition-all transform active:scale-95 cursor-pointer shrink-0"
            >
              <span>ВСЯ ГАЛЕРЕЯ</span>
              <svg class="w-4 h-4 shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>

        <!-- 10-Photo Continuous Marquee Ticker -->
        <div class="atmosphere-marquee-viewport relative w-full overflow-hidden rounded-2xl">
          <div class="absolute top-0 bottom-0 left-0 w-10 sm:w-20 bg-gradient-to-r from-[#faf8f9] to-transparent z-10 pointer-events-none"></div>
          <div class="absolute top-0 bottom-0 right-0 w-10 sm:w-20 bg-gradient-to-l from-[#faf8f9] to-transparent z-10 pointer-events-none"></div>

          <div id="atmosphere-marquee-track" class="atmosphere-marquee-track flex gap-3 sm:gap-5 w-max will-change-transform">
            ${cardsHtml}
          </div>
        </div>

        <div data-reveal="detail" class="mt-3 text-center text-xs font-mono-tech text-neutral-500">
          Нажмите на любой кадр для просмотра или откройте полную галерею
        </div>
      </div>
    `;
  }

  renderModal() {
    if (!this.modalContainer) return;

    this.modalContainer.innerHTML = `
      <div
        id="atmosphere-modal-backdrop"
        data-lenis-prevent
        class="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl hidden flex flex-col overflow-y-auto p-3 sm:p-6 lg:p-8 text-white transition-opacity duration-300"
      >
        <div class="max-w-6xl w-full mx-auto space-y-5 my-auto">

          <!-- Top Navigation Header with Dedicated Back Button -->
          <div class="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
            <button
              id="btn-close-atmosphere-modal"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-red-600 text-white text-xs sm:text-sm font-bold font-mono-tech uppercase transition-colors shadow-lg cursor-pointer"
            >
              <span>←</span>
              <span>НАЗАД К САЙТУ</span>
            </button>

            <div class="text-center">
              <h3 class="text-base sm:text-2xl font-black uppercase text-white font-unbounded">
                ГАЛЕРЕЯ SHRIMP PUB
              </h3>
              <p class="text-[11px] font-mono-tech text-neutral-400">
                Живые фото и видео бара, акустических концертов и гостей
              </p>
            </div>

            <div class="text-xs font-mono-tech text-neutral-300 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span id="gallery-count-badge">Показано: ${atmosphereFullGallery.length} из ${atmosphereFullGallery.length}</span>
            </div>
          </div>

          <!-- Media Type Tabs: Все медиа / Фотографии (16) / Видео (14) -->
          <div id="gallery-media-tabs" class="flex items-center gap-2 flex-wrap">
            <button
              data-media="all"
              class="media-tab px-4 py-2 rounded-xl text-xs font-black font-unbounded uppercase tracking-wide bg-white text-black transition-all cursor-pointer"
            >
              Все медиа (${atmosphereFullGallery.length})
            </button>
            <button
              data-media="photo"
              class="media-tab px-4 py-2 rounded-xl text-xs font-black font-unbounded uppercase tracking-wide bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/10 transition-all cursor-pointer"
            >
              Фотографии (${PHOTO_COUNT})
            </button>
            <button
              data-media="video"
              class="media-tab px-4 py-2 rounded-xl text-xs font-black font-unbounded uppercase tracking-wide bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/10 transition-all cursor-pointer"
            >
              Видео (${VIDEO_COUNT})
            </button>
          </div>

          <!-- Thematic Filter Pills -->
          <div id="gallery-theme-pills" class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <!-- Injected dynamically with accurate counts -->
          </div>

          <!-- Media Grid (Lazy WebP Photos & Video Posters only — zero initial video preload) -->
          <div id="gallery-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <!-- Injected dynamically -->
          </div>

          <!-- Bottom Return Button -->
          <div class="text-center pt-6 pb-4 border-t border-white/10">
            <button
              id="btn-bottom-close-gallery"
              class="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-black font-unbounded uppercase tracking-wider shadow-[0_0_30px_rgba(255,30,39,0.4)] transition-all cursor-pointer"
            >
              ← ВЕРНУТЬСЯ НА САЙТ SHRIMP PUB
            </button>
          </div>
        </div>
      </div>

      <!-- Lightbox Zoom & Video Player Modal -->
      <div
        id="lightbox-zoom-modal"
        data-lenis-prevent
        class="fixed inset-0 z-[100] bg-black/96 backdrop-blur-xl hidden flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
      >
        <button
          id="btn-close-lightbox"
          aria-label="Закрыть просмотр"
          class="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/65 hover:bg-red-600 text-white text-lg font-bold flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
        >✕</button>

        <button
          id="btn-lb-prev"
          aria-label="Предыдущий кадр"
          class="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-red-600 text-white text-lg sm:text-xl font-bold flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >←</button>

        <button
          id="btn-lb-next"
          aria-label="Следующий кадр"
          class="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-red-600 text-white text-lg sm:text-xl font-bold flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >→</button>

        <div id="lightbox-content" class="max-w-5xl w-full flex items-center justify-center my-auto">
          <!-- Injected dynamically -->
        </div>
      </div>
    `;
  }

  attachEvents() {
    const openBtn = this.sectionContainer?.querySelector('#btn-open-atmosphere-gallery');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        sound.playPick();
        this.openModal();
      });
    }

    const openMarqueeCard = (card) => {
      sound.playPick();
      const id = parseInt(card.dataset.galleryId, 10);
      const photosOnly = atmosphereFullGallery.filter((x) => x.type === 'photo');
      const idx = photosOnly.findIndex((x) => x.id === id);
      if (idx !== -1) {
        this.openLightbox(photosOnly[idx], photosOnly);
      } else {
        this.openModal();
      }
    };

    // Guard against accidental click after touch drag/scroll
    let gestureStartX = 0;
    let gestureStartY = 0;
    let hasDragged = false;
    let suppressClickUntil = 0;

    // Pause marquee ticker on hover / touch
    const track = this.sectionContainer?.querySelector('#atmosphere-marquee-track');
    let touchResumeTimer = null;
    if (track) {
      track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
      track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
      track.addEventListener('pointerdown', (e) => {
        gestureStartX = e.clientX;
        gestureStartY = e.clientY;
        hasDragged = false;
      }, { passive: true });
      track.addEventListener('pointermove', (e) => {
        if (!hasDragged && (e.buttons || e.pointerType === 'touch')) {
          if (Math.hypot(e.clientX - gestureStartX, e.clientY - gestureStartY) > 10) {
            hasDragged = true;
            suppressClickUntil = Date.now() + 350;
          }
        }
      }, { passive: true });
      track.addEventListener('touchstart', () => {
        if (touchResumeTimer) clearTimeout(touchResumeTimer);
        track.style.animationPlayState = 'paused';
      }, { passive: true });
      track.addEventListener('touchend', () => {
        if (hasDragged) suppressClickUntil = Date.now() + 350;
        touchResumeTimer = setTimeout(() => {
          track.style.animationPlayState = 'running';
        }, 1800);
      }, { passive: true });
    }

    // Marquee card click & keyboard -> open that exact photo in Lightbox
    this.sectionContainer?.querySelectorAll('.atmosphere-preview-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (hasDragged || Date.now() < suppressClickUntil) {
          hasDragged = false;
          return;
        }
        openMarqueeCard(card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMarqueeCard(card);
        }
      });
    });

    const closeBtn = this.modalContainer?.querySelector('#btn-close-atmosphere-modal');
    const bottomCloseBtn = this.modalContainer?.querySelector('#btn-bottom-close-gallery');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', () => this.closeModal());

    // Media type tabs (Все / Фотографии / Видео)
    this.modalContainer?.querySelectorAll('.media-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        sound.playClick();
        this.currentMediaType = tab.dataset.media || 'all';
        this.updateMediaTabsUI();

        // Reset theme if active theme has 0 items under the newly selected media tab
        const inTab = this.getItemsByMediaType(this.currentMediaType);
        if (this.currentCategory !== 'all' && !inTab.some((i) => i.category === this.currentCategory)) {
          this.currentCategory = 'all';
        }
        this.renderThemePills();
        this.renderGalleryGrid();
      });
    });

    // Lightbox controls & backdrop click
    const closeLightboxBtn = this.modalContainer?.querySelector('#btn-close-lightbox');
    const prevLightboxBtn = this.modalContainer?.querySelector('#btn-lb-prev');
    const nextLightboxBtn = this.modalContainer?.querySelector('#btn-lb-next');
    const lightboxModal = this.modalContainer?.querySelector('#lightbox-zoom-modal');

    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener('click', () => this.closeLightbox());
    }
    if (prevLightboxBtn) {
      prevLightboxBtn.addEventListener('click', () => this.stepLightbox(-1));
    }
    if (nextLightboxBtn) {
      nextLightboxBtn.addEventListener('click', () => this.stepLightbox(1));
    }
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.id === 'lightbox-content') {
          this.closeLightbox();
        }
      });
    }

    // Keyboard ESC and Left/Right navigation inside Lightbox
    if (this._boundKeyDown) {
      window.removeEventListener('keydown', this._boundKeyDown);
    }
    this._boundKeyDown = (e) => {
      const lb = this.modalContainer?.querySelector('#lightbox-zoom-modal');
      const isLbOpen = lb && !lb.classList.contains('hidden');
      const modalBackdrop = this.modalContainer?.querySelector('#atmosphere-modal-backdrop');
      const isModalOpen = modalBackdrop && !modalBackdrop.classList.contains('hidden');

      if (e.key === 'Escape') {
        if (isLbOpen) {
          this.closeLightbox();
        } else if (isModalOpen) {
          this.closeModal();
        }
      } else if (isLbOpen && e.key === 'ArrowRight') {
        this.stepLightbox(1);
      } else if (isLbOpen && e.key === 'ArrowLeft') {
        this.stepLightbox(-1);
      }
    };
    window.addEventListener('keydown', this._boundKeyDown);
  }

  updateMediaTabsUI() {
    this.modalContainer?.querySelectorAll('.media-tab').forEach((tab) => {
      const isActive = tab.dataset.media === this.currentMediaType;
      if (isActive) {
        tab.className = 'media-tab px-4 py-2 rounded-xl text-xs font-black font-unbounded uppercase tracking-wide bg-white text-black shadow-md transition-all cursor-pointer';
      } else {
        tab.className = 'media-tab px-4 py-2 rounded-xl text-xs font-black font-unbounded uppercase tracking-wide bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/10 transition-all cursor-pointer';
      }
    });
  }

  renderThemePills() {
    const pillsWrap = this.modalContainer?.querySelector('#gallery-theme-pills');
    if (!pillsWrap) return;

    const baseItems = this.getItemsByMediaType(this.currentMediaType);

    const pillsHtml = THEME_ORDER.map((cat) => {
      const count = cat === 'all'
        ? baseItems.length
        : baseItems.filter((item) => item.category === cat).length;
      if (cat !== 'all' && count === 0) return '';

      const isActive = this.currentCategory === cat;
      const cls = isActive
        ? 'cat-pill shrink-0 px-4 py-2 rounded-full text-xs font-bold font-mono-tech bg-red-600 text-white shadow transition-all cursor-pointer'
        : 'cat-pill shrink-0 px-4 py-2 rounded-full text-xs font-bold font-mono-tech bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/10 transition-all cursor-pointer';

      return `<button data-cat="${cat}" class="${cls}">${THEME_LABELS[cat]} (${count})</button>`;
    }).join('');

    pillsWrap.innerHTML = pillsHtml;

    pillsWrap.querySelectorAll('.cat-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        sound.playClick();
        this.currentCategory = pill.dataset.cat || 'all';
        this.renderThemePills();
        this.renderGalleryGrid();
      });
    });
  }

  openModal() {
    const backdrop = this.modalContainer?.querySelector('#atmosphere-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this.updateMediaTabsUI();
    this.renderThemePills();
    this.renderGalleryGrid();
  }

  closeModal() {
    const backdrop = this.modalContainer?.querySelector('#atmosphere-modal-backdrop');
    if (!backdrop) return;
    this.stopLightboxVideo(true);
    sound.playClick();
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  renderGalleryGrid() {
    const grid = this.modalContainer?.querySelector('#gallery-grid');
    const countBadge = this.modalContainer?.querySelector('#gallery-count-badge');
    if (!grid) return;

    const filtered = this.getFilteredItems();
    if (countBadge) {
      countBadge.textContent = `Показано: ${filtered.length} из ${atmosphereFullGallery.length}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-neutral-400 font-mono-tech">
          По выбранному фильтру пока пусто.
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((item) => {
      const isVideo = item.type === 'video';
      const thumbSrc = isVideo ? item.poster : item.src;
      const posClass = item.portrait ? 'object-[50%_22%]' : 'object-center';
      const safeTitle = escapeAttr(item.title);

      return `
        <div
          class="gallery-item-card aspect-square rounded-2xl overflow-hidden bg-neutral-900 relative cursor-pointer group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          data-id="${item.id}"
          role="button"
          tabindex="0"
          aria-label="${safeTitle}"
        >
          <img
            src="${thumbSrc}"
            alt="${safeTitle}"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover ${posClass} transition-transform duration-500 group-hover:scale-105"
          />
          ${isVideo ? `
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm group-hover:bg-red-600/80 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14z"/>
                </svg>
              </span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const openTile = (card) => {
      sound.playPick();
      const id = parseInt(card.dataset.id, 10);
      const item = filtered.find((x) => x.id === id);
      if (item) this.openLightbox(item, filtered);
    };

    grid.querySelectorAll('.gallery-item-card').forEach((card) => {
      card.addEventListener('click', () => openTile(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTile(card);
        }
      });
    });
  }

  stopLightboxVideo(resumeMusic = true) {
    const videoEl = this.modalContainer?.querySelector('#lightbox-video-player');
    if (videoEl) {
      try {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      } catch (e) {}
    }
    if (resumeMusic && this.pausedBgMusicForVideo) {
      this.pausedBgMusicForVideo = false;
      sound.playMusic();
    }
  }

  openLightbox(item, list = null) {
    const lbModal = this.modalContainer?.querySelector('#lightbox-zoom-modal');
    const lbContent = this.modalContainer?.querySelector('#lightbox-content');
    const prevBtn = this.modalContainer?.querySelector('#btn-lb-prev');
    const nextBtn = this.modalContainer?.querySelector('#btn-lb-next');
    if (!lbModal || !lbContent) return;

    const isVideo = item.type === 'video';
    this.stopLightboxVideo(!isVideo);

    if (Array.isArray(list) && list.length > 0) {
      this.lightboxItems = list;
    } else if (!this.lightboxItems || this.lightboxItems.length === 0) {
      this.lightboxItems = atmosphereFullGallery;
    }
    const foundIdx = this.lightboxItems.findIndex((x) => x.id === item.id);
    this.lightboxIndex = foundIdx !== -1 ? foundIdx : 0;

    if (isVideo && !this.pausedBgMusicForVideo && sound.isMusicRequested) {
      sound.pauseMusic();
      this.pausedBgMusicForVideo = true;
    }

    const showNav = this.lightboxItems.length > 1;
    if (prevBtn) prevBtn.classList.toggle('hidden', !showNav);
    if (nextBtn) nextBtn.classList.toggle('hidden', !showNav);

    const safeTitle = escapeAttr(item.title);

    lbContent.innerHTML = isVideo
      ? `
        <video
          id="lightbox-video-player"
          src="${item.src}"
          poster="${item.poster}"
          controls
          autoplay
          playsinline
          preload="metadata"
          class="max-h-[85vh] max-w-full w-auto mx-auto rounded-2xl bg-black shadow-2xl"
        ></video>
      `
      : `
        <img
          src="${item.src}"
          alt="${safeTitle}"
          class="max-h-[85vh] max-w-full w-auto mx-auto object-contain rounded-2xl shadow-2xl"
        />
      `;

    lbModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  stepLightbox(delta) {
    if (!this.lightboxItems || this.lightboxItems.length === 0) return;
    sound.playClick();
    const len = this.lightboxItems.length;
    const nextIdx = (this.lightboxIndex + delta + len) % len;
    this.openLightbox(this.lightboxItems[nextIdx], this.lightboxItems);
  }

  closeLightbox() {
    const lbModal = this.modalContainer?.querySelector('#lightbox-zoom-modal');
    const lbContent = this.modalContainer?.querySelector('#lightbox-content');
    this.stopLightboxVideo(true);
    if (lbContent) lbContent.innerHTML = '';
    if (lbModal) lbModal.classList.add('hidden');

    const isGalleryModalOpen = !this.modalContainer
      ?.querySelector('#atmosphere-modal-backdrop')
      ?.classList.contains('hidden');
    if (!isGalleryModalOpen) {
      document.body.style.overflow = '';
    }
  }
}
