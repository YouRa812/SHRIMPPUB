// src/data/playlistData.js
// 15 Pub Vinyl Tracks for Shrimp Pub Vinyl Lounge
// Strict zero-emoji policy: pure SVG logos and clean typography.
// Track 1 is the active real song; Tracks 2-15 are placeholders waiting for user input.

export const playlistTracks = [
  {
    id: 1,
    title: "YOU'LL NEVER WALK ALONE",
    artist: "Gerry & The Pacemakers",
    duration: "02:40",
    durationSeconds: 160,
    year: "1963",
    genre: "Pub Anthem",
    color: "#b91c1c", // Liverpool crimson
    labelBg: "radial-gradient(circle, #7f1d1d 0%, #450a0a 70%, #1f0406 100%)",
    accentColor: "#ef4444",
    coverImg: "./cover_youll_never_walk_alone.jpg",
    audioSrc: "./Gerry_The_Pacemakers_-_Youll_Never_Walk_Alone_47966052.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-001-A",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6zm0 28.4c-5-0.01-9.52-2.52-12.24-6.39 0.07-4.04 8.16-6.26 12.24-6.26s12.17 2.22 12.24 6.26c-2.72 3.87-7.24 6.38-12.24 6.39z"/></svg>`
  },
  {
    id: 2,
    title: "Песня 2",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#0284c7", // London blue
    labelBg: "radial-gradient(circle, #0369a1 0%, #082f49 70%, #03141f 100%)",
    accentColor: "#38bdf8",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-002",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 6l4.24 8.6 9.49 1.38-6.87 6.69 1.62 9.45L24 27.67l-8.48 4.45 1.62-9.45-6.87-6.69 9.49-1.38z"/></svg>`
  },
  {
    id: 3,
    title: "Песня 3",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#d97706", // Amber vintage
    labelBg: "radial-gradient(circle, #b45309 0%, #451a03 70%, #1c0a01 100%)",
    accentColor: "#f59e0b",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-003",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M22 6L9 26h11l-3 16 19-22H24l4-14z"/></svg>`
  },
  {
    id: 4,
    title: "Песня 4",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#059669", // British racing green
    labelBg: "radial-gradient(circle, #047857 0%, #064e3b 70%, #022017 100%)",
    accentColor: "#10b981",
    audioSrc: "./bg-music.mp3",
    side: "SIDE B",
    matrix: "SHRIMP-004",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30v-20l14 10-14 10z"/></svg>`
  },
  {
    id: 5,
    title: "Песня 5",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#7c3aed", // Manchester purple
    labelBg: "radial-gradient(circle, #6d28d9 0%, #3b0764 70%, #19032b 100%)",
    accentColor: "#a855f7",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-005",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 4L8 10v12c0 11.11 6.84 21.5 16 24 9.16-2.5 16-12.89 16-24V10L24 4zm0 22c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`
  },
  {
    id: 6,
    title: "Песня 6",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#ea580c", // Neon flame
    labelBg: "radial-gradient(circle, #c2410c 0%, #541c04 70%, #200a01 100%)",
    accentColor: "#fb923c",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-006",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M25 4c-.7 0-1.3.4-1.6 1-3.6 7-1.4 12-4.4 17-1.5-2.2-2-4.5-2-6.5 0-.7-.4-1.3-1-1.5s-1.3.1-1.6.6C12.3 18 10 23.4 10 28c0 8.3 6.7 15 15 15s15-6.7 15-15c0-10.4-11.4-19-14-23.4-.2-.4-.6-.6-1-.6z"/></svg>`
  },
  {
    id: 7,
    title: "Песня 7",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#dc2626", // Red stripes
    labelBg: "radial-gradient(circle, #991b1b 0%, #450a0a 70%, #190303 100%)",
    accentColor: "#f87171",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-007",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 6l18 32H6L24 6zm0 12l-9 16h18l-9-16z"/></svg>`
  },
  {
    id: 8,
    title: "Песня 8",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#0891b2", // Cyber cyan
    labelBg: "radial-gradient(circle, #0e7490 0%, #164e63 70%, #041921 100%)",
    accentColor: "#22d3ee",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-008",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><rect x="8" y="8" width="14" height="14" rx="2"/><rect x="26" y="8" width="14" height="14" rx="2"/><rect x="8" y="26" width="14" height="14" rx="2"/><rect x="26" y="26" width="14" height="14" rx="2"/></svg>`
  },
  {
    id: 9,
    title: "Песня 9",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#64748b", // Silver monochrome
    labelBg: "radial-gradient(circle, #475569 0%, #1e293b 70%, #090d16 100%)",
    accentColor: "#cbd5e1",
    audioSrc: "./bg-music.mp3",
    side: "SIDE B",
    matrix: "SHRIMP-009",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M6 24h6l4-12 8 24 6-18 4 10 4-4h8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: 10,
    title: "Песня 10",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#ca8a04", // Mustard mod
    labelBg: "radial-gradient(circle, #a16207 0%, #422006 70%, #190b02 100%)",
    accentColor: "#facc15",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-010",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="24" r="3"/></svg>`
  },
  {
    id: 11,
    title: "Песня 11",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#db2777", // Neon pink
    labelBg: "radial-gradient(circle, #be185d 0%, #500724 70%, #1f020d 100%)",
    accentColor: "#f472b6",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-011",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 4L4 44h40L24 4zm0 10l12 24H12l12-24z"/></svg>`
  },
  {
    id: 12,
    title: "Песня 12",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#e11d48", // Royal crest red
    labelBg: "radial-gradient(circle, #9f1239 0%, #4c0519 70%, #1b0209 100%)",
    accentColor: "#fb7185",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-012",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M10 36h28v4H10zm0-10l6-18h16l6 18-10-4-4 8-4-8-10 4z"/></svg>`
  },
  {
    id: 13,
    title: "Песня 13",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#475569", // Midnight slate
    labelBg: "radial-gradient(circle, #334155 0%, #0f172a 70%, #020617 100%)",
    accentColor: "#94a3b8",
    audioSrc: "./bg-music.mp3",
    side: "SIDE B",
    matrix: "SHRIMP-013",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 28c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`
  },
  {
    id: 14,
    title: "Песня 14",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#16a34a", // Emerald pub
    labelBg: "radial-gradient(circle, #15803d 0%, #14532d 70%, #052e16 100%)",
    accentColor: "#4ade80",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-014",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M32 22c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm-16 0c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 4c-4.42 0-13 2.21-13 6.6V36h26v-3.4c0-4.39-8.58-6.6-13-6.6zm16 0c-.58 0-1.23.04-1.92.11 2.37 1.72 3.92 4.02 3.92 6.49V36h11v-3.4c0-4.39-8.58-6.6-13-6.6z"/></svg>`
  },
  {
    id: 15,
    title: "Песня 15",
    artist: "В ожидании трека",
    duration: "03:00",
    durationSeconds: 180,
    year: "Скоро",
    genre: "Плейлист Паба",
    color: "#b91c1c", // Shrimp Crimson Gold
    labelBg: "radial-gradient(circle, #991b1b 0%, #450a0a 70%, #1a0305 100%)",
    accentColor: "#facc15",
    audioSrc: "./bg-music.mp3",
    side: "SIDE A",
    matrix: "SHRIMP-015",
    logoSvg: `<svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M38 14h-4V8c0-2.21-1.79-4-4-4H18c-2.21 0-4 1.79-4 4v6h-4c-2.21 0-4 1.79-4 4v4c0 6.63 5.37 12 12 12h.73c2.72 4.7 7.78 8 13.27 8v4H18v4h20v-4H26v-4c5.49 0 10.55-3.3 13.27-8H40c6.63 0 12-5.37 12-12v-4c0-2.21-1.79-4-4-4zM10 22v-4h4v8.58c-2.43-1.07-4-3.5-4-4.58zm28 4.58V18h4v4c0 1.08-1.57 3.51-4 4.58z"/></svg>`
  }
];
