/**
 * HalftoneCanvas.js
 * High-performance, graphic Halftone Dot Matrix Canvas Engine for ShrimpPub.
 * Pure Red & Black palette (#ff1e27 & #070104) — ZERO blurry gradients!
 * 
 * Features:
 * - Kinetic dot matrix with traveling harmonic ripples
 * - Subtle tactile expansion ripple following mouse movement
 * - Scroll-reactive phase momentum (matrix reacts as user scrolls)
 * - Brutalist graphic typography stamps & telemetry coordinates
 * - HiDPI rendering on desktop, lighter canvas on touch screens
 */
export class HalftoneCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    if (!this.ctx) return;

    this.width = 0;
    this.height = 0;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.dpr = this.isTouch ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    this.frameInterval = this.isTouch ? 1000 / 30 : 0;
    this.animId = null;
    this.events = new AbortController();

    // Wave and matrix state
    this.phase = 0;
    this.baseSpeed = 0.025;
    this.scrollVelocity = 0;
    this.lastScrollY = window.scrollY || 0;

    // Mouse interaction state
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.targetMouseX = -1000;
    this.targetMouseY = -1000;

    // Telemetry labels for brutalist craft stamps
    this.stamps = [
      { text: '59.93°N // 30.31°E [SPB]', xRatio: 0.08, yRatio: 0.18 },
      { text: 'SHRIMP PUB // 20 TAPS ONLINE', xRatio: 0.82, yRatio: 0.22 },
      { text: 'TEMP: +4°C // COLD CHAIN', xRatio: 0.08, yRatio: 0.55 },
      { text: 'KINETIC MATRIX // EST 2024', xRatio: 0.80, yRatio: 0.65 },
      { text: 'VOL 4.5% - 11.2% // ROTATION ACTIVE', xRatio: 0.12, yRatio: 0.88 }
    ];

    this.init();
  }

  init() {
    const options = { passive: true, signal: this.events.signal };
    const measure = () => this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    measure();
    if ('ResizeObserver' in window) {
      this.sizing = new ResizeObserver(([{ contentRect }]) => {
        this.resize(Math.round(contentRect.width), Math.round(contentRect.height));
      });
      this.sizing.observe(this.canvas);
    } else {
      window.addEventListener('resize', measure, options);
    }

    // Track mouse coordinates smoothly
    if (!this.isTouch) {
      window.addEventListener('mousemove', (e) => {
        this.targetMouseX = e.clientX;
        this.targetMouseY = e.clientY;
      }, options);
    }

    // Track scroll velocity for matrix kinetic ripple
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY || 0;
      const delta = Math.abs(currentScrollY - this.lastScrollY);
      this.scrollVelocity = Math.min(this.scrollVelocity + delta * 0.0015, 0.08);
      this.lastScrollY = currentScrollY;
    }, options);

    // Page visibility check to save CPU when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    }, options);

    this.start();
  }

  resize(width, height) {
    if (!width || !height || (width === this.width && height === this.height)) return;
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.render();
  }

  start() {
    if (this.animId !== null || document.hidden) return;
    let lastRender = performance.now();
    let nextRender = lastRender + this.frameInterval;

    const loop = (currentTime) => {
      this.animId = requestAnimationFrame(loop);
      const elapsed = currentTime - lastRender;
      if (elapsed <= 0 || currentTime + 0.5 < nextRender) return;
      lastRender = currentTime;
      const nextFrame = nextRender + this.frameInterval;
      nextRender = nextFrame > currentTime ? nextFrame : currentTime + this.frameInterval;
      const steps = Math.min(elapsed, 100) / (1000 / 60);

      // Smooth mouse interpolation
      if (!this.isTouch) {
        const smoothing = 1 - Math.pow(0.9, steps);
        this.mouseX += (this.targetMouseX - this.mouseX) * smoothing;
        this.mouseY += (this.targetMouseY - this.mouseY) * smoothing;
      }

      // Dampen scroll velocity
      this.scrollVelocity *= Math.pow(0.94, steps);
      this.phase += (this.baseSpeed + this.scrollVelocity) * steps;

      this.render();
    };

    this.animId = requestAnimationFrame(loop);
  }

  render() {
    // 1. Clear with deep pitch black base (#070104)
    this.ctx.fillStyle = '#070104';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Render kinetic Halftone Dot Matrix
    const isMobile = this.width < 768;
    const spacing = isMobile ? 32 : 36;
    const cols = Math.ceil(this.width / spacing) + 1;
    const rows = Math.ceil(this.height / spacing) + 1;
    const centerX = this.width * 0.5;
    const centerY = this.height * 0.45;
    this.ctx.fillStyle = '#ff1e27';

    for (let r = 0; r < rows; r++) {
      const y = r * spacing;
      for (let c = 0; c < cols; c++) {
        const x = c * spacing;

        // Distance from center for radial ripple
        const dxCenter = x - centerX;
        const dyCenter = y - centerY;
        const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

        // Primary wave harmonic
        const wave = Math.sin(distCenter * 0.016 - this.phase);

        let mouseBoost = 0;
        if (!this.isTouch) {
          const dxMouse = x - this.mouseX;
          const dyMouse = y - this.mouseY;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < 220) mouseBoost = (1 - distMouse / 220) * 2.8;
        }

        // Calculate dynamic dot radius and opacity
        const normalizedWave = (wave + 1) * 0.5; // 0 to 1
        const radius = Math.max(0.8, 1.2 + normalizedWave * 2.2 + mouseBoost);
        const alpha = Math.min(0.85, 0.14 + normalizedWave * 0.45 + mouseBoost * 0.25);

        // Render dot
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.globalAlpha = alpha;
        this.ctx.fill();
      }
    }
    this.ctx.globalAlpha = 1;

    // 3. Render Brutalist Typography Stamps & Tech Telemetry
    if (!isMobile) {
      this.ctx.font = 'bold 9px "JetBrains Mono", monospace';
      this.ctx.textBaseline = 'middle';

      for (let i = 0; i < this.stamps.length; i++) {
        const s = this.stamps[i];
        const sx = this.width * s.xRatio;
        const sy = this.height * s.yRatio;

        // Subtle frame around telemetry stamp
        const paddingH = 8;
        const paddingV = 4;
        const textWidth = this.ctx.measureText(s.text).width;

        // Thin red border
        this.ctx.strokeStyle = 'rgba(255, 30, 39, 0.25)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(sx - paddingH, sy - paddingV - 5, textWidth + paddingH * 2, 18);

        // Stamp red text
        this.ctx.fillStyle = 'rgba(255, 60, 70, 0.75)';
        this.ctx.fillText(s.text, sx, sy);
      }
    }
  }

  stop() {
    if (this.animId !== null) cancelAnimationFrame(this.animId);
    this.animId = null;
  }

  destroy() {
    this.stop();
    this.sizing?.disconnect();
    this.events?.abort();
  }
}
