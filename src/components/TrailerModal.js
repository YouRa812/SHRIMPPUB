import gsap from 'gsap';
import { sound } from '../utils/audio.js';

export function formatVkEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Automatically transforms https://vkvideo.ru/video200001415193_456239017 into responsive embed
  const match = trimmed.match(/vk(?:video)?\.(?:ru|com)\/video(-?\d+)_(\d+)/i);
  if (match) {
    const [, oid, id] = match;
    const knownHash = (oid === '200001415193' && id === '456239017') ? '&hash=f5a29f9fda8282d1' : '';
    return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}${knownHash}&hd=3&autoplay=1`;
  }
  return trimmed;
}

export class TrailerModal {
  constructor(options = {}) {
    // Official Pub Trailer on VK Video: https://vkvideo.ru/video200001415193_456239017
    this.vkVideoUrl = formatVkEmbedUrl(options.vkVideoUrl || 'https://vkvideo.ru/video_ext.php?oid=200001415193&id=456239017&hash=f5a29f9fda8282d1&hd=3&autoplay=1');
    // Optional fallback local demo video if offline/testing without internet
    this.localFallbackVideo = options.localFallbackVideo || './atmos_video_05.mp4';
    this.onEnterSite = options.onEnterSite || (() => {});
    
    this.choiceEl = null;
    this.playerEl = null;
    this.keyHandler = null;
    this.isSiteEntered = false;
    this.pausedMusicForTrailer = false;
  }

  /**
   * Shows the compact glassmorphic choice card modal immediately after captcha
   */
  showChoice() {
    this.closeChoice();

    const choiceOverlay = document.createElement('div');
    choiceOverlay.id = 'trailer-choice-overlay';
    choiceOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none opacity-0';
    choiceOverlay.setAttribute('data-lenis-prevent', 'true');

    choiceOverlay.innerHTML = `
      <!-- Ambient Crimson Glow in Backdrop -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#63000b_0%,#200004_50%,#040103_85%)] pointer-events-none opacity-85"></div>
      
      <!-- Subtle Cyber Grid -->
      <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <!-- Main Compact Choice Card -->
      <div 
        id="trailer-choice-card" 
        class="relative z-10 w-full max-w-md sm:max-w-lg bg-[#0e0407]/95 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_65px_rgba(255,30,39,0.35)] backdrop-blur-2xl text-center transform scale-95 transition-all overflow-hidden"
      >
        <!-- Corner HUD Markers -->
        <span class="absolute top-2.5 left-3 text-[9px] text-red-500/60 font-mono-tech">◤ 01</span>
        <span class="absolute top-2.5 right-3 text-[9px] text-red-500/60 font-mono-tech">02 ◥</span>
        <span class="absolute bottom-2.5 left-3 text-[9px] text-red-500/60 font-mono-tech">◣ 05</span>
        <span class="absolute bottom-2.5 right-3 text-[9px] text-red-500/60 font-mono-tech">06 ◢</span>

        <!-- Mascot / Header Icon -->
        <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-950/80 border border-red-500/50 mb-3 shadow-[0_0_25px_rgba(255,30,39,0.4)]">
          <img src="./logo.png" alt="Shrimp Pub" class="h-10 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(255,30,39,0.5)]" />
        </div>

        <!-- Top Badge -->
        <div class="mb-2.5">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-red-300 text-[10px] sm:text-[11px] font-mono-tech font-bold uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            ДОСТУП РАЗБЛОКИРОВАН
          </span>
        </div>

        <!-- Main Title -->
        <h3 class="text-lg xs:text-xl sm:text-2xl font-black text-white uppercase font-unbounded tracking-tight leading-snug">
          КАК НАЧНЁМ <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">ЗНАКОМСТВО?</span>
        </h3>

        <!-- Description -->
        <p class="text-xs sm:text-[13px] text-neutral-300 font-mono-tech mt-2 mb-6 leading-relaxed max-w-sm mx-auto">
          Можно сразу перейти к пивной карте и кухне или погрузиться в атмосферу нашего штаба через фирменный видео-трейлер.
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <!-- Button 1: Watch Trailer -->
          <button 
            id="btn-choice-watch-trailer" 
            type="button"
            class="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-unbounded font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(255,30,39,0.45)] transition-all transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <span>ПОСМОТРЕТЬ ТРЕЙЛЕР ПАБА</span>
            <svg class="w-3.5 h-3.5 text-red-200 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </button>

          <!-- Button 2: Enter Site Directly -->
          <button 
            id="btn-choice-enter-site" 
            type="button"
            class="w-full py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/12 font-mono-tech font-bold text-xs sm:text-[12.5px] uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>СРАЗУ НА САЙТ (К ПИВУ И КУХНЕ)</span>
          </button>
        </div>

        <div class="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono-tech text-neutral-500">
          SHRIMP PUB • САНКТ-ПЕТЕРБУРГ • ЭНГЕЛЬСА, 58А
        </div>
      </div>
    `;

    document.body.appendChild(choiceOverlay);
    this.choiceEl = choiceOverlay;

    // Smooth Entrance with GSAP
    gsap.to(choiceOverlay, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out'
    });

    const card = choiceOverlay.querySelector('#trailer-choice-card');
    if (card) {
      gsap.to(card, {
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)'
      });
    }

    // Attach Click Events
    const btnTrailer = choiceOverlay.querySelector('#btn-choice-watch-trailer');
    if (btnTrailer) {
      btnTrailer.addEventListener('click', (e) => {
        e.preventDefault();
        try { sound.playClick(); } catch (_) {}
        this.closeChoice(() => {
          this.openPlayer();
        });
      });
    }

    const btnSite = choiceOverlay.querySelector('#btn-choice-enter-site');
    const enterSite = () => {
      // Start playback during the click or keypress, before the GSAP callback.
      sound.playMusic();
      sound.playClick();
      this.closeChoice(() => {
        this.completeEntrance();
      });
    };
    btnSite?.addEventListener('click', enterSite);
    this.setupKeyHandler(enterSite);
  }

  closeChoice(callback) {
    if (this.choiceEl) {
      const el = this.choiceEl;
      this.choiceEl = null;
      this.removeKeyHandler();
      gsap.to(el, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          el.remove();
          if (typeof callback === 'function') callback();
        }
      });
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  /**
   * Opens the dedicated cinema modal with VK Video player (16:9)
   */
  openPlayer(customVideoUrl) {
    this.closePlayer();

    if (sound.isMusicRequested) {
      sound.pauseMusic();
      this.pausedMusicForTrailer = true;
    }

    const embedUrl = formatVkEmbedUrl(customVideoUrl || this.vkVideoUrl);
    const isDirectMp4 = embedUrl.endsWith('.mp4');

    const playerOverlay = document.createElement('div');
    playerOverlay.id = 'trailer-player-overlay';
    playerOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-black/92 backdrop-blur-2xl opacity-0';
    playerOverlay.setAttribute('data-lenis-prevent', 'true');

    // Video Player markup
    playerOverlay.innerHTML = `
      <!-- Ambient Radial Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#63000b_0%,#190003_55%,#040103_90%)] pointer-events-none opacity-75"></div>

      <!-- Cinema Stage Box -->
      <div 
        id="trailer-player-stage" 
        class="relative z-10 w-full max-w-4xl bg-[#080204] border-2 border-red-500/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,30,39,0.4)] flex flex-col transform scale-95 transition-all"
      >
        <!-- Cinema Header Bar -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/60">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span class="text-xs sm:text-sm font-black font-unbounded text-white uppercase tracking-tight">
              SHRIMP PUB <span class="text-red-500">//</span> ТРЕЙЛЕР ПАБА
            </span>
          </div>

          <div class="flex items-center gap-2">
            <a 
              href="https://vkvideo.ru/video200001415193_456239017" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hidden xs:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-mono-tech text-[11px] uppercase tracking-wider transition-all"
              title="Открыть видео напрямую в VK Видео"
            >
              <span>VK Видео</span>
              <svg class="w-3 h-3 text-neutral-400 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>

            <!-- Close / Skip Button -->
            <button 
              id="btn-close-trailer" 
              type="button"
              class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-white font-mono-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Закрыть трейлер и перейти на сайт (Esc)"
            >
              <span>Закрыть</span>
              <span class="text-sm font-bold leading-none">✕</span>
            </button>
          </div>
        </div>

        <!-- 16:9 Video Canvas -->
        <div class="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          ${isDirectMp4 ? `
            <video 
              id="trailer-media-el"
              src="${embedUrl}" 
              class="w-full h-full object-cover" 
              controls 
              autoplay 
              playsinline
            ></video>
          ` : `
            <iframe 
              id="trailer-media-el"
              src="${embedUrl}" 
              class="w-full h-full border-0" 
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" 
              frameborder="0" 
              allowfullscreen
            ></iframe>
          `}
        </div>

        <!-- Cinema Bottom Bar -->
        <div class="flex items-center justify-between flex-wrap gap-2 px-4 sm:px-6 py-3 border-t border-white/10 bg-black/60 text-xs font-mono-tech">
          <div class="text-neutral-400 hidden sm:block">
            <span>Качество транслируется через CDN • Нажмите <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Esc</kbd> для закрытия</span>
          </div>

          <button 
            id="btn-trailer-enter-site" 
            type="button"
            class="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-unbounded font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Перейти на сайт</span>
            <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(playerOverlay);
    this.playerEl = playerOverlay;

    // Smooth Entrance
    gsap.to(playerOverlay, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out'
    });

    const stage = playerOverlay.querySelector('#trailer-player-stage');
    if (stage) {
      gsap.to(stage, {
        scale: 1,
        duration: 0.4,
        ease: 'power3.out'
      });
    }

    // Close button & bottom CTA
    const closeBtn = playerOverlay.querySelector('#btn-close-trailer');
    const enterSiteBtn = playerOverlay.querySelector('#btn-trailer-enter-site');

    const handleClose = () => {
      if (!this.playerEl) return;
      const playMusic = !this.isSiteEntered || this.pausedMusicForTrailer;
      this.pausedMusicForTrailer = false;
      sound.playClick();
      this.closePlayer(() => {
        this.completeEntrance();
      });
      if (playMusic) sound.playMusic();
    };

    if (closeBtn) closeBtn.addEventListener('click', handleClose);
    if (enterSiteBtn) enterSiteBtn.addEventListener('click', handleClose);

    // Backdrop click outside stage closes player
    playerOverlay.addEventListener('click', (e) => {
      if (e.target === playerOverlay) {
        handleClose();
      }
    });

    // Escape key
    this.setupKeyHandler(handleClose);
  }

  closePlayer(callback) {
    if (this.playerEl) {
      const el = this.playerEl;
      this.playerEl = null;
      this.removeKeyHandler();

      // Immediately pause if native video
      const videoEl = el.querySelector('video');
      if (videoEl) {
        try { videoEl.pause(); } catch (_) {}
      }

      el.querySelector('iframe')?.remove();

      gsap.to(el, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          el.remove();
          if (typeof callback === 'function') callback();
        }
      });
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  completeEntrance() {
    this.isSiteEntered = true;
    if (typeof this.onEnterSite === 'function') {
      this.onEnterSite();
    }
  }

  setupKeyHandler(onEscape) {
    this.removeKeyHandler();
    this.keyHandler = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        onEscape();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  removeKeyHandler() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  // Update URL if client changes it dynamically
  setVideoUrl(url) {
    if (url) {
      this.vkVideoUrl = formatVkEmbedUrl(url);
    }
  }
}
