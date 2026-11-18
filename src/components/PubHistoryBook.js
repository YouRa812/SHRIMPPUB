import { PageFlip } from 'page-flip';
import { sound } from '../utils/audio.js';

export class PubHistoryBook {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.pageFlip = null;
    this.currentPage = 0;
    this.totalPages = 12;
    this.initTimer = null;
    this.handleResize = null;
  }

  mount() {
    if (!this.container) return;
    this.destroy();
    this.render();
    this.initTimer = setTimeout(() => {
      this.initPageFlip();
    }, 60);
  }

  destroy() {
    if (this.initTimer) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
    }
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
      this.handleResize = null;
    }
    if (this.pageFlip) {
      try {
        this.pageFlip.destroy();
      } catch (e) {
        // Ignore teardown errors if DOM already cleared
      }
      this.pageFlip = null;
    }
  }

  render() {
    this.container.innerHTML = `
      <style>
        #pub-history-book-mount #st-flip-book,
        #pub-history-book-mount .st-flip-book {
          box-shadow: none !important;
          background: transparent !important;
        }
        #pub-history-book-mount .pub-book-page.cover-page-front {
          background-color: transparent !important;
          background: transparent !important;
          overflow: visible !important;
        }
        #pub-history-book-mount .pub-book-page.cover-page-back {
          background-color: #2b120e !important;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.38);
        }
        #pub-history-book-mount .pub-book-page.paper-page,
        #pub-history-book-mount .pub-book-page.inside-cover-page {
          background: #f7f2e7 url('./kraft_paper.webp') center/cover no-repeat !important;
          box-shadow: inset 0 0 28px rgba(82, 48, 22, 0.08), 0 10px 28px rgba(0, 0, 0, 0.16);
          color: #120a05 !important;
        }
      </style>

      <div class="pub-book-wrapper w-full max-w-5xl mx-auto select-none py-2 sm:py-5">
        
        <!-- Controls & Status Bar -->
        <div class="flex items-center justify-between flex-wrap gap-3 mb-3 px-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span class="text-xs font-mono-tech uppercase font-bold text-neutral-600 tracking-wider">
              ХРОНИКА ПАБА // 2020–2026+
            </span>
          </div>

          <div class="flex items-center gap-2 font-mono-tech">
            <button 
              id="book-btn-prev" 
              type="button"
              class="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-neutral-800 transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              title="Предыдущая страница"
            >
              ← Назад
            </button>

            <span id="book-page-counter" class="px-3.5 py-1 rounded-xl bg-black text-white text-xs font-bold tracking-wider">
              Обложка
            </span>

            <button 
              id="book-btn-next" 
              type="button"
              class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              title="Следующая страница"
            >
              Вперед →
            </button>
          </div>
        </div>

        <!-- Clear Tap-to-Turn Hint ABOVE the Book -->
        <div class="mb-4 px-2 flex justify-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/5 border border-amber-900/15 text-[11px] sm:text-xs font-mono-tech font-bold text-neutral-800 text-center">
            <span>Нажмите на книгу, чтобы открыть её — кликайте по странице для перелистывания</span>
          </div>
        </div>

        <!-- Book Stage Container -->
        <div class="book-flip-container relative w-full flex items-center justify-center min-h-[420px] sm:min-h-[540px] py-2">
          
          <!-- StPageFlip Host: transparent wrapper, zero rectangle box shadow, smooth horizontal centering -->
          <div 
            id="st-flip-book" 
            class="st-flip-book"
            style="box-shadow: none !important; background: transparent !important; transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1); will-change: transform;"
          >

            <!-- PAGE 0: FRONT COVER (HARD) — Pure transparent cutout cover image, ZERO overlays -->
            <div class="pub-book-page cover-page cover-page-front bg-transparent cursor-pointer" data-density="hard">
              <img src="./book_cover.png" alt="Обложка книги ShrimpPub" class="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_18px_38px_rgba(0,0,0,0.45)]" />
            </div>

            <!-- PAGE 1: TITLE / DEDICATION (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-r border-amber-950/20 relative overflow-hidden">
                <div class="absolute inset-2.5 border border-amber-900/30 rounded-lg pointer-events-none"></div>
                <div class="absolute top-0 bottom-0 right-0 w-7 bg-gradient-to-l from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="tracking-wider">ЛЕТОПИСЬ ПАБА</span>
                    <span class="tracking-wider">ТОМ I</span>
                  </div>

                  <div class="mt-4 sm:mt-6 text-center">
                    
                    <div class="text-[11px] sm:text-xs font-mono-tech uppercase tracking-widest text-red-900 font-black">
                      SHRIMP PUB // SAINT-P
                    </div>
                    <h4 class="text-base sm:text-xl font-black uppercase font-unbounded tracking-tight text-[#0a0502] mt-1.5 leading-snug">
                      Наша настоящая история
                    </h4>
                    <div class="inline-block mt-2 px-3.5 py-1 rounded-full bg-amber-900/12 border border-amber-900/30 text-amber-950 text-[11px] sm:text-xs font-mono-tech font-black tracking-wider">
                      Димка и Ленка
                    </div>
                  </div>

                  <p class="text-xs sm:text-[13.5px] text-[#18100a] font-serif italic mt-4 sm:mt-5 leading-relaxed text-center max-w-xs mx-auto font-medium">
                    «Эта книга — без прикрас и глянца. О том, как мечта длиною в двадцать лет стала уютным домом для целого района.»
                  </p>

                  <div class="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-amber-900/8 border border-amber-900/25 text-xs sm:text-[12.5px] font-mono-tech text-[#140c07] font-medium space-y-1.5 text-center">
                    <div>Открытие: <strong class="text-[#0a0502] font-black">20.02.2020 в 20:20</strong></div>
                    <div>Санкт-Петербург, пр. Энгельса, 58А</div>
                    <div>Крафт, морепродукты и свои люди</div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Посвящение</span>
                  <span class="tracking-wider">Стр. 01</span>
                </div>
              </div>
            </div>

            <!-- PAGE 2: CHAPTER I — ПАМЯТЬ О НУМЕРОЛОГЕ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-l border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 left-0 w-7 bg-gradient-to-r from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="font-black text-red-900 tracking-wider">ГЛАВА I</span>
                    <span class="font-bold text-[#140c07] tracking-wider">20.02.2020 • 20:20</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <span class="px-2.5 py-0.5 rounded bg-red-900/12 text-red-950 border border-red-900/30 text-[10px] font-mono-tech font-black uppercase tracking-wider inline-block">
                      ЗНАК СВЫШЕ
                    </span>
                    <h4 class="text-sm sm:text-xl font-black uppercase text-[#0a0502] font-unbounded tracking-tight leading-snug">
                      ПАМЯТЬ О НУМЕРОЛОГЕ
                    </h4>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        Когда мы с Ленкой готовились к открытию, нам хотелось по-настоящему красивой и запоминающейся даты. Так появилась цифра <strong class="text-[#0a0502] font-black">20.02.2020, 20:20</strong>.
                      </p>
                      <p>
                        Перед стартом Елена решила написать знакомому нумерологу и спросить, что сулит такая комбинация двоек и нулей на входе.
                      </p>
                    </div>

                    <blockquote class="p-3 sm:p-3.5 rounded-xl bg-amber-900/8 border-l-4 border-red-700 text-xs sm:text-[13.5px] italic text-[#0f0703] leading-relaxed font-serif font-medium">
                      «Ребята, вы совсем с ума сошли? Открываться в такую дату — вам будет очень сложно… но вы выживете.»
                    </blockquote>

                    <p class="text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      Тогда мы посмеялись. Мы ещё не знали, насколько пророческим окажется этот короткий ответ уже через пару недель.
                    </p>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Глава I</span>
                  <span class="tracking-wider">Стр. 02</span>
                </div>
              </div>
            </div>

            <!-- PAGE 3: CHAPTER II PART 1 — ЗЕНИТ И КУБОК АНГЛИИ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-r border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 right-0 w-7 bg-gradient-to-l from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="font-black text-red-900 tracking-wider">ГЛАВА II</span>
                    <span class="font-bold text-[#140c07] tracking-wider">2000-Е ГОДЫ</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <span class="px-2.5 py-0.5 rounded bg-sky-900/12 text-sky-950 border border-sky-900/30 text-[10px] font-mono-tech font-black uppercase tracking-wider inline-block">
                      ИСТОКИ ИДЕИ
                    </span>
                    <h4 class="text-sm sm:text-xl font-black uppercase text-[#0a0502] font-unbounded tracking-tight leading-snug">
                      «ЗЕНИТ» И КУБОК АНГЛИИ
                    </h4>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        Всё зародилось ещё в нашей фанатской молодости 2000-х. Мы с Ленкой — выходцы с виража и движения болельщиков «Зенита» тех самых ярких времён.
                      </p>
                      <p>
                        Футбол был нашей стихией. Как-то раз мы смотрели обзор матчей Кубка Англии, и на экране шёл сюжет игры скромных клубов: <strong class="text-[#0a0502] font-black">«Честерфилд — Моркамб FC»</strong>.
                      </p>
                      <p>
                        Камера крупно показала логотип гостей — клуба <strong class="text-[#0a0502] font-black">Morecambe F.C.</strong> На щите красовалась дерзкая красная креветка.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Shrimp Pub Chronicle</span>
                  <span class="tracking-wider">Стр. 03</span>
                </div>
              </div>
            </div>

            <!-- PAGE 4: CHAPTER II PART 2 — КРЕВЕТКА МОРКАМБ И 20 ЛЕТ МЕЧТЫ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-l border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 left-0 w-7 bg-gradient-to-r from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="tracking-wider text-[#140c07]">МОРКАМБ FC • THE SHRIMPS</span>
                    <span class="tracking-wider text-red-900 font-black">ОЗАРЕНИЕ</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <div class="p-3 sm:p-3.5 rounded-xl bg-[#26100c] text-amber-50 flex items-center gap-3 shadow-md border border-amber-500/40">
                      <span class="font-unbounded font-black text-amber-400 text-sm shrink-0">MFC</span>
                      <div class="text-[11px] sm:text-xs font-mono-tech leading-snug">
                        <div class="text-amber-300 font-black uppercase tracking-wider">Андеграундный клуб + паб</div>
                        <div class="text-amber-100 font-medium">+ море креветок на кухне!</div>
                      </div>
                    </div>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        В ту секунду щёлкнул переключатель: маленькая английская команда по прозвищу «Креветки», честная атмосфера британского паба, краны со свежим пивом и морепродукты!
                      </p>
                      <p>
                        От того самого озарения до момента, когда мы наконец решились открыть свои двери, прошло <strong class="text-[#0a0502] font-black">целых 20 лет вынашивания мечты</strong>.
                      </p>
                    </div>

                    <blockquote class="p-3 rounded-xl bg-amber-900/8 border-l-4 border-amber-800 text-xs sm:text-[13.5px] italic text-[#0f0703] font-serif font-medium leading-relaxed">
                      «Мы не торопились — просто знали, что однажды обязательно сделаем место по душе.»
                    </blockquote>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Глава II</span>
                  <span class="tracking-wider">Стр. 04</span>
                </div>
              </div>
            </div>

            <!-- PAGE 5: CHAPTER III PART 1 — 20.02.2020 В 20:20 (ПОЧТИ В ШУТКУ) (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-r border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 right-0 w-7 bg-gradient-to-l from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="font-black text-red-900 tracking-wider">ГЛАВА III</span>
                    <span class="font-bold text-[#140c07] tracking-wider">ДЕНЬ СТАРТА</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <span class="px-2.5 py-0.5 rounded bg-amber-900/12 text-amber-950 border border-amber-900/30 text-[10px] font-mono-tech font-black uppercase tracking-wider inline-block">
                      ПОЧТИ В ШУТКУ
                    </span>
                    <h4 class="text-sm sm:text-xl font-black uppercase text-[#0a0502] font-unbounded tracking-tight leading-snug">
                      20.02.2020 В 20:20
                    </h4>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        К заветному дню мы были полностью готовы: ремонт закончен, пиво подключено, кухня заряжена. Ровно в <strong class="text-[#0a0502] font-black">20:20</strong> мы открыли двери.
                      </p>
                      <p>
                        И сделали это почти в шутку — без громкой рекламы, баннеров и ажиотажа. Честно говоря, даже не думали, что в тот первый вечер вообще кто-то зайдёт с улицы.
                      </p>
                      <p>
                        Но уже через полчаса всё пошло совсем не по тихому сценарию…
                      </p>
                    </div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Shrimp Pub Chronicle</span>
                  <span class="tracking-wider">Стр. 05</span>
                </div>
              </div>
            </div>

            <!-- PAGE 6: CHAPTER III PART 2 — ПЕРВЫЕ ГОСТИ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-l border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 left-0 w-7 bg-gradient-to-r from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="tracking-wider text-[#140c07]">ПЕРВЫЙ ВЕЧЕР</span>
                    <span class="tracking-wider text-red-900 font-black">АНШЛАГ</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <div class="p-3 sm:p-3.5 rounded-xl bg-[#26100c] text-amber-50 flex items-center gap-3 shadow-md border border-amber-500/40">
                      <span class="font-unbounded font-black text-amber-400 text-sm shrink-0">2020</span>
                      <div class="text-[11px] sm:text-xs font-mono-tech leading-snug">
                        <div class="text-amber-300 font-black uppercase tracking-wider">3–4 полных стола</div>
                        <div class="text-amber-100 font-medium">и гости прямо на барной стойке!</div>
                      </div>
                    </div>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        Народ повалил в первый же вечер! Сразу заняли <strong class="text-[#0a0502] font-black">3–4 стола</strong>, а когда стулья у бара закончились, ребята сидели чуть ли не прямо на самой барной стойке.
                      </p>
                      <p>
                        Глядя на этот тёплый шум, улыбки и полные бокалы в самый первый вечер, мы поняли главное: мы здесь на своём месте и правда <strong class="text-[#0a0502] font-black">нужны району</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Глава III</span>
                  <span class="tracking-wider">Стр. 06</span>
                </div>
              </div>
            </div>

            <!-- PAGE 7: CHAPTER IV PART 1 — ЗА МЕСЯЦ ДО ЛОКДАУНА (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-r border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 right-0 w-7 bg-gradient-to-l from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="font-black text-red-900 tracking-wider">ГЛАВА IV</span>
                    <span class="font-bold text-[#140c07] tracking-wider">ВЕСНА 2020</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <span class="px-2.5 py-0.5 rounded bg-rose-900/12 text-rose-950 border border-rose-900/30 text-[10px] font-mono-tech font-black uppercase tracking-wider inline-block">
                      ПРОВЕРКА НА ПРОЧНОСТЬ
                    </span>
                    <h4 class="text-sm sm:text-xl font-black uppercase text-[#0a0502] font-unbounded tracking-tight leading-snug">
                      ЗА МЕСЯЦ ДО ЛОКДАУНА
                    </h4>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        Ровно через месяц после открытия полыхнул коронавирус и пришёл жёсткий локдаун. И в этот момент слова нумеролога зазвенели в голове как никогда громко.
                      </p>
                      <p>
                        Всё вокруг закрывалось, но сдаваться мы не собирались. Как в старой притче о двух лягушках в кувшине с молоком — мы <strong class="text-[#0a0502] font-black">барахтались и день за днём сбивали свои сливки</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Shrimp Pub Chronicle</span>
                  <span class="tracking-wider">Стр. 07</span>
                </div>
              </div>
            </div>

            <!-- PAGE 8: CHAPTER IV PART 2 — ИНТЕРВЬЮ ДУДЮ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-l border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 left-0 w-7 bg-gradient-to-r from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="tracking-wider text-[#140c07]">КАК МЫ ВЫСТОЯЛИ</span>
                    <span class="tracking-wider text-red-900 font-black">ЧЕСТНЫЙ ОТВЕТ</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <div class="p-3 sm:p-3.5 rounded-xl bg-amber-900/8 border border-amber-900/25 flex items-center gap-3">
                      <span class="font-unbounded font-black text-amber-400 text-sm shrink-0">LIVE</span>
                      <div class="text-[11px] sm:text-xs font-mono-tech text-[#140c07] leading-snug">
                        <div class="font-black text-[#0a0502] uppercase tracking-wider">Загадка выживания</div>
                        <div class="font-medium">Даже спустя годы трудно поверить, как мы прошли этот шторм</div>
                      </div>
                    </div>

                    <blockquote class="p-3 sm:p-3.5 rounded-xl bg-amber-900/8 border-l-4 border-red-700 text-xs sm:text-[13.5px] italic text-[#0f0703] leading-relaxed font-serif font-medium shadow-sm">
                      «Если Дудь однажды позовёт на интервью и спросит, как мы тогда выжили — честно, до сих пор не знаю!»
                      <footer class="text-[11px] sm:text-xs font-mono-tech text-[#241309] not-italic block mt-1.5 font-black">
                        — Димка
                      </footer>
                    </blockquote>

                    <p class="text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      Но главное, что вытянула нас тогда — невероятная поддержка соседей и постоянных гостей, которые не дали погаснуть свету за стойкой.
                    </p>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Глава IV</span>
                  <span class="tracking-wider">Стр. 08</span>
                </div>
              </div>
            </div>

            <!-- PAGE 9: CHAPTER V PART 1 — КОВЁР ЗА 500 ₽ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-r border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 right-0 w-7 bg-gradient-to-l from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="font-black text-red-900 tracking-wider">ГЛАВА V</span>
                    <span class="font-bold text-[#140c07] tracking-wider">2021–2026+</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <span class="px-2.5 py-0.5 rounded bg-emerald-900/12 text-emerald-950 border border-emerald-900/30 text-[10px] font-mono-tech font-black uppercase tracking-wider inline-block">
                      ПОСЛЕ ПАНДЕМИИ
                    </span>
                    <h4 class="text-sm sm:text-xl font-black uppercase text-[#0a0502] font-unbounded tracking-tight leading-snug">
                      КОВЁР ЗА 500 ₽ И СЕРДЦЕ РАЙОНА
                    </h4>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        Когда пандемия закончилась и пабы снова заработали в полную силу, мы решили встретить гостей по-королевски.
                      </p>
                      <p>
                        Купили на «Авито» настоящую <strong class="text-[#0a0502] font-black">красную ковровую дорожку за 500 рублей</strong> и раскатали её прямо на входных ступеньках — пусть каждый чувствует себя главным гостем!
                      </p>
                      <p>
                        Так незаметно пролетело уже <strong class="text-[#0a0502] font-black">почти 7 лет нашей истории</strong> — и она точно ещё не закончена.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Shrimp Pub Chronicle</span>
                  <span class="tracking-wider">Стр. 09</span>
                </div>
              </div>
            </div>

            <!-- PAGE 10: CHAPTER V PART 2 — СЕРДЦЕ РАЙОНА + СПАСИБО + БРОНЬ (SOFT) -->
            <div class="pub-book-page paper-page cursor-pointer" data-density="soft">
              <div class="w-full h-full bg-transparent text-[#120a05] p-5 sm:p-8 flex flex-col justify-between border-l border-amber-950/20 relative overflow-hidden">
                <div class="absolute top-0 bottom-0 left-0 w-7 bg-gradient-to-r from-amber-950/15 to-transparent pointer-events-none"></div>

                <div class="relative z-10">
                  <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309] pb-2.5 border-b border-amber-950/25">
                    <span class="tracking-wider text-[#140c07]">НАШИМ ГОСТЯМ</span>
                    <span class="tracking-wider text-red-900 font-black">С ЛЮБОВЬЮ</span>
                  </div>

                  <div class="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    <div class="p-3 sm:p-3.5 rounded-xl bg-red-800/12 border border-red-800/30 text-center">
                      <span class="text-xs sm:text-[13px] font-mono-tech uppercase tracking-wider font-black text-red-900">
                        «Сердце района»
                      </span>
                    </div>

                    <div class="space-y-2 text-xs sm:text-[13.5px] text-[#140c07] leading-relaxed font-sans font-medium">
                      <p>
                        Сегодня многие гости так и называют нас — <strong class="text-[#0a0502] font-black">«Сердце района»</strong>. Для нас с Ленкой это самое ценное признание.
                      </p>
                      <p>
                        Искреннее спасибо каждому, кто был с нами с того самого вечера, кто заходит на бокал и креветки сегодня и кто прямо сейчас читает эти строки!
                      </p>
                    </div>

                    <div class="pt-1 sm:pt-2 text-center">
                      <a 
                        href="#booking-deck" 
                        class="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono-tech font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                      >
                        <span>Забронировать столик</span>
                        <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7"></line>
                          <polyline points="7 7 17 7 17 17"></polyline>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="relative z-10 pt-2.5 border-t border-amber-950/25 flex items-center justify-between text-[11px] sm:text-xs font-mono-tech font-bold text-[#241309]">
                  <span class="tracking-wider">Димка и Ленка</span>
                  <span class="tracking-wider">Стр. 10</span>
                </div>
              </div>
            </div>

            <!-- PAGE 11: BACK HARDCOVER (HARD) — Matching dark burgundy leather texture -->
            <div class="pub-book-page cover-page cover-page-back cursor-pointer" data-density="hard">
              <div 
                class="w-full h-full relative overflow-hidden text-amber-200/80 flex flex-col justify-between p-6 sm:p-8 rounded-l-md"
                style="background: radial-gradient(circle at 45% 40%, #461d17 0%, #2b120e 65%, #190907 100%); box-shadow: inset 6px 0 18px rgba(0,0,0,0.45);"
              >
                <!-- Subtle embossed leather grain frame matching front cover -->
                <div class="absolute inset-3.5 border border-amber-400/25 rounded-sm pointer-events-none"></div>
                <div class="absolute inset-5 border border-amber-400/15 rounded-sm pointer-events-none"></div>
                <!-- Spine shadow on right edge (when closed at back, spine sits on the right) -->
                <div class="absolute top-0 bottom-0 right-0 w-5 bg-gradient-to-l from-black/55 via-black/20 to-transparent pointer-events-none"></div>

                <div class="relative z-10 text-center pt-3">
                  <span class="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-amber-300/60">
                    SHRIMP PUB • SAINT-P
                  </span>
                </div>

                <div class="relative z-10 text-center my-auto space-y-2">
                  <div class="text-amber-400 text-xs font-mono-tech tracking-widest opacity-75">EST. 2020</div>
                  <div class="text-xs sm:text-sm font-unbounded uppercase tracking-widest text-amber-200/75">
                    ИСТОРИЯ ПРОДОЛЖАЕТСЯ
                  </div>
                  <div class="w-12 h-px bg-amber-400/30 mx-auto"></div>
                  <p class="text-[10px] sm:text-[11px] font-mono-tech text-amber-100/50 max-w-[240px] mx-auto leading-relaxed">
                    просп. Энгельса, 58А<br />С 20.02.2020
                  </p>
                </div>

                <div class="relative z-10 text-center pb-2">
                  <span class="text-[10px] font-mono-tech text-amber-300/50 tracking-wider">
                    ← Нажмите, чтобы вернуться
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  initPageFlip() {
    const bookEl = this.container.querySelector('#st-flip-book');
    if (!bookEl) return;

    try {
      this.pageFlip = new PageFlip(bookEl, {
        width: 440,
        height: 613,
        size: 'stretch',
        minWidth: 260,
        maxWidth: 460,
        minHeight: 362,
        maxHeight: 641,
        autoSize: true,
        maxShadowOpacity: 0.45,
        showCover: true,
        mobileScrollSupport: false,
        clickEventForward: true,
        useMouseEvents: false,
        showPageCorners: false,
        drawShadow: true,
        flippingTime: 700,
        usePortrait: true,
        startPage: 0
      });

      const pages = bookEl.querySelectorAll('.pub-book-page');
      this.pageFlip.loadFromHTML(pages);
      this.totalPages = pages.length;
      this.currentPage = 0;

      // Apply initial centering immediately and also after StPageFlip finishes init
      this.applyBookTransform(0);
      this.updatePageCounter();

      this.pageFlip.on('init', () => {
        this.currentPage = this.pageFlip.getCurrentPageIndex();
        this.applyBookTransform(this.currentPage);
        this.updatePageCounter();
      });

      this.pageFlip.on('flip', (e) => {
        this.currentPage = e.data;
        this.applyBookTransform(this.currentPage);
        this.updatePageCounter();
      });

      this.pageFlip.on('changeOrientation', () => {
        this.applyBookTransform(this.currentPage);
        this.updatePageCounter();
      });

      this.handleResize = () => {
        this.applyBookTransform(this.currentPage);
        this.updatePageCounter();
      };
      window.addEventListener('resize', this.handleResize, { passive: true });

      // Tap-to-Turn interaction on the book container itself (cleanly ignoring links/buttons)
      bookEl.addEventListener('click', (e) => {
        if (!this.pageFlip) return;
        if (e.target.closest('a, button')) return;
        if (this.pageFlip.getState() === 'flipping') return;

        // On Page 0 (closed cover), clicking anywhere opens the book immediately
        if (this.currentPage === 0) {
          this.turnNext();
          return;
        }

        // On Page 11 (closed back cover), clicking goes back to the last spread
        if (this.currentPage >= this.totalPages - 1) {
          this.turnPrev();
          return;
        }

        const rect = bookEl.getBoundingClientRect();
        const isLandscape = this.pageFlip.getOrientation() === 'landscape';

        if (isLandscape) {
          if (e.clientX >= rect.left + rect.width / 2) {
            this.turnNext();
          } else {
            this.turnPrev();
          }
        } else {
          // Portrait mobile: left 30% turns prev, right 70% turns next
          if (e.clientX < rect.left + rect.width * 0.3) {
            this.turnPrev();
          } else {
            this.turnNext();
          }
        }
      });

      // Top bar Prev / Next controls
      const btnPrev = this.container.querySelector('#book-btn-prev');
      const btnNext = this.container.querySelector('#book-btn-next');

      if (btnNext) {
        btnNext.addEventListener('click', () => {
          this.turnNext();
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          this.turnPrev();
        });
      }
    } catch (err) {
      console.error('Error initializing StPageFlip:', err);
    }
  }

  turnNext() {
    if (!this.pageFlip) return;
    if (this.pageFlip.getState() === 'flipping') return;
    if (this.currentPage >= this.totalPages - 1) return;

    sound.playClick();

    // Predict next target page so centering glides smoothly alongside the page flip
    const isLandscape = this.pageFlip.getOrientation() === 'landscape';
    if (isLandscape) {
      if (this.currentPage === 0) {
        this.applyBookTransform(1);
      } else if (this.currentPage >= this.totalPages - 3) {
        this.applyBookTransform(this.totalPages - 1);
      } else {
        this.applyBookTransform(this.currentPage + 2);
      }
    } else {
      this.applyBookTransform(this.currentPage + 1);
    }

    this.pageFlip.flipNext('top');
  }

  turnPrev() {
    if (!this.pageFlip) return;
    if (this.pageFlip.getState() === 'flipping') return;
    if (this.currentPage <= 0) return;

    sound.playClick();

    const isLandscape = this.pageFlip.getOrientation() === 'landscape';
    if (isLandscape) {
      if (this.currentPage <= 2) {
        this.applyBookTransform(0);
      } else if (this.currentPage >= this.totalPages - 1) {
        this.applyBookTransform(this.totalPages - 3);
      } else {
        this.applyBookTransform(this.currentPage - 2);
      }
    } else {
      this.applyBookTransform(this.currentPage - 1);
    }

    this.pageFlip.flipPrev('top');
  }

  applyBookTransform(pageIndex = this.currentPage) {
    const bookEl = this.container?.querySelector('#st-flip-book');
    if (!bookEl) return;

    const isLandscape = this.pageFlip ? this.pageFlip.getOrientation() === 'landscape' : false;
    if (!isLandscape) {
      bookEl.style.transform = 'translateX(0%)';
      return;
    }

    if (pageIndex <= 0) {
      bookEl.style.transform = 'translateX(-25%)';
    } else if (pageIndex >= this.totalPages - 1) {
      bookEl.style.transform = 'translateX(25%)';
    } else {
      bookEl.style.transform = 'translateX(0%)';
    }
  }

  updatePageCounter() {
    const counter = this.container?.querySelector('#book-page-counter');
    const btnPrev = this.container?.querySelector('#book-btn-prev');
    const btnNext = this.container?.querySelector('#book-btn-next');

    if (btnPrev) btnPrev.disabled = this.currentPage <= 0;
    if (btnNext) btnNext.disabled = this.currentPage >= this.totalPages - 1;

    if (!counter) return;

    if (this.currentPage === 0) {
      counter.textContent = 'Обложка';
    } else if (this.currentPage >= this.totalPages - 1) {
      counter.textContent = 'Конец книги';
    } else {
      const isLandscape = this.pageFlip ? this.pageFlip.getOrientation() === 'landscape' : false;
      if (isLandscape) {
        const spreadNum = Math.ceil(this.currentPage / 2);
        const totalSpreads = Math.floor((this.totalPages - 2) / 2);
        counter.textContent = `Разворот ${spreadNum} / ${totalSpreads}`;
      } else {
        counter.textContent = `Стр. ${this.currentPage} / ${this.totalPages - 2}`;
      }
    }
  }
}
