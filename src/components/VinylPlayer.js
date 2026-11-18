// src/components/VinylPlayer.js
// Interactive Vinyl Turntable Player with 15 Records, Center Logos & Mobile Optimization
// Strict zero-emoji compliance: pure SVG icons and clean typography.

import { playlistTracks } from '../data/playlistData.js';
import { sound } from '../utils/audio.js';

export class VinylPlayer {
  constructor(mountId) {
    this.mountId = mountId;
    this.container = null;
    this.tracks = playlistTracks;
    this.currentIndex = 0;
    this.isPlaying = true; // Auto-play / spinning by default as master music source
    this.crackleEnabled = true;
    this.currentTime = 0;
    this.duration = this.tracks[0].durationSeconds;
    this.volume = 0.8;
    this.isMuted = false;
    this.progressInterval = null;
    this.vuAnimationId = null;
    
    // Audio elements
    this.audioElement = null;
    this.audioContext = null;
    this.crackleNode = null;
    this.crackleGain = null;
    this.grooveOsc = null;
  }

  mount() {
    this.container = document.getElementById(this.mountId);
    if (!this.container) {
      console.warn(`VinylPlayer: mount container #${this.mountId} not found.`);
      return;
    }

    this.render();
    this.initAudio();
    this.attachEvents();
    this.startVuMeters();
    sound.setMusicPlayer(this);
    if (this.isPlaying) {
      this.startProgressTimer();
    }
  }

  getCurrentTrack() {
    return this.tracks[this.currentIndex] || this.tracks[0];
  }

  initAudio() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';
    this.audioElement.volume = this.volume;
    this.loadCurrentAudio();

    this.audioElement.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
        this.currentTime = this.audioElement.currentTime;
        this.duration = this.audioElement.duration;
        this.updateProgressUI();
      }
    });

    this.audioElement.addEventListener('error', () => {
      // Graceful fallback to timer-based simulation if audio file fails
      console.log('Audio file fallback to simulation mode');
    });
  }

  initWebAudioCrackle() {
    if (this.audioContext) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();

      // Procedural vinyl crackle generator (buffer of subtle crackle impulses)
      const bufferSize = this.audioContext.sampleRate * 2;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Sparse clicks and dust pops
        if (Math.random() < 0.0006) {
          output[i] = (Math.random() * 2 - 1) * 0.35;
        } else if (Math.random() < 0.003) {
          output[i] = (Math.random() * 2 - 1) * 0.08;
        } else {
          output[i] = (Math.random() * 2 - 1) * 0.005; // background hiss
        }
      }

      const whiteNoise = this.audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter to make it sound authentically analog
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.2;

      this.crackleGain = this.audioContext.createGain();
      this.crackleGain.gain.value = this.crackleEnabled ? 0.12 : 0;

      whiteNoise.connect(filter);
      filter.connect(this.crackleGain);
      this.crackleGain.connect(this.audioContext.destination);
      whiteNoise.start(0);
      this.crackleNode = whiteNoise;
    } catch (e) {
      console.warn('Web Audio crackle initialization skipped:', e);
    }
  }

  playNeedleDropSound() {
    try {
      if (!this.audioContext) this.initWebAudioCrackle();
      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Needle drop thump & click
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      // Silent catch
    }
  }

  loadCurrentAudio() {
    const track = this.getCurrentTrack();
    this.duration = track.durationSeconds;
    this.currentTime = 0;
    if (this.audioElement) {
      this.audioElement.src = track.audioSrc || './bg-music.mp3';
      this.audioElement.currentTime = 0;
    }
  }

  render() {
    const track = this.getCurrentTrack();

    this.container.innerHTML = `
      <div class="relative w-full select-none">
        
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 border-b border-white/10 pb-4 sm:pb-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-red-300 text-[11px] font-mono-tech tracking-widest uppercase mb-2 sm:mb-3 shadow-[0_0_20px_rgba(255,30,39,0.25)]">
              <span class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>ВИНИЛОВЫЙ ЛАУНДЖ // HI-FI AUDIO</span>
            </div>
            <h2 class="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-unbounded">
              ПЛЕЙЛИСТ <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 text-glow-red">ПАБА</span>
            </h2>
            <p class="text-[11px] sm:text-xs text-neutral-400 font-mono-tech mt-1 sm:mt-2 max-w-xl leading-relaxed">
              Теплый ламповый саунд, британский рок, инди-гимны и атмосфера за баром. Выбирайте любую из 15 пластинок и ставьте иглу на дорожку.
            </p>
          </div>

          <!-- Turntable Status Badges -->
          <div class="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono-tech">
              <span class="w-2.5 h-2.5 rounded-full ${this.isPlaying ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} transition-colors duration-300" id="vinyl-status-led"></span>
              <span class="text-neutral-300 font-bold" id="vinyl-status-text">${this.isPlaying ? 'MOTOR ON' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        <!-- Main Interactive Layout: Turntable Plinth + HUD Deck -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-8 sm:mb-12">
          
          <!-- LEFT / CENTER: The Hi-Fi Turntable Deck (Chassis) -->
          <div class="lg:col-span-7 flex flex-col items-center">
            
            <!-- Turntable Plinth Chassis (Brushed Gunmetal & Carbon) -->
            <div id="turntable-chassis" class="relative w-full max-w-[480px] sm:max-w-[540px] p-4 sm:p-7 rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#18181c] via-[#0f0f12] to-[#070709] border-2 border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(255,30,39,0.15)] overflow-hidden transition-all duration-300">
              
              <!-- Subtle Brushed Texture Overlay -->
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_60%)] pointer-events-none"></div>
              <div class="absolute top-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

              <!-- Turntable Top Brand Plate -->
              <div class="relative z-10 flex items-center justify-between mb-3 sm:mb-5 px-1">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span class="text-[10px] sm:text-xs font-black tracking-widest text-neutral-300 font-unbounded">SHRIMP // HI-FI 1200</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[9px] sm:text-[10px] font-mono-tech uppercase text-neutral-500 tracking-wider">DIRECT DRIVE TURNTABLE</span>
                </div>
              </div>

              <!-- Turntable Platter & Tonearm Stage -->
              <div class="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center">
                
                <!-- Heavy Aluminum Platter (Outer Rim with Strobe Markings) -->
                <div class="absolute inset-2 sm:inset-3 rounded-full bg-gradient-to-br from-[#2a2b30] via-[#1c1d22] to-[#121316] border-4 border-[#3a3b42] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden">
                  
                  <!-- Strobe Edge Markings -->
                  <div id="turntable-strobe-rim" class="absolute inset-0 rounded-full border-[6px] border-dashed border-neutral-600/30 pointer-events-none spin-strobe" style="animation-play-state: ${this.isPlaying ? 'running' : 'paused'};"></div>
                  <div class="absolute inset-3 rounded-full border border-white/5 pointer-events-none"></div>
                  
                  <!-- Felt Slipmat Background -->
                  <div class="absolute inset-4 rounded-full bg-[#111114] flex items-center justify-center">
                    <span class="text-[8vw] sm:text-5xl font-black text-white/[0.03] uppercase font-unbounded select-none">SHRIMP</span>
                  </div>
                </div>

                <!-- VINYL RECORD (12" LP) -->
                <div 
                  id="vinyl-record" 
                  class="relative z-10 w-[84%] h-[84%] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_0_25px_rgba(0,0,0,0.95)] flex items-center justify-center cursor-pointer select-none vinyl-spinning"
                  style="
                    animation-play-state: ${this.isPlaying ? 'running' : 'paused'};
                    animation-duration: 1.8s;
                    background: radial-gradient(circle, #0a0a0c 0%, #151518 15%, #050507 40%, #17171b 60%, #060608 85%, #121215 100%);
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 20px 45px rgba(0,0,0,0.95), inset 0 0 40px rgba(0,0,0,0.9);
                  "
                  title="Нажмите на пластинку для воспроизведения / паузы"
                >
                  <!-- High-Gloss Vinyl Grooves (Micro-grooves pattern) -->
                  <div class="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,transparent_0,transparent_2px,rgba(255,255,255,0.025)_3px,transparent_4px)] pointer-events-none"></div>
                  
                  <!-- Dynamic Light Sheen / Specular Highlights Across Grooves -->
                  <div class="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.07)_45deg,transparent_90deg,rgba(255,255,255,0.07)_225deg,transparent_270deg)] pointer-events-none"></div>
                  
                  <!-- Vinyl Run-Out Groove Ring -->
                  <div class="absolute w-[44%] h-[44%] rounded-full border border-neutral-700/40 pointer-events-none"></div>

                  <!-- CENTER VINYL LABEL (Song Cover / Logo & Info) -->
                  <div 
                    id="vinyl-center-label" 
                    class="relative z-20 w-[35%] h-[35%] rounded-full border-2 border-amber-500/40 flex flex-col items-center justify-center text-center p-1.5 shadow-[inset_0_0_15px_rgba(0,0,0,0.8),0_2px_10px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500"
                    style="background: ${track.labelBg};"
                  >
                    ${track.coverImg ? `
                      <!-- Real Album Cover in Center of Vinyl Record -->
                      <img 
                        src="${track.coverImg}" 
                        alt="${track.title}" 
                        class="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none drop-shadow" 
                      />
                      <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.45)_100%)] pointer-events-none"></div>
                      <div class="absolute inset-1 rounded-full border border-white/20 pointer-events-none"></div>
                    ` : `
                      <!-- Vintage Label Border Ring -->
                      <div class="absolute inset-1 rounded-full border border-white/20 pointer-events-none"></div>
                      
                      <!-- Song Logo (DEAD CENTER ABOVE & SURROUNDING SPINDLE) -->
                      <div id="label-song-logo" class="relative z-20 w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] flex items-center justify-center">
                        ${track.logoSvg}
                      </div>

                      <!-- Track Title Curved/Condensed Underneath -->
                      <span id="label-track-title" class="relative z-20 text-[7px] sm:text-[9px] font-black uppercase font-unbounded text-white tracking-wider line-clamp-1 mt-0.5 px-1 drop-shadow">
                        ${track.title}
                      </span>

                      <span id="label-track-artist" class="relative z-20 text-[6px] sm:text-[7px] font-mono-tech text-white/70 uppercase tracking-widest truncate max-w-[85%]">
                        ${track.artist}
                      </span>

                      <span class="absolute bottom-1 text-[5px] font-mono-tech text-amber-300/60 uppercase tracking-widest">
                        HI-FI STEREO
                      </span>
                    `}

                    <!-- Center Spindle Pin Hole -->
                    <div class="absolute w-4 h-4 rounded-full bg-[#1b1b1e] border-2 border-neutral-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-30 flex items-center justify-center">
                      <div class="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
                    </div>
                  </div>
                </div>

                <!-- TONEARM (Precision Engineered Realistic Tonearm) -->
                <div 
                  id="tonearm-assembly" 
                  class="absolute top-2 right-2 sm:top-3 sm:right-3 w-[45%] h-[75%] pointer-events-none z-30 origin-[82%_15%] transition-transform duration-1000 ease-in-out"
                  style="transform: rotate(${this.getTonearmAngle()}deg);"
                >
                  <!-- Tonearm Pivot Base (Circular Gimbal) -->
                  <div class="absolute top-[10%] right-[12%] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#4a4c55] via-[#2d2e34] to-[#17181c] border-2 border-[#5c5e69] shadow-[0_8px_16px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    <div class="w-4 h-4 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-500 shadow-sm"></div>
                  </div>

                  <!-- Counterweight Cylinder Behind Pivot -->
                  <div class="absolute top-[3%] right-[8%] w-6 h-7 rounded-sm bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 border border-neutral-600 shadow-md"></div>

                  <!-- S-Curved Metallic Arm Tube (SVG) -->
                  <svg class="absolute inset-0 w-full h-full drop-shadow-[0_12px_14px_rgba(0,0,0,0.8)]" viewBox="0 0 160 260" fill="none">
                    <!-- Arm tube shadow -->
                    <path d="M130 35 C 130 80, 110 130, 85 180 C 75 200, 60 215, 45 235" stroke="rgba(0,0,0,0.6)" stroke-width="6" stroke-linecap="round"/>
                    <!-- Chrome tube gradient -->
                    <path d="M130 35 C 130 80, 110 130, 85 180 C 75 200, 60 215, 45 235" stroke="url(#chrome-gradient)" stroke-width="4.5" stroke-linecap="round"/>
                    
                    <!-- Headshell with Cartridge & Needle at the Tip -->
                    <g transform="translate(45, 235) rotate(22)">
                      <!-- Headshell body -->
                      <rect x="-12" y="0" width="24" height="32" rx="3" fill="#1b1c20" stroke="#ff1e27" stroke-width="1.2"/>
                      <!-- Cartridge (Red/Gold) -->
                      <rect x="-8" y="22" width="16" height="12" rx="1.5" fill="#e11d48"/>
                      <!-- Stylus tip -->
                      <circle cx="0" cy="34" r="2" fill="#facc15"/>
                      <!-- Finger lift lever -->
                      <path d="M10 8 C 18 8, 22 14, 20 22" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
                    </g>

                    <defs>
                      <linearGradient id="chrome-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="40%" stop-color="#9ca3af"/>
                        <stop offset="70%" stop-color="#e5e7eb"/>
                        <stop offset="100%" stop-color="#4b5563"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

              </div>

              <!-- Turntable Bottom Physical Controls Strip -->
              <div class="relative z-10 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between gap-3 px-1">
                
                <!-- Heavy Aluminum START / STOP Push Button -->
                <button 
                  id="btn-turntable-motor"
                  type="button"
                  class="btn-magnetic px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${this.isPlaying ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_25px_rgba(255,30,39,0.5)] border-red-400' : 'bg-gradient-to-b from-[#2e2f36] to-[#191a1e] text-neutral-300 hover:text-white border-white/20'} border font-black uppercase text-xs sm:text-sm font-unbounded tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
                  title="Запустить / остановить проигрыватель"
                >
                  <svg class="w-4 h-4 fill-current ${this.isPlaying ? 'animate-pulse' : ''}" viewBox="0 0 24 24">
                    ${this.isPlaying 
                      ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' 
                      : '<path d="M8 5v14l11-7z"/>'}
                  </svg>
                  <span>${this.isPlaying ? 'STOP MOTOR' : 'START MOTOR'}</span>
                </button>

                <!-- Status / Power Indicator -->
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-[10px] sm:text-xs font-mono-tech font-bold text-emerald-400">QUARTZ DIRECT DRIVE</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- RIGHT: High-End Track HUD, Dual VU Meters & Playback Console -->
          <div class="lg:col-span-5 flex flex-col gap-4 sm:gap-5 w-full">
            
            <!-- VFD Audio Console / Now Playing Card -->
            <div class="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/60 border border-white/10 backdrop-blur-md shadow-xl flex flex-col gap-4">
              
              <!-- Console Top Header -->
              <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-500 ${this.isPlaying ? 'animate-ping' : ''}"></span>
                  <span class="text-[10px] sm:text-xs font-mono-tech text-neutral-400 uppercase tracking-widest">
                    VINYL <span id="hud-track-num" class="text-white font-bold">${String(track.id).padStart(2, '0')}</span> / 15
                  </span>
                </div>
                <span id="hud-track-genre" class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-tech text-amber-300">
                  ${track.genre} • ${track.year}
                </span>
              </div>

              <!-- Track Title & Artist -->
              <div class="min-w-0">
                <h3 id="hud-track-title" class="text-xl sm:text-2xl font-black text-white font-unbounded tracking-tight truncate leading-tight">
                  ${track.title}
                </h3>
                <p id="hud-track-artist" class="text-xs sm:text-sm font-mono-tech text-red-400 font-bold mt-1">
                  ${track.artist}
                </p>
              </div>

              <!-- Dual Stereo Analog VU Meters (Illuminated Gauges) -->
              <div class="grid grid-cols-2 gap-3 p-2.5 sm:p-3 rounded-xl bg-[#090a0d] border border-white/10 shadow-inner">
                
                <!-- Channel L Meter -->
                <div class="flex flex-col items-center">
                  <div class="relative w-full h-12 sm:h-14 rounded-lg bg-gradient-to-b from-[#2a2818] via-[#1c1b10] to-[#0c0c08] border border-amber-500/20 overflow-hidden flex items-end justify-center px-2 pb-1 shadow-[inset_0_0_12px_rgba(245,158,11,0.2)]">
                    <!-- Gauge Scale Arc -->
                    <div class="absolute inset-x-2 top-2 h-5 border-t border-amber-200/30 flex justify-between text-[7px] font-mono-tech text-amber-200/50">
                      <span>-20</span>
                      <span>-7</span>
                      <span>0</span>
                      <span class="text-red-400">+3</span>
                    </div>
                    <!-- Meter Needle -->
                    <div id="vu-needle-left" class="w-0.5 h-10 bg-gradient-to-t from-red-600 via-amber-400 to-amber-200 origin-bottom transition-transform duration-75 ease-out" style="transform: rotate(-30deg);"></div>
                  </div>
                  <span class="text-[9px] font-mono-tech text-neutral-400 mt-1">CH-LEFT (VU)</span>
                </div>

                <!-- Channel R Meter -->
                <div class="flex flex-col items-center">
                  <div class="relative w-full h-12 sm:h-14 rounded-lg bg-gradient-to-b from-[#2a2818] via-[#1c1b10] to-[#0c0c08] border border-amber-500/20 overflow-hidden flex items-end justify-center px-2 pb-1 shadow-[inset_0_0_12px_rgba(245,158,11,0.2)]">
                    <!-- Gauge Scale Arc -->
                    <div class="absolute inset-x-2 top-2 h-5 border-t border-amber-200/30 flex justify-between text-[7px] font-mono-tech text-amber-200/50">
                      <span>-20</span>
                      <span>-7</span>
                      <span>0</span>
                      <span class="text-red-400">+3</span>
                    </div>
                    <!-- Meter Needle -->
                    <div id="vu-needle-right" class="w-0.5 h-10 bg-gradient-to-t from-red-600 via-amber-400 to-amber-200 origin-bottom transition-transform duration-75 ease-out" style="transform: rotate(-30deg);"></div>
                  </div>
                  <span class="text-[9px] font-mono-tech text-neutral-400 mt-1">CH-RIGHT (VU)</span>
                </div>
              </div>

              <!-- Interactive Timeline Scrubber -->
              <div class="space-y-1.5">
                <div class="relative w-full h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer group" id="progress-container">
                  <div id="progress-bar" class="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-red-600 to-amber-400 rounded-full transition-all duration-100" style="width: 0%;"></div>
                </div>
                <div class="flex items-center justify-between text-[11px] font-mono-tech text-neutral-400">
                  <span id="time-current">00:00</span>
                  <span class="text-neutral-600">•</span>
                  <span id="time-total">${track.duration}</span>
                </div>
              </div>

              <!-- Transport Controls Bar -->
              <div class="flex items-center justify-between gap-2 pt-2">
                
                <!-- Prev Track Button -->
                <button 
                  id="btn-prev-track" 
                  type="button" 
                  class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Предыдущая пластинка"
                >
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>

                <!-- Big Main Play/Pause Button -->
                <button 
                  id="btn-play-pause" 
                  type="button" 
                  class="flex-1 py-3 px-4 rounded-xl ${this.isPlaying ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(255,30,39,0.4)]' : 'bg-white hover:bg-neutral-200 text-black'} active:scale-95 font-black uppercase text-xs sm:text-sm font-unbounded tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  title="${this.isPlaying ? 'Пауза' : 'Воспроизведение'}"
                >
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    ${this.isPlaying 
                      ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' 
                      : '<path d="M8 5v14l11-7z"/>'}
                  </svg>
                  <span id="hud-play-label">${this.isPlaying ? 'ПАУЗА' : 'ИГРАТЬ ТРЕК'}</span>
                </button>

                <!-- Next Track Button -->
                <button 
                  id="btn-next-track" 
                  type="button" 
                  class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Следующая пластинка"
                >
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>

              </div>

            </div>


          </div>
        </div>

        <!-- BOTTOM SECTION: The 15 Vinyl Records Collection / Rack (Crate) -->
        <div class="mt-4 sm:mt-8">
          
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-black text-white uppercase font-unbounded tracking-wider">
                КОЛЛЕКЦИЯ ПЛАСТИНОК ПАБА
              </span>
              <span class="px-2 py-0.5 rounded bg-red-600/30 text-red-400 text-[10px] font-bold font-mono-tech border border-red-500/40">
                15 ТРЕКОВ
              </span>
            </div>
            
            <!-- Quick Scroll Arrows for Desktop & Mobile -->
            <div class="flex items-center gap-1.5">
              <button id="btn-scroll-crate-left" type="button" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition-colors border border-white/10" title="Прокрутить влево">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <button id="btn-scroll-crate-right" type="button" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition-colors border border-white/10" title="Прокрутить вправо">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
          </div>

          <!-- Horizontal Scrollable Vinyl Crate / Carousel -->
          <div 
            id="vinyl-crate-track" 
            class="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto py-7 sm:py-8 px-5 sm:px-8 no-scrollbar snap-x snap-mandatory select-none"
          >
            ${this.tracks.map((t, idx) => {
              const isCurrent = idx === this.currentIndex;
              return `
                <div 
                  data-track-index="${idx}"
                  class="vinyl-card relative shrink-0 w-[180px] xs:w-[200px] sm:w-[230px] md:w-[245px] lg:w-[250px] p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#18181c] to-[#0c0c0e] border-2 ${isCurrent ? 'border-red-500 shadow-[0_0_15px_rgba(255,30,39,0.45),inset_0_0_15px_rgba(255,30,39,0.22)] ring-1 ring-red-500/30' : 'border-white/10 hover:border-white/30'} cursor-pointer transition-all duration-300 snap-start flex flex-col justify-between group"
                >
                  <!-- Active Indicator Badge (Anchored cleanly inside card: zero clipping) -->
                  ${isCurrent ? `
                    <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono-tech tracking-wider uppercase shadow-md flex items-center gap-1 z-20">
                      <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span>В ПРОИГРЫВАТЕЛЕ</span>
                    </div>
                  ` : ''}

                  <!-- Vinyl Sleeve with Peeking Vinyl Disc -->
                  <div class="relative w-full aspect-square mb-3 flex items-center justify-start overflow-visible">
                    
                    <!-- Peeking Vinyl Disc (Black grooved disc sliding out to the right) -->
                    <div class="absolute left-[18%] top-1/2 -translate-y-1/2 w-[68%] aspect-square rounded-full bg-gradient-to-br from-[#1c1c22] via-[#121215] to-[#08080a] border border-neutral-700 shadow-md transition-transform duration-300 pointer-events-none z-0 ${isCurrent ? 'translate-x-2' : 'group-hover:translate-x-1.5'} flex items-center justify-center">
                      <!-- Fine concentric groove rings on peeking vinyl -->
                      <div class="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,transparent_0,transparent_2px,rgba(255,255,255,0.03)_3px,transparent_4px)]"></div>
                    </div>

                    <!-- Album Sleeve Jacket Front (100% Solid & Opaque - No shine-through) -->
                    <div 
                      class="relative z-10 w-[72%] aspect-square rounded-lg shadow-[4px_0_14px_rgba(0,0,0,0.85)] border border-white/10 overflow-hidden bg-[#121215] flex flex-col justify-between"
                    >
                      ${t.coverImg ? `
                        <!-- Real Album Cover Artwork -->
                        <div class="relative w-full h-full">
                          <img src="${t.coverImg}" alt="${t.title}" class="w-full h-full object-cover" />
                          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>
                          <div class="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono-tech text-[9px] font-bold border border-white/20">
                            #${String(t.id).padStart(2, '0')}
                          </div>
                        </div>
                      ` : `
                        <!-- Styled Album Jacket (Solid Opaque - Single Clean Logo) -->
                        <div 
                          class="w-full h-full p-2 sm:p-2.5 flex flex-col justify-between bg-gradient-to-br from-[#1a1a20] to-[#0b0b0e] border border-white/5"
                        >
                          <div class="flex items-center justify-between text-[9px] font-mono-tech">
                            <span class="px-1.5 py-0.5 rounded bg-black/70 text-white font-bold">#${String(t.id).padStart(2, '0')}</span>
                            <span class="text-neutral-400 font-mono-tech text-[8px] whitespace-nowrap">${t.side}</span>
                          </div>

                          <!-- Single Clean Center Artwork / Logo -->
                          <div class="w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-full bg-black/70 border border-white/10 flex items-center justify-center p-2 text-white shadow-inner" style="color: ${t.accentColor};">
                            ${t.logoSvg}
                          </div>

                          <div class="text-[8px] font-mono-tech text-neutral-400 text-center truncate">
                            ${t.side}
                          </div>
                        </div>
                      `}
                    </div>
                  </div>

                  <!-- Track Info Below Sleeve -->
                  <div class="min-w-0">
                    <h4 class="text-xs sm:text-sm font-bold text-white font-unbounded line-clamp-2 h-9 sm:h-10 leading-snug group-hover:text-red-400 transition-colors">
                      ${t.title}
                    </h4>
                    <p class="text-[11px] font-mono-tech text-neutral-400 truncate mt-0.5">
                      ${t.artist}
                    </p>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono-tech text-neutral-500">
                      <span>${t.duration}</span>
                      <span class="text-neutral-600">•</span>
                      <span>${t.genre}</span>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>

        <!-- GUSLI APP CALLOUT BANNER -->
        <div class="mt-8 sm:mt-12 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-950/40 via-[#121216] to-amber-950/30 border border-red-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(255,30,39,0.1)] relative overflow-hidden">
          
          <!-- Background Ambient Glow Accents -->
          <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <!-- Left Info Block -->
            <div class="flex items-center sm:items-start gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(255,30,39,0.4)] border border-red-400/40">
                <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              </div>

              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-mono-tech uppercase tracking-wider mb-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>МУЗЫКАЛЬНЫЙ АВТОМАТ ПАБА</span>
                </div>
                
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase font-unbounded tracking-tight leading-tight">
                  Скачай приложение Gusli и кайфони от своей песни.
                </h3>
                
                <p class="text-xs sm:text-sm text-neutral-400 font-mono-tech mt-2 max-w-xl">
                  Включай любимые треки в Shrimp Pub прямо со своего смартфона через музыкальный автомат Gusli в реальном времени.
                </p>
              </div>
            </div>

            <!-- Right: App Store & Google Play Download Buttons -->
            <div class="flex flex-col xs:flex-row items-center justify-center gap-3 shrink-0 w-full md:w-auto">
              
              <!-- Google Play Store Button -->
              <a 
                href="https://play.google.com/store/apps/details?id=ru.mobileup.gusliapp&ysclid=mwmf6hcbv275493932" 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full xs:w-auto flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-black/80 hover:bg-neutral-900 border border-white/15 hover:border-red-500/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,30,39,0.25)] transition-all duration-300 active:scale-95 group"
                title="Скачать Gusli в Google Play"
              >
                <!-- Official Google Play 2022 Brand Vector Icon -->
                <svg class="w-6 h-6 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 28 32" fill="none">
                  <path d="M13.54 15.28.12 29.34a3.64 3.64 0 0 0 5.33 2.16l15.1-8.6z" fill="#EA4335"/>
                  <path d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.55 3.55 0 0 0 0-6.29z" fill="#FBBC04"/>
                  <path d="M.12 2.66a3.46 3.46 0 0 0-.12.92v24.84a3.66 3.66 0 0 0 .12.92L14 15.64Z" fill="#4285F4"/>
                  <path d="m13.64 16 6.94-6.85L5.5.51A3.72 3.72 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z" fill="#34A853"/>
                </svg>
                <div class="text-left">
                  <div class="text-[9px] uppercase tracking-wider text-neutral-400 font-mono-tech">Доступно в</div>
                  <div class="text-xs sm:text-sm font-bold text-white font-unbounded whitespace-nowrap">Google Play</div>
                </div>
              </a>

              <!-- Apple App Store Button -->
              <a 
                href="https://apps.apple.com/ru/app/gusli/id1090409008" 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full xs:w-auto flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-black/80 hover:bg-neutral-900 border border-white/15 hover:border-red-500/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,30,39,0.25)] transition-all duration-300 active:scale-95 group"
                title="Скачать Gusli в App Store"
              >
                <!-- Official Apple Vector Logo -->
                <svg class="w-6 h-6 fill-current text-white shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 814 1000">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
                <div class="text-left">
                  <div class="text-[9px] uppercase tracking-wider text-neutral-400 font-mono-tech">Загрузите в</div>
                  <div class="text-xs sm:text-sm font-bold text-white font-unbounded whitespace-nowrap">App Store</div>
                </div>
              </a>

            </div>

          </div>
        </div>

      </div>
    `;
  }

  getTonearmAngle() {
    if (!this.isPlaying) return -30; // Resting in cradle
    // Subtle inward creep as track progresses from 18deg to 32deg
    const progress = this.duration > 0 ? (this.currentTime / this.duration) : 0;
    return 18 + progress * 14;
  }

  attachEvents() {
    // 1. Turntable Motor Start/Stop
    const btnMotor = document.getElementById('btn-turntable-motor');
    if (btnMotor) {
      btnMotor.addEventListener('click', () => this.togglePlay());
    }

    // 2. Click directly on Vinyl Disc
    const vinylRecord = document.getElementById('vinyl-record');
    if (vinylRecord) {
      vinylRecord.addEventListener('click', () => this.togglePlay());
    }

    // 3. Play/Pause HUD button
    const btnPlayPause = document.getElementById('btn-play-pause');
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => this.togglePlay());
    }

    // 4. Prev / Next
    const btnPrev = document.getElementById('btn-prev-track');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.prevTrack());
    }

    const btnNext = document.getElementById('btn-next-track');
    if (btnNext) {
      btnNext.addEventListener('click', () => this.nextTrack());
    }

    // 5. Timeline Scrubber
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
      progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.seek(clickRatio * this.duration);
      });
    }

    // 7. Volume & Mute
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.setVolume(val);
      });
    }

    const btnMute = document.getElementById('btn-toggle-mute');
    if (btnMute) {
      btnMute.addEventListener('click', () => this.toggleMute());
    }

    // 8. Crate Scrolling Arrows
    const crateTrack = document.getElementById('vinyl-crate-track');
    const btnScrollLeft = document.getElementById('btn-scroll-crate-left');
    const btnScrollRight = document.getElementById('btn-scroll-crate-right');
    if (crateTrack && btnScrollLeft && btnScrollRight) {
      btnScrollLeft.addEventListener('click', () => {
        crateTrack.scrollBy({ left: -240, behavior: 'smooth' });
      });
      btnScrollRight.addEventListener('click', () => {
        crateTrack.scrollBy({ left: 240, behavior: 'smooth' });
      });
    }

    // 9. Click on any Vinyl Card in the 15-track Crate
    if (crateTrack) {
      crateTrack.addEventListener('click', (e) => {
        const card = e.target.closest('.vinyl-card');
        if (!card) return;
        const index = parseInt(card.getAttribute('data-track-index'), 10);
        if (!isNaN(index) && index !== this.currentIndex) {
          this.selectTrack(index);
        } else if (!isNaN(index) && index === this.currentIndex) {
          this.togglePlay();
        }
      });
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    sound.isMusicPlaying = true;
    sound.muted = false;
    sound.notifyListeners();

    this.playNeedleDropSound();

    if (this.audioElement) {
      this.audioElement.play().catch(() => {
        console.log('Audio autoplay blocked, running in visual vinyl mode');
      });
    }

    if (this.crackleGain && this.crackleEnabled) {
      this.crackleGain.gain.setValueAtTime(0.12, this.audioContext?.currentTime || 0);
    }

    // Start progress simulation ticker if audio element is not advancing
    this.startProgressTimer();
    this.updateTurntableStateUI();
  }

  pause() {
    this.isPlaying = false;
    sound.isMusicPlaying = false;
    sound.muted = true;
    sound.notifyListeners();

    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.crackleGain) {
      this.crackleGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
    }
    this.stopProgressTimer();
    this.updateTurntableStateUI();
  }

  selectTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentIndex = index;
    const track = this.getCurrentTrack();
    sound.trackTitle = `${track.artist} — ${track.title}`;
    sound.notifyListeners();
    this.loadCurrentAudio();
    this.render();
    this.attachEvents();
    if (this.isPlaying) {
      this.play();
    }
    const activeCard = this.container.querySelector(`.vinyl-card[data-track-index="${index}"]`);
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  prevTrack() {
    const nextIdx = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.selectTrack(nextIdx);
  }

  nextTrack() {
    const nextIdx = (this.currentIndex + 1) % this.tracks.length;
    this.selectTrack(nextIdx);
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.audioElement && this.audioElement.duration) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.updateProgressUI();
  }

  toggleCrackle() {
    this.crackleEnabled = !this.crackleEnabled;
    const btn = document.getElementById('btn-toggle-crackle');
    if (btn) {
      btn.className = `px-3 py-1.5 rounded-xl ${this.crackleEnabled ? 'bg-amber-950/70 text-amber-300 border-amber-500/40' : 'bg-black/40 text-neutral-500 border-white/5'} border text-[11px] font-mono-tech font-bold transition-all hover:border-amber-400 flex items-center gap-1.5`;
    }
    if (this.crackleGain) {
      this.crackleGain.gain.setValueAtTime(this.crackleEnabled && this.isPlaying ? 0.12 : 0, this.audioContext?.currentTime || 0);
    }
  }

  setVolume(val) {
    this.volume = val;
    this.isMuted = val === 0;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.value = this.isMuted ? 0 : this.volume;
    }
  }

  startProgressTimer() {
    this.stopProgressTimer();
    this.progressInterval = setInterval(() => {
      if (!this.isPlaying) return;
      if (!this.audioElement || this.audioElement.paused) {
        this.currentTime += 1;
        if (this.currentTime >= this.duration) {
          this.nextTrack();
          return;
        }
        this.updateProgressUI();
      }
    }, 1000);
  }

  stopProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  updateProgressUI() {
    const curTimeEl = document.getElementById('time-current');
    const totTimeEl = document.getElementById('time-total');
    const progBar = document.getElementById('progress-bar');
    const tonearm = document.getElementById('tonearm-assembly');

    if (curTimeEl) {
      curTimeEl.textContent = this.formatTime(this.currentTime);
    }
    if (totTimeEl) {
      totTimeEl.textContent = this.formatTime(this.duration);
    }
    if (progBar && this.duration > 0) {
      const pct = (this.currentTime / this.duration) * 100;
      progBar.style.width = `${pct}%`;
    }
    if (tonearm) {
      tonearm.style.transform = `rotate(${this.getTonearmAngle()}deg)`;
    }
  }

  updateTurntableStateUI() {
    const vinyl = document.getElementById('vinyl-record');
    const strobeRim = document.getElementById('turntable-strobe-rim');
    const tonearm = document.getElementById('tonearm-assembly');
    const btnMotor = document.getElementById('btn-turntable-motor');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const led = document.getElementById('vinyl-status-led');
    const statusText = document.getElementById('vinyl-status-text');

    if (vinyl) {
      vinyl.style.setProperty('animation-play-state', this.isPlaying ? 'running' : 'paused');
      vinyl.style.setProperty('animation-duration', '1.8s');
    }

    if (strobeRim) {
      strobeRim.style.setProperty('animation-play-state', this.isPlaying ? 'running' : 'paused');
    }

    if (tonearm) {
      tonearm.style.transform = `rotate(${this.getTonearmAngle()}deg)`;
    }

    if (led && statusText) {
      led.className = `w-2.5 h-2.5 rounded-full ${this.isPlaying ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} transition-colors duration-300`;
      statusText.textContent = this.isPlaying ? 'MOTOR ON' : 'STANDBY';
    }

    if (btnMotor) {
      btnMotor.innerHTML = `
        <svg class="w-4 h-4 fill-current ${this.isPlaying ? 'animate-pulse' : ''}" viewBox="0 0 24 24">
          ${this.isPlaying 
            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' 
            : '<path d="M8 5v14l11-7z"/>'}
        </svg>
        <span>${this.isPlaying ? 'STOP MOTOR' : 'START MOTOR'}</span>
      `;
      btnMotor.className = `btn-magnetic px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${this.isPlaying ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_25px_rgba(255,30,39,0.5)] border-red-400' : 'bg-gradient-to-b from-[#2e2f36] to-[#191a1e] text-neutral-300 hover:text-white border-white/20'} border font-black uppercase text-xs sm:text-sm font-unbounded tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer`;
    }

    if (btnPlayPause) {
      btnPlayPause.innerHTML = `
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          ${this.isPlaying 
            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' 
            : '<path d="M8 5v14l11-7z"/>'}
        </svg>
        <span>${this.isPlaying ? 'ПАУЗА' : 'ИГРАТЬ ТРЕК'}</span>
      `;
      btnPlayPause.className = `flex-1 py-3 px-4 rounded-xl ${this.isPlaying ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(255,30,39,0.4)]' : 'bg-white hover:bg-neutral-200 text-black'} active:scale-95 font-black uppercase text-xs sm:text-sm font-unbounded tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer`;
    }
  }

  startVuMeters() {
    const needleL = document.getElementById('vu-needle-left');
    const needleR = document.getElementById('vu-needle-right');

    const animate = () => {
      if (needleL && needleR) {
        if (this.isPlaying) {
          // Dynamic rhythm fluctuation
          const time = Date.now() / 150;
          const beatL = Math.sin(time * 2.2) * 0.4 + Math.cos(time * 4.7) * 0.3 + (Math.random() * 0.3);
          const beatR = Math.cos(time * 2.1) * 0.4 + Math.sin(time * 4.3) * 0.3 + (Math.random() * 0.3);
          
          const angleL = -28 + Math.max(0, Math.min(1, beatL)) * 48;
          const angleR = -28 + Math.max(0, Math.min(1, beatR)) * 48;

          needleL.style.transform = `rotate(${angleL}deg)`;
          needleR.style.transform = `rotate(${angleR}deg)`;
        } else {
          needleL.style.transform = 'rotate(-32deg)';
          needleR.style.transform = 'rotate(-32deg)';
        }
      }
      this.vuAnimationId = requestAnimationFrame(animate);
    };

    this.vuAnimationId = requestAnimationFrame(animate);
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  destroy() {
    this.stopProgressTimer();
    if (this.vuAnimationId) {
      cancelAnimationFrame(this.vuAnimationId);
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.crackleNode) {
      try { this.crackleNode.stop(); } catch(e){}
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch(e){}
    }
  }
}
