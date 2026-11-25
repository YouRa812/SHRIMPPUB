import { sound } from '../utils/audio.js';

const PHP_ENDPOINT = './get_matches.php';
const PHP_CACHE_KEY = 'morecambe_php_cache_v1';
const PHP_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const CLIENT_1H_CACHE_KEY = 'morecambe_1h_cache';
const CLIENT_1H_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const MORECAMBE_SPORTSDB_ID = '134369';
const MORECAMBE_BADGE_URL = 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png';

const SPORTSDB_LAST_URL = `https://www.thesportsdb.com/api/v1/json/123/eventslast.php?id=${MORECAMBE_SPORTSDB_ID}`;

/**
 * Verified real recent Morecambe F.C. matches (National League North, 2026-27 season).
 * Used as offline/blocked safety net and to backfill history when CORS-limited endpoints return 1 event.
 */
const VERIFIED_FALLBACK_MATCHES = [
  {
    id: '5907103',
    date: '2026-11-10T19:45:00.000Z',
    dateIso: '2026-11-10',
    homeTeam: 'Morecambe',
    awayTeam: 'Hereford',
    homeScore: 2,
    awayScore: 2,
    homeBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
    awayBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/799249.png',
    isMorecambeHome: true,
    result: 'D',
    resultRu: 'Ничья',
    competition: 'National League North',
    venue: 'Halo Aerospace Stadium',
    status: 'FT',
    isLive: false,
  },
  {
    id: '5907151',
    date: '2026-11-07T15:00:00.000Z',
    dateIso: '2026-11-07',
    homeTeam: 'Hednesford Town',
    awayTeam: 'Morecambe',
    homeScore: 6,
    awayScore: 2,
    homeBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/9923.png',
    awayBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
    isMorecambeHome: false,
    result: 'L',
    resultRu: 'Поражение',
    competition: 'National League North',
    venue: 'Выездной матч',
    status: 'FT',
    isLive: false,
  },
  {
    id: '5907139',
    date: '2026-10-31T15:00:00.000Z',
    dateIso: '2026-10-31',
    homeTeam: 'Morecambe',
    awayTeam: 'Scarborough Athletic',
    homeScore: 2,
    awayScore: 0,
    homeBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
    awayBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/580382.png',
    isMorecambeHome: true,
    result: 'W',
    resultRu: 'Победа',
    competition: 'National League North',
    venue: 'Halo Aerospace Stadium',
    status: 'FT',
    isLive: false,
  },
];

const VERIFIED_NEXT_MATCH = {
  id: '5907163',
  date: '2026-11-21T15:00:00.000Z',
  dateIso: '2026-11-21',
  homeTeam: 'Morecambe',
  awayTeam: "King's Lynn Town",
  homeBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
  awayBadge: 'https://images.fotmob.com/image_resources/logo/teamlogo/45731.png',
  isMorecambeHome: true,
  competition: 'National League North',
};

const RU_MONTHS_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeImageUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  return trimmed.startsWith('https://') ? trimmed : '';
}

function getTeamMonogram(name) {
  const clean = String(name || '')
    .replace(/\b(F\.?C\.?|A\.?F\.?C\.?|Town|Athletic|United|City)\b/gi, '')
    .trim();
  const words = (clean || String(name || 'FC')).split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0] + (words[1][1] || '')).toUpperCase().slice(0, 3);
  }
  return (words[0] || 'FC').slice(0, 3).toUpperCase();
}

function isMorecambeName(name) {
  return String(name || '').toLowerCase().includes('morecambe');
}

function computeMatchOutcome(homeScore, awayScore, isMorecambeHome, isLive = false) {
  if (isLive) {
    return { result: 'LIVE', resultRu: 'Идёт матч' };
  }
  const our = isMorecambeHome ? homeScore : awayScore;
  const opp = isMorecambeHome ? awayScore : homeScore;
  if (our > opp) return { result: 'W', resultRu: 'Победа' };
  if (our < opp) return { result: 'L', resultRu: 'Поражение' };
  return { result: 'D', resultRu: 'Ничья' };
}

function formatRussianMatchDate(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return String(dateInput || '').slice(0, 10);
  }
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    const day = date.getUTCDate();
    const month = RU_MONTHS_SHORT[date.getUTCMonth()] || '';
    const year = date.getUTCFullYear();
    return `${day} ${month}. ${year}`;
  }
}

function formatSyncTime(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

function readLocalCache(key, maxAgeMs = Infinity) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.savedAt !== 'number' || !parsed.payload) {
      return null;
    }
    if (!Array.isArray(parsed.payload.matches) || parsed.payload.matches.length === 0) {
      return null;
    }
    const age = Date.now() - parsed.savedAt;
    if (age > maxAgeMs) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function writeLocalCache(key, payload) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ savedAt: Date.now(), payload })
    );
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

async function fetchTextWithTimeout(url, timeoutMs = 3500) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined,
    });
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      xCache: res.headers.get('X-Cache') || '',
      text,
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchJsonWithTimeout(url, timeoutMs = 4500) {
  const res = await fetchTextWithTimeout(url, timeoutMs);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const trimmed = res.text.trim();
  if (!trimmed || trimmed.startsWith('<?') || trimmed.startsWith('<')) {
    throw new Error('Non-JSON response');
  }
  return JSON.parse(trimmed);
}

async function fetchSportsDbMatches() {
  const data = await fetchJsonWithTimeout(SPORTSDB_LAST_URL, 4500);
  const results = Array.isArray(data?.results) ? data.results : [];
  return results
    .filter((ev) => ev && ev.intHomeScore !== null && ev.intAwayScore !== null && ev.dateEvent)
    .map((ev) => {
      const dateIso = String(ev.dateEvent).slice(0, 10);
      const timeStr = ev.strTime ? String(ev.strTime) : '15:00:00';
      const tsRaw = ev.strTimestamp ? String(ev.strTimestamp) : `${dateIso}T${timeStr}`;
      const dateFull = tsRaw.endsWith('Z') ? tsRaw : `${tsRaw}Z`;
      const homeTeam = String(ev.strHomeTeam || 'Home');
      const awayTeam = String(ev.strAwayTeam || 'Away');
      const homeScore = Number.parseInt(ev.intHomeScore, 10) || 0;
      const awayScore = Number.parseInt(ev.intAwayScore, 10) || 0;
      const isMorecambeHome =
        String(ev.idHomeTeam || '') === MORECAMBE_SPORTSDB_ID || isMorecambeName(homeTeam);
      const { result, resultRu } = computeMatchOutcome(homeScore, awayScore, isMorecambeHome, false);

      return {
        id: String(ev.idEvent || dateIso),
        date: dateFull,
        dateIso,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeBadge: sanitizeImageUrl(ev.strHomeTeamBadge),
        awayBadge: sanitizeImageUrl(ev.strAwayTeamBadge),
        isMorecambeHome,
        result,
        resultRu,
        competition: String(ev.strLeague || 'National League North').replace(/^English\s+/i, ''),
        venue: ev.strVenue ? String(ev.strVenue) : (isMorecambeHome ? 'Halo Aerospace Stadium' : 'Выездной матч'),
        status: String(ev.strStatus || 'FT'),
        isLive: false,
      };
    });
}

function mergeAndSortMatches(liveMatches, fallbackMatches) {
  const byDate = new Map();
  // Insert live matches first so fresh API data overrides fallback on matching dates
  for (const m of [...liveMatches, ...fallbackMatches]) {
    if (!m || !m.dateIso) continue;
    if (!byDate.has(m.dateIso)) {
      byDate.set(m.dateIso, m);
    }
  }
  return Array.from(byDate.values())
    .sort((a, b) => String(b.date || b.dateIso).localeCompare(String(a.date || a.dateIso)))
    .slice(0, 3);
}

export class MorecambeTracker {
  constructor(containerId, options = {}) {
    this.container =
      typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.options = options;
    this.state = {
      loading: true,
      matches: [],
      nextMatch: null,
      sourceLabel: 'Синхронизация…',
      updatedAt: null,
      isLive: false,
      isFallback: false,
    };
  }

  mount() {
    if (!this.container) return;

    // Show immediate synchronous cache if warm to avoid visual flicker
    const cachedPhp = readLocalCache(PHP_CACHE_KEY, PHP_CACHE_TTL_MS);
    if (cachedPhp) {
      this.applyPayload(cachedPhp, 'SpaceWeb • Кэш 15м', false);
      return;
    }

    this.render();
    this.attachEvents();
    this.loadMatches();
  }

  async loadMatches() {
    // 1. Try SpaceWeb PHP endpoint (with strict JSON check so Vite/GH Pages PHP source is skipped)
    try {
      const res = await fetchTextWithTimeout(PHP_ENDPOINT, 3500);
      const trimmed = (res.text || '').trim();
      if (res.ok && trimmed && !trimmed.startsWith('<?') && !trimmed.startsWith('<')) {
        const payload = JSON.parse(trimmed);
        if (payload && Array.isArray(payload.matches) && payload.matches.length > 0) {
          writeLocalCache(PHP_CACHE_KEY, payload);
          let label = 'SpaceWeb PHP • Live';
          if (payload.stale) {
            label = 'SpaceWeb PHP • Резерв';
          } else if (res.xCache.toUpperCase() === 'HIT' || payload.cached) {
            label = 'SpaceWeb PHP • Кэш 1ч';
          }
          this.applyPayload(payload, label, Boolean(payload.stale));
          return;
        }
      }
    } catch {
      // Expected on Vite dev server / static hosting or timeout; proceed to direct CORS fallback
    }

    // 2. Client-side 1-hour localStorage cache (Vite dev / GitHub Pages mode)
    const cached1h = readLocalCache(CLIENT_1H_CACHE_KEY, CLIENT_1H_CACHE_TTL_MS);
    if (cached1h) {
      this.applyPayload(cached1h, 'Live API • Кэш 1ч', false);
      return;
    }

    // 3. Direct CORS-enabled free public API (TheSportsDB) merged with verified history
    try {
      const liveMatches = await fetchSportsDbMatches();

      if (Array.isArray(liveMatches) && liveMatches.length > 0) {
        const mergedMatches = mergeAndSortMatches(liveMatches, VERIFIED_FALLBACK_MATCHES);
        const payload = {
          ok: true,
          matches: mergedMatches,
          nextMatch: VERIFIED_NEXT_MATCH,
          source: 'thesportsdb-cors',
          updatedAt: new Date().toISOString(),
        };
        writeLocalCache(CLIENT_1H_CACHE_KEY, payload);
        this.applyPayload(payload, 'Live API • Кэш 1ч', false);
        return;
      }
    } catch {
      // Fall through to stale/offline fallback
    }

    // 4. Stale cache (ignoring TTL) or baked-in verified real matches
    const stalePayload =
      readLocalCache(PHP_CACHE_KEY, Infinity) || readLocalCache(CLIENT_1H_CACHE_KEY, Infinity);
    if (stalePayload) {
      this.applyPayload(stalePayload, 'Архив кэша', true);
      return;
    }

    this.applyPayload(
      {
        ok: true,
        matches: VERIFIED_FALLBACK_MATCHES,
        nextMatch: VERIFIED_NEXT_MATCH,
        source: 'verified-archive',
        updatedAt: '2026-11-11T16:00:00Z',
      },
      'Архив клуба',
      true
    );
  }

  applyPayload(payload, sourceLabel, isFallback) {
    const matches = Array.isArray(payload?.matches) ? payload.matches.slice(0, 3) : VERIFIED_FALLBACK_MATCHES;
    const hasLive = matches.some((m) => Boolean(m.isLive));
    this.state = {
      loading: false,
      matches,
      nextMatch: payload?.nextMatch || null,
      sourceLabel: hasLive ? 'LIVE-ТРАНСЛЯЦИЯ' : sourceLabel,
      updatedAt: payload?.updatedAt || new Date().toISOString(),
      isLive: hasLive,
      isFallback,
    };
    this.render();
    this.attachEvents();
  }

  getOutcomeTheme(match) {
    if (match.isLive) {
      return {
        border: 'border-red-500/70 hover:border-red-400',
        glow: 'from-red-600/20 via-transparent to-transparent',
        badgeClass: 'bg-red-600 text-white border-red-400 animate-pulse',
        badgeText: '● LIVE',
      };
    }
    if (match.result === 'W') {
      return {
        border: 'border-emerald-500/40 hover:border-emerald-400/75',
        glow: 'from-emerald-500/12 via-transparent to-transparent',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        badgeText: 'Победа',
      };
    }
    if (match.result === 'D') {
      return {
        border: 'border-amber-500/40 hover:border-amber-400/75',
        glow: 'from-amber-500/12 via-transparent to-transparent',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeText: 'Ничья',
      };
    }
    return {
      border: 'border-red-500/30 hover:border-red-500/60',
      glow: 'from-red-500/10 via-transparent to-transparent',
      badgeClass: 'bg-neutral-800/90 text-red-400 border-red-500/35',
      badgeText: 'Поражение',
    };
  }

  renderTeamBlock(teamName, badgeUrl, roleLabel, isMorecambe) {
    const safeName = escapeHtml(teamName);
    const safeUrl = sanitizeImageUrl(badgeUrl);
    const monogram = escapeHtml(getTeamMonogram(teamName));

    const crestHtml = safeUrl
      ? `
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 border ${isMorecambe ? 'border-red-500/45 shadow-[0_0_16px_rgba(255,30,39,0.22)]' : 'border-white/10'} flex items-center justify-center p-1.5 overflow-hidden shrink-0">
          <img
            src="${escapeHtml(safeUrl)}"
            alt="${safeName}"
            loading="lazy"
            decoding="async"
            data-crest-fallback="${monogram}"
            data-is-morecambe="${isMorecambe ? '1' : '0'}"
            class="w-full h-full object-contain"
          />
        </div>
      `
      : `
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${isMorecambe ? 'bg-red-600/25 border-red-500/50 text-white' : 'bg-white/5 border-white/10 text-neutral-300'} border flex items-center justify-center font-unbounded font-black text-xs shrink-0">
          ${isMorecambe ? 'MFC' : monogram}
        </div>
      `;

    return `
      <div class="flex flex-col items-center text-center gap-1.5 min-w-0">
        ${crestHtml}
        <span class="text-[11px] sm:text-xs font-bold font-unbounded leading-tight line-clamp-2 ${isMorecambe ? 'text-white' : 'text-neutral-300'}">
          ${safeName}
        </span>
        <span class="text-[9px] font-mono-tech uppercase tracking-widest ${isMorecambe ? 'text-red-400/90 font-bold' : 'text-neutral-500'}">
          ${escapeHtml(roleLabel)}
        </span>
      </div>
    `;
  }

  renderMatchCard(match) {
    const theme = this.getOutcomeTheme(match);
    const homeIsMorecambe = Boolean(match.isMorecambeHome);
    const awayIsMorecambe = !homeIsMorecambe && isMorecambeName(match.awayTeam);
    const formattedDate = escapeHtml(formatRussianMatchDate(match.date || match.dateIso));
    const competition = escapeHtml(match.competition || 'National League North');
    const venueLabel = match.isMorecambeHome ? 'Дома • Halo Aerospace' : 'В гостях';

    return `
      <article class="relative overflow-hidden rounded-2xl bg-black/70 backdrop-blur-md border ${theme.border} p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl">
        <div class="absolute inset-0 bg-gradient-to-b ${theme.glow} pointer-events-none"></div>

        <!-- Top Meta: Tournament & Outcome -->
        <div data-reveal="badge" class="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-tech uppercase tracking-wider text-neutral-300 truncate max-w-[62%]" title="${competition}">
            
            <span class="truncate">${competition}</span>
          </span>

          <span class="inline-flex items-center px-2.5 py-1 rounded-full border ${theme.badgeClass} text-[10px] font-mono-tech font-bold uppercase tracking-wider shrink-0">
            ${escapeHtml(theme.badgeText)}
          </span>
        </div>

        <!-- Center Scoreboard -->
        <div data-reveal="counter" class="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 my-4">
          ${this.renderTeamBlock(match.homeTeam, match.homeBadge, 'Дома', homeIsMorecambe)}

          <div class="flex flex-col items-center justify-center shrink-0">
            <div class="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 shadow-inner font-unbounded font-black text-xl sm:text-2xl lg:text-[26px] text-white tracking-tight tabular-nums whitespace-nowrap">
              ${Number(match.homeScore)} <span class="text-red-500 mx-0.5">:</span> ${Number(match.awayScore)}
            </div>
            <span class="mt-1.5 text-[9px] font-mono-tech uppercase tracking-widest ${match.isLive ? 'text-red-400 font-bold' : 'text-neutral-500'}">
              ${escapeHtml(match.status || 'FT')}
            </span>
          </div>

          ${this.renderTeamBlock(match.awayTeam, match.awayBadge, 'В гостях', awayIsMorecambe)}
        </div>

        <!-- Bottom Meta: Date & Home/Away Venue -->
        <div data-reveal="detail" class="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono-tech text-neutral-400">
          <span>${formattedDate}</span>
          <span class="truncate text-neutral-300">${escapeHtml(venueLabel)}</span>
        </div>
      </article>
    `;
  }

  renderSkeletonCards() {
    return Array.from({ length: 3 })
      .map(
        () => `
        <div class="rounded-2xl bg-black/60 border border-white/10 p-5 animate-pulse flex flex-col justify-between min-h-[210px]">
          <div class="flex justify-between items-center pb-3 border-b border-white/10">
            <div class="h-5 w-32 rounded-full bg-white/10"></div>
            <div class="h-5 w-16 rounded-full bg-white/10"></div>
          </div>
          <div class="grid grid-cols-3 items-center gap-3 my-5">
            <div class="flex flex-col items-center gap-2">
              <div class="w-11 h-11 rounded-xl bg-white/10"></div>
              <div class="h-3 w-16 rounded bg-white/10"></div>
            </div>
            <div class="h-10 w-20 mx-auto rounded-xl bg-white/10"></div>
            <div class="flex flex-col items-center gap-2">
              <div class="w-11 h-11 rounded-xl bg-white/10"></div>
              <div class="h-3 w-16 rounded bg-white/10"></div>
            </div>
          </div>
          <div class="flex justify-between pt-3 border-t border-white/10">
            <div class="h-3 w-20 rounded bg-white/10"></div>
            <div class="h-3 w-24 rounded bg-white/10"></div>
          </div>
        </div>
      `
      )
      .join('');
  }

  render() {
    if (!this.container) return;

    const alreadyDarkDeck =
      this.container.classList.contains('canvas-dark') ||
      Boolean(this.container.closest('.canvas-dark'));

    const outerClasses = alreadyDarkDeck
      ? 'w-full relative text-neutral-100'
      : 'w-full relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#2a0207] via-[#120003] to-[#060103] border border-red-500/35 p-4 sm:p-8 lg:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.75)] text-neutral-100';

    const syncTime = formatSyncTime(this.state.updatedAt);
    const dotClass = this.state.isLive
      ? 'bg-red-500 animate-ping'
      : this.state.isFallback
        ? 'bg-amber-400'
        : 'bg-emerald-400 animate-pulse';

    const matchesHtml = this.state.loading
      ? this.renderSkeletonCards()
      : this.state.matches.map((m) => this.renderMatchCard(m)).join('');

    const nextMatchHtml = this.state.nextMatch
      ? `
        <div data-reveal="detail" class="mt-4 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tech text-neutral-300">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-red-600/25 border border-red-500/40 text-red-300 font-bold uppercase text-[9px] tracking-wider">СЛЕДУЮЩИЙ МАТЧ</span>
            <span class="text-white font-bold">${escapeHtml(this.state.nextMatch.homeTeam)} — ${escapeHtml(this.state.nextMatch.awayTeam)}</span>
          </div>
          <div class="text-neutral-400">
            ${escapeHtml(formatRussianMatchDate(this.state.nextMatch.date || this.state.nextMatch.dateIso))} • ${escapeHtml(this.state.nextMatch.competition || 'National League North')}
          </div>
        </div>
      `
      : '';

    this.container.innerHTML = `
      <div class="${outerClasses}">
        <!-- Header Row -->
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-5 border-b border-white/10">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2.5">
              <span class="badge-asterisk !w-5 !h-5 !text-[10px]">*</span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-widest">
                <img
                  src="${MORECAMBE_BADGE_URL}"
                  alt="Morecambe F.C."
                  loading="lazy"
                  decoding="async"
                  data-crest-fallback="MOR"
                  data-is-morecambe="1"
                  class="w-3.5 h-3.5 object-contain"
                />
                <span>THE SHRIMPS • АНГЛИЯ</span>
              </span>
              <span class="text-[10px] font-mono-tech uppercase tracking-wider text-neutral-400">
                EST. 1920 • NATIONAL LEAGUE NORTH
              </span>
            </div>

            <h2 class="text-base sm:text-2xl lg:text-4xl font-black text-white uppercase tracking-tight font-unbounded leading-tight">
              БОЛЕЕМ ЗА НАШИХ // <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">MORECAMBE F.C.</span>
            </h2>

            <p class="text-[11px] sm:text-xs text-neutral-300 font-mono-tech mt-2 max-w-2xl leading-relaxed">
              Единственный английский футбольный клуб с прозвищем «Креветки» (The Shrimps) — наш духовный побратим на Туманном Альбионе. 3 последних результата команды:
            </p>
          </div>
        </div>

        <!-- 3 Latest Matches Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          ${matchesHtml}
        </div>

        ${nextMatchHtml}

        <!-- Pub Promo Strip -->
        <div class="mt-5 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-neutral-900/90 to-black/85 border border-red-500/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div class="flex items-start sm:items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-red-600/25 border border-red-500/45 flex items-center justify-center font-unbounded font-black text-xs text-red-300 shrink-0">
              MFC
            </div>
            <p class="text-xs sm:text-sm text-neutral-100 font-mono-tech leading-relaxed">
              Каждый матч "Креветок" (Morecambe F.C.) смотрим вместе! В дни побед — праздничное настроение и холодный крафт у кранов
            </p>
          </div>

          <a
            href="#booking-deck"
            id="morecambe-book-cta"
            class="btn-magnetic inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black font-unbounded text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,30,39,0.4)] transition-all active:scale-95 shrink-0 w-full md:w-auto text-center"
          >
            <span>Забронировать стол на матч</span>
            <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
        </div>
      </div>
    `;
  }

  attachEvents() {
    if (!this.container) return;

    // Replace broken crest images with clean monogram badges
    this.container.querySelectorAll('img[data-crest-fallback]').forEach((img) => {
      img.addEventListener(
        'error',
        () => {
          const mono = img.dataset.crestFallback || 'FC';
          const isMorecambe = img.dataset.isMorecambe === '1';
          const fallback = document.createElement('span');
          fallback.className = `font-unbounded font-black text-[10px] ${isMorecambe ? 'text-red-300' : 'text-neutral-300'}`;
          fallback.textContent = isMorecambe ? 'MFC' : mono;
          img.replaceWith(fallback);
        },
        { once: true }
      );
    });

    // Smooth scroll CTA to #booking-deck with auto-fill of the nearest match date
    const ctaBtn = this.container.querySelector('#morecambe-book-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        const bookingDeck = document.getElementById('booking-deck');
        if (!bookingDeck) return;
        e.preventDefault();
        try {
          sound.playClick();
        } catch {
          // Audio optional
        }

        // Determine the next match date (YYYY-MM-DD format for date input)
        const nextMatch = this.state.nextMatch || VERIFIED_NEXT_MATCH;
        let matchDateIso = '';
        if (nextMatch) {
          if (nextMatch.dateIso) {
            matchDateIso = nextMatch.dateIso;
          } else if (nextMatch.date) {
            matchDateIso = String(nextMatch.date).split('T')[0];
          }
        }
        if (!matchDateIso) matchDateIso = '2026-11-21';

        // Auto-fill the date input field in the booking form
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
          dateInput.value = matchDateIso;
          dateInput.dispatchEvent(new Event('input', { bubbles: true }));
          dateInput.dispatchEvent(new Event('change', { bubbles: true }));

          // Visual highlight on the date field
          dateInput.classList.remove('border-red-500/20');
          dateInput.classList.add('border-red-500', 'ring-2', 'ring-red-500/50', 'bg-red-950/40');
          setTimeout(() => {
            dateInput.classList.remove('ring-2', 'ring-red-500/50', 'bg-red-950/40');
            dateInput.classList.add('border-red-500/20');
          }, 3500);
        }

        // Auto-select match evening time (18:00)
        const timeSelect = document.getElementById('booking-time');
        if (timeSelect) {
          for (const opt of timeSelect.options) {
            if (opt.value === '18:00' || opt.text.startsWith('18:00')) {
              opt.selected = true;
              break;
            }
          }
        }

        // Add prominent match badge notice directly inside the booking form
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
          let noticeEl = document.getElementById('booking-match-notice');
          if (!noticeEl) {
            noticeEl = document.createElement('div');
            noticeEl.id = 'booking-match-notice';
            noticeEl.className = 'mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-[11px] font-mono-tech text-red-200 flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(255,30,39,0.3)] transition-all';
            bookingForm.prepend(noticeEl);
          }
          const matchTitle = nextMatch ? `${nextMatch.homeTeam} — ${nextMatch.awayTeam}` : 'Morecambe F.C.';
          const matchDateText = nextMatch ? formatRussianMatchDate(nextMatch.date || nextMatch.dateIso) : '21 ноя';
          noticeEl.innerHTML = `
            <div class="flex items-center gap-2.5">
              
              <div>
                <div class="font-bold text-white uppercase text-xs">Матч Morecambe FC // Дата подставлена</div>
                <div class="text-neutral-300">${escapeHtml(matchTitle)} • ${escapeHtml(matchDateText)}</div>
              </div>
            </div>
            <button 
              type="button" 
              class="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              onclick="this.parentElement.remove()"
              title="Закрыть уведомление"
            >✕</button>
          `;
        }

        // Make sure card is visible and scroll to booking form

        const lenis = window.__shrimpLenis;
        if (lenis) {
          lenis.scrollTo(bookingDeck, { offset: -70, duration: 0.9 });
        } else {
          bookingDeck.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }
}
