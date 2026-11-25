// src/utils/audio.js
// Synthesized Web Audio API sound effects + Unified Pub Vinyl Music Controller
// Strict zero-emoji policy.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.isMusicPlaying = false;
    this.wasPlayingBeforeHide = false;
    this.trackTitle = "Gerry & The Pacemakers — You'll Never Walk Alone";
    this.listeners = [];
    this.musicPlayer = null;
    this.initVisibilityHandling();
  }

  setMusicPlayer(player) {
    this.musicPlayer = player;
    if (player) {
      this.trackTitle = `${player.getCurrentTrack().artist} — ${player.getCurrentTrack().title}`;
      this.isMusicPlaying = player.isPlaying;
      this.notifyListeners();
    }
  }

  get isMusicRequested() {
    return this.musicPlayer?.isPlaybackRequested ?? false;
  }

  initVisibilityHandling() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.isMusicRequested) {
          this.wasPlayingBeforeHide = true;
          this.pauseMusic();
        }
      } else if (this.wasPlayingBeforeHide) {
        this.wasPlayingBeforeHide = false;
        this.playMusic();
      }
    });
  }

  onStateChange(callback) {
    this.listeners.push(callback);
    callback({
      muted: !this.isMusicPlaying,
      isMusicPlaying: this.isMusicPlaying,
      trackTitle: this.trackTitle
    });
  }

  notifyListeners() {
    const state = {
      muted: !this.isMusicPlaying,
      isMusicPlaying: this.isMusicPlaying,
      trackTitle: this.trackTitle
    };
    this.listeners.forEach(cb => {
      try {
        cb(state);
      } catch (e) {}
    });
  }

  init() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init notice:', e);
    }
  }

  playMusic() {
    return this.musicPlayer?.play();
  }

  pauseMusic() {
    this.musicPlayer?.pause({ muteEffects: false });
  }

  toggleMusic() {
    if (this.musicPlayer) {
      return this.musicPlayer.togglePlay();
    }
    this.muted = !this.muted;
    this.isMusicPlaying = !this.muted;
    this.notifyListeners();
    return this.isMusicPlaying;
  }

  setVolume(vol) {
    if (this.musicPlayer) {
      this.musicPlayer.setVolume(vol);
    }
  }

  playPick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playSnap() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playBeerVictory() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);

      const hissGain = this.ctx.createGain();
      hissGain.gain.setValueAtTime(0.25, now);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      whiteNoise.connect(filter);
      filter.connect(hissGain);
      hissGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + 0.15 + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.65);
      });
    } catch (e) {}
  }

  playClick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  playPourSound(durationSec = 7) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const dur = Math.min(durationSec, 7);
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + dur);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.setValueAtTime(0.12, now + dur - 0.5);
      gain.gain.linearRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + dur);
    } catch (e) {}
  }
}

export const sound = new SoundManager();
