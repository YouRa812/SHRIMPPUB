import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import gsap from 'gsap';

export class CaptchaGame {
  constructor(onSuccess) {
    this.onSuccess = onSuccess;
    this.container = null;
    this.totalPieces = 6;
    this.solvedPieces = 0;
    this.pieces = [
      { id: 1, name: "ОЧКИ И ГОЛОВА", col: 0, row: 0 },
      { id: 2, name: "УСИКИ И БУТЫЛКА", col: 1, row: 0 },
      { id: 3, name: "ПАНЦИРЬ И КЛЕШНЯ", col: 0, row: 1 },
      { id: 4, name: "ВКУСНОЕ ПИВО", col: 1, row: 1 },
      { id: 5, name: "ХВОСТ МАСКОТА", col: 0, row: 2 },
      { id: 6, name: "КОНЧИК ХВОСТА", col: 1, row: 2 }
    ];
    this.statusMap = {};
    this.isDragging = false;
    this.activePiece = null;
  }

  mount(targetEl) {
    this.container = targetEl;
    this.render();
    this.initPuzzle();
  }

  render() {
    this.container.innerHTML = `
      <div id="captcha-overlay" class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#040103] select-none transition-all duration-700">
        
        <!-- Cinematic Deep Crimson Radial Glow -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#63000b_0%,#200004_45%,#040103_85%)] pointer-events-none"></div>
        
        <!-- Cyber/Editorial Grid Lines -->
        <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none"></div>

        <!-- Huge Background Typography -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0 w-full">
          <span class="block text-[14vw] font-black uppercase tracking-tighter text-white/[0.03] leading-none select-none font-unbounded">
            SHRIMP PUB
          </span>
        </div>

        <!-- Top HUD Header -->
        <div class="relative z-10 text-center px-4 max-w-xl mb-3 sm:mb-5">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono-tech tracking-widest uppercase mb-2 sm:mb-3 shadow-[0_0_25px_rgba(255,30,39,0.3)]">
            <span class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>SYSTEM // PUB-CONTROL VERIFICATION</span>
          </div>

          <h2 class="text-2xl xs:text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-unbounded">
            СОБЕРИ <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 text-glow-red">КРЕВЕТКУ</span>
          </h2>
          <p class="text-[11px] sm:text-xs text-neutral-400 mt-1 sm:mt-2 font-mono-tech max-w-md mx-auto">
            Перетащи фрагменты креветки в центральный неоновый контур, чтобы разблокировать доступ к кранам.
          </p>
        </div>

        <!-- Central Holographic Target & Piece Bays -->
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-10 w-full max-w-5xl px-4">
          
          <!-- Left Bay for desktop -->
          <div id="bay-left" class="hidden md:flex flex-col gap-3.5 items-center justify-center min-w-[130px]"></div>

          <!-- Main Contour Target Area with Exact Aspect Ratio (1054:1181) -->
          <div class="relative flex flex-col items-center">
            
            <!-- Target Box with Exact Pixel-Perfect Aspect Ratio -->
            <div 
              id="shrimp-contour-box" 
              class="relative w-[210px] xs:w-[240px] sm:w-[280px] md:w-[310px] rounded-3xl border-2 border-red-500/50 bg-black/85 shadow-[0_0_60px_rgba(255,30,39,0.35)] backdrop-blur-xl overflow-hidden flex items-center justify-center"
              style="aspect-ratio: 1054 / 1181;"
            >
              
              <!-- HUD Corner crosshairs -->
              <span class="absolute top-2 left-2 text-[9px] sm:text-[10px] text-red-500/60 font-mono-tech">◤ 01</span>
              <span class="absolute top-2 right-2 text-[9px] sm:text-[10px] text-red-500/60 font-mono-tech">02 ◥</span>
              <span class="absolute bottom-2 left-2 text-[9px] sm:text-[10px] text-red-500/60 font-mono-tech">◣ 05</span>
              <span class="absolute bottom-2 right-2 text-[9px] sm:text-[10px] text-red-500/60 font-mono-tech">06 ◢</span>

              <!-- Neon Red Contour Background (Object-fill for 100% exact alignment) -->
              <img 
                src="./shrimp_contour.png" 
                alt="Shrimp Contour Silhouette" 
                class="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-55 filter drop-shadow-[0_0_15px_rgba(255,30,39,0.6)]"
              />

              <!-- Target Drop Grid (2 cols x 3 rows with exact pixel row fractions 393/393/395) -->
              <div 
                id="contour-grid" 
                class="absolute inset-0 grid z-10"
                style="grid-template-columns: 1fr 1fr; grid-template-rows: 393fr 393fr 395fr;"
              >
                ${this.pieces.map(p => `
                  <div 
                    id="slot-${p.id}" 
                    data-slot="${p.id}" 
                    class="slot-target relative border border-dashed border-red-500/30 transition-all duration-200 flex items-center justify-center group overflow-hidden"
                  >
                    <!-- Locked piece placeholder (object-fill for zero seams) -->
                    <img 
                      id="locked-img-${p.id}" 
                      src="./shrimp_piece_${p.id}.png" 
                      class="absolute inset-0 w-full h-full object-fill transition-all duration-300 opacity-0 scale-95 pointer-events-none filter drop-shadow-[0_0_10px_rgba(255,30,39,0.5)]"
                    />
                    <!-- Slot hint number -->
                    <span id="slot-hint-${p.id}" class="text-[10px] sm:text-[11px] text-red-500/50 font-mono-tech tracking-widest font-bold group-hover:text-red-400 transition-colors pointer-events-none">
                      [0${p.id}]
                    </span>
                  </div>
                `).join('')}
              </div>

              <!-- Full Mascot Reveal on complete -->
              <div id="full-shrimp-reveal" class="absolute inset-0 z-20 pointer-events-none opacity-0 transition-opacity duration-700">
                <img src="./shrimp_clean.png" alt="Mascot drinking beer" class="w-full h-full object-fill filter drop-shadow-[0_0_30px_rgba(255,30,39,0.9)]" />
              </div>
            </div>

            <!-- HUD Progress Counter -->
            <div class="mt-3 sm:mt-4 flex items-center justify-between w-full max-w-[280px] md:max-w-[310px] px-2 text-xs font-mono-tech">
              <span class="text-neutral-400">ГОТОВНОСТЬ КРЕВЕТКИ:</span>
              <div class="flex items-center gap-1.5">
                <span id="solved-count" class="text-red-400 font-bold text-sm">0</span>
                <span class="text-neutral-600">/ 6 ЧАСТЕЙ</span>
              </div>
            </div>
          </div>

          <!-- Right Bay for desktop -->
          <div id="bay-right" class="hidden md:flex flex-col gap-3.5 items-center justify-center min-w-[130px]"></div>

          <!-- Mobile Bay for phones (Randomized 6 pieces in 2 rows of 3) -->
          <div id="bay-mobile" class="flex md:hidden flex-wrap items-center justify-center gap-2 xs:gap-2.5 w-full max-w-sm mt-2 sm:mt-3"></div>
        </div>

        <!-- Bottom Controls (No shuffle button as requested) -->
        <div class="relative z-10 mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-4 px-4">
          <button 
            id="btn-auto-solve" 
            class="btn-magnetic px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-400/40 text-[11px] sm:text-xs font-bold font-mono-tech tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(255,30,39,0.4)] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>ПРОПУСТИТЬ КАПЧУ (Я СЛИШКОМ ХОЧУ ПИВА)</span>
          </button>
        </div>

      </div>
    `;
  }

  initPuzzle() {
    // Exactly 5/6 pieces are pre-assembled, leaving only 1 final piece (Piece 4: Beer in claw)
    this.remainingPieceId = 4;
    this.solvedPieces = 0;

    this.pieces.forEach(p => {
      if (p.id !== this.remainingPieceId) {
        this.statusMap[p.id] = true;
        this.solvedPieces++;

        const lockedImg = document.getElementById(`locked-img-${p.id}`);
        const slotHint = document.getElementById(`slot-hint-${p.id}`);
        const slot = document.getElementById(`slot-${p.id}`);

        if (lockedImg) {
          lockedImg.classList.remove('opacity-0', 'scale-95');
          lockedImg.classList.add('opacity-100', 'scale-100');
        }
        if (slotHint) slotHint.classList.add('opacity-0');
        if (slot) {
          slot.classList.remove('border-dashed', 'border-red-500/30');
          slot.classList.add('border-solid', 'border-red-500/10');
        }
      } else {
        this.statusMap[p.id] = false;
        // Make the single remaining slot pulse with glowing invitation
        const slot = document.getElementById(`slot-${p.id}`);
        if (slot) {
          slot.classList.add('border-red-500', 'shadow-[inset_0_0_25px_rgba(255,30,39,0.5)]', 'animate-pulse');
        }
      }
    });

    const countEl = document.getElementById('solved-count');
    if (countEl) countEl.textContent = this.solvedPieces;

    this.populateBays();
    this.bindEvents();
    // Captcha is always active on every launch/refresh (no skip from sessionStorage)
  }

  // Shuffle array randomly using Fisher-Yates
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  populateBays() {
    const leftBay = document.getElementById('bay-left');
    const rightBay = document.getElementById('bay-right');
    const mobileBay = document.getElementById('bay-mobile');

    if (!leftBay || !rightBay || !mobileBay) return;
    leftBay.innerHTML = '';
    rightBay.innerHTML = '';
    mobileBay.innerHTML = '';

    // Only populate unsolved pieces (1 final piece)
    const unsolvedPieces = this.pieces.filter(p => !this.statusMap[p.id]);

    unsolvedPieces.forEach((p) => {
      // For desktop, place in left bay with a sleek highlight glow
      const card = this.createDraggablePiece(p, false);
      card.classList.add('shadow-[0_0_30px_rgba(255,30,39,0.45)]', 'border-red-500/60');
      leftBay.appendChild(card);

      // For mobile
      const mobileCard = this.createDraggablePiece(p, true);
      mobileCard.classList.add('shadow-[0_0_25px_rgba(255,30,39,0.45)]', 'border-red-500/60');
      mobileBay.appendChild(mobileCard);
    });
  }

  createDraggablePiece(p, isMobile = false) {
    const el = document.createElement('div');
    el.id = `draggable-piece-${p.id}${isMobile ? '-m' : ''}`;
    el.dataset.pieceId = p.id;
    el.className = `draggable-chip relative cursor-grab active:cursor-grabbing w-[72px] xs:w-[84px] sm:w-[96px] md:w-[115px] rounded-xl sm:rounded-2xl border border-red-500/30 bg-neutral-950/90 p-1 shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:border-red-400 hover:shadow-[0_0_20px_rgba(255,30,39,0.3)] transition-all select-none touch-none`;
    el.style.aspectRatio = '527 / 393';

    el.innerHTML = `
      <div class="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center bg-black/40">
        <img src="./shrimp_piece_${p.id}.png" alt="${p.name}" class="w-full h-full object-contain pointer-events-none drop-shadow" />
        <span class="absolute bottom-1 right-1 text-[8px] sm:text-[9px] font-mono-tech text-red-400 bg-black/90 px-1 py-0.5 rounded border border-red-500/30 pointer-events-none">0${p.id}</span>
      </div>
    `;

    this.attachDragLogic(el, p.id);
    return el;
  }

  attachDragLogic(el, pieceId) {
    let startPointerX = 0, startPointerY = 0;
    let initialLeft = 0, initialTop = 0;
    let pieceWidth = 0, pieceHeight = 0;
    let isPointerDown = false;
    let cachedSlotRect = null;

    const onPointerDown = (e) => {
      if (this.statusMap[pieceId]) return;
      if (e.button !== undefined && e.button !== 0) return;

      try {
        sound.playPick();
      } catch (err) {}
      this.isDragging = true;
      this.activePiece = el;
      isPointerDown = true;

      startPointerX = e.clientX;
      startPointerY = e.clientY;

      const rect = el.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      pieceWidth = rect.width;
      pieceHeight = rect.height;

      const targetSlot = document.getElementById(`slot-${pieceId}`);
      if (targetSlot) {
        cachedSlotRect = targetSlot.getBoundingClientRect();
      }

      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {}

      // Disable any CSS transitions during drag for ZERO lag and instant response
      el.style.transition = 'none';
      el.style.position = 'fixed';
      el.style.left = `${initialLeft}px`;
      el.style.top = `${initialTop}px`;
      el.style.width = `${pieceWidth}px`;
      el.style.height = `${pieceHeight}px`;
      el.style.zIndex = '9999';
      el.style.touchAction = 'none';
      el.style.willChange = 'transform';
      el.style.transform = 'translate3d(0, 0, 0) scale(1.06)';
      el.classList.add('ring-2', 'ring-red-500', 'shadow-[0_0_35px_rgba(255,30,39,0.9)]');

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.activePiece !== el) return;
      e.preventDefault();

      const deltaX = e.clientX - startPointerX;
      const deltaY = e.clientY - startPointerY;

      // Instant hardware-accelerated transform with 0ms transition delay
      el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.06)`;

      if (cachedSlotRect) {
        const pieceCenterX = initialLeft + deltaX + pieceWidth / 2;
        const pieceCenterY = initialTop + deltaY + pieceHeight / 2;
        const slotCenterX = cachedSlotRect.left + cachedSlotRect.width / 2;
        const slotCenterY = cachedSlotRect.top + cachedSlotRect.height / 2;

        const dist = Math.hypot(pieceCenterX - slotCenterX, pieceCenterY - slotCenterY);
        const isNear = dist < 130 || (
          (initialLeft + deltaX + pieceWidth) >= cachedSlotRect.left - 20 &&
          (initialLeft + deltaX) <= cachedSlotRect.right + 20 &&
          (initialTop + deltaY + pieceHeight) >= cachedSlotRect.top - 20 &&
          (initialTop + deltaY) <= cachedSlotRect.bottom + 20
        );

        const targetSlot = document.getElementById(`slot-${pieceId}`);
        if (targetSlot) {
          if (isNear) {
            targetSlot.classList.add('bg-red-500/40', 'border-red-400', 'shadow-[inset_0_0_20px_rgba(255,30,39,0.5)]');
          } else {
            targetSlot.classList.remove('bg-red-500/40', 'border-red-400', 'shadow-[inset_0_0_20px_rgba(255,30,39,0.5)]');
          }
        }
      }
    };

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      this.isDragging = false;
      this.activePiece = null;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}

      el.classList.remove('ring-2', 'ring-red-500', 'shadow-[0_0_35px_rgba(255,30,39,0.9)]');

      const targetSlot = document.getElementById(`slot-${pieceId}`);
      if (targetSlot) {
        targetSlot.classList.remove('bg-red-500/40', 'border-red-400', 'shadow-[inset_0_0_20px_rgba(255,30,39,0.5)]');
      }

      const deltaX = e.clientX - startPointerX;
      const deltaY = e.clientY - startPointerY;

      let isNear = false;
      if (cachedSlotRect) {
        const pieceCenterX = initialLeft + deltaX + pieceWidth / 2;
        const pieceCenterY = initialTop + deltaY + pieceHeight / 2;
        const slotCenterX = cachedSlotRect.left + cachedSlotRect.width / 2;
        const slotCenterY = cachedSlotRect.top + cachedSlotRect.height / 2;

        const dist = Math.hypot(pieceCenterX - slotCenterX, pieceCenterY - slotCenterY);
        isNear = dist < 130 || (
          (initialLeft + deltaX + pieceWidth) >= cachedSlotRect.left - 25 &&
          (initialLeft + deltaX) <= cachedSlotRect.right + 25 &&
          (initialTop + deltaY + pieceHeight) >= cachedSlotRect.top - 25 &&
          (initialTop + deltaY) <= cachedSlotRect.bottom + 25
        );
      }

      if (isNear && cachedSlotRect) {
        // Smooth snap animation into the slot using GSAP
        const targetDeltaX = cachedSlotRect.left - initialLeft;
        const targetDeltaY = cachedSlotRect.top - initialTop;

        gsap.to(el, {
          x: targetDeltaX,
          y: targetDeltaY,
          width: cachedSlotRect.width,
          height: cachedSlotRect.height,
          scale: 1,
          duration: 0.16,
          ease: 'power2.out',
          onComplete: () => {
            this.lockPiece(pieceId);
            el.remove();
          }
        });
        return;
      }

      // Smooth return to initial spot
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          el.style.position = '';
          el.style.left = '';
          el.style.top = '';
          el.style.width = '';
          el.style.height = '';
          el.style.zIndex = '';
          el.style.touchAction = '';
          el.style.willChange = '';
          el.style.transition = '';
          el.style.transform = '';
        }
      });
    };

    el.addEventListener('pointerdown', onPointerDown);
  }

  lockPiece(pieceId) {
    if (this.statusMap[pieceId]) return;
    this.statusMap[pieceId] = true;
    this.solvedPieces++;

    try {
      sound.playSnap();
    } catch (e) {}

    const lockedImg = document.getElementById(`locked-img-${pieceId}`);
    const slotHint = document.getElementById(`slot-hint-${pieceId}`);
    const slot = document.getElementById(`slot-${pieceId}`);

    if (lockedImg) {
      lockedImg.classList.remove('opacity-0', 'scale-95');
      lockedImg.classList.add('opacity-100', 'scale-100');
    }
    if (slotHint) slotHint.classList.add('opacity-0');
    if (slot) {
      slot.classList.remove('border-dashed', 'border-red-500/30');
      slot.classList.add('border-solid', 'border-transparent');
    }

    const d1 = document.getElementById(`draggable-piece-${pieceId}`);
    const d2 = document.getElementById(`draggable-piece-${pieceId}-m`);
    if (d1) d1.remove();
    if (d2) d2.remove();

    const countEl = document.getElementById('solved-count');
    if (countEl) countEl.textContent = this.solvedPieces;

    if (this.solvedPieces >= this.totalPieces) {
      this.handleVictory();
    }
  }

  autoSolve() {
    this.pieces.forEach(p => {
      this.lockPiece(p.id);
    });
  }

  dismissCaptcha() {
    const overlay = document.getElementById('captcha-overlay');
    if (overlay && !this.isDismissed) {
      this.isDismissed = true;
      gsap.to(overlay, {
        opacity: 0,
        scale: 1.05,
        duration: 0.5,
        ease: 'power3.inOut',
        onComplete: () => {
          overlay.remove();
          this.onSuccess();
        }
      });
    }
  }

  handleVictory() {
    const fullReveal = document.getElementById('full-shrimp-reveal');
    if (fullReveal) fullReveal.classList.remove('opacity-0');

    try {
      sound.playBeerVictory();
    } catch (e) {}

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff1e27', '#ffffff', '#ff6b7b', '#f59e0b']
      });
    } catch (e) {}

    // Automatically transition to the pub after celebratory reveal
    setTimeout(() => {
      this.dismissCaptcha();
    }, 700);
  }

  bindEvents() {
    const autoSolveBtn = document.getElementById('btn-auto-solve');
    if (autoSolveBtn) {
      autoSolveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          sound.playClick();
        } catch (e) {}
        this.autoSolve();
      });
    }
  }
}
