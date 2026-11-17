/**
 * HalftoneCanvas.js
 * High-performance, graphic Halftone Dot Matrix Canvas Engine for ShrimpPub.
 * Pure Red & Black palette (#ff1e27 & #070104) — ZERO blurry gradients!
 * 
 * Features:
 * - 60 FPS kinetic dot matrix with traveling harmonic ripples
 * - Subtle tactile expansion ripple following mouse movement
 * - Scroll-reactive phase momentum (matrix reacts as user scrolls)
 * - Brutalist graphic typography stamps & telemetry coordinates
 * - 100% vector-sharp on retina/HiDPI screens
 */
export class HalftoneCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animId = null;

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
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Track mouse coordinates smoothly
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    }, { passive: true });

    // Track scroll velocity for matrix kinetic ripple
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY || 0;
      const delta = Math.abs(currentScrollY - this.lastScrollY);
      this.scrollVelocity = Math.min(this.scrollVelocity + delta * 0.0015, 0.08);
      this.lastScrollY = currentScrollY;
    }, { passive: true });

    // Page visibility check to save CPU when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.animId) cancelAnimationFrame(this.animId);
      } else {
        this.start();
      }
    });

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  start() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smooth mouse interpolation
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;

      // Dampen scroll velocity
      this.scrollVelocity *= 0.94;
      this.phase += (this.baseSpeed + this.scrollVelocity);

      this.render();

      this.animId = requestAnimationFrame(loop);
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

    for (let r = 0; r < rows; r++) {
      const y = r * spacing;
      for (let c = 0; c < cols; c++) {
        const x = c * spacing;

        // Distance from center for radial ripple
        const dxCenter = x - centerX;
        const dyCenter = y - centerY;
        const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

        // Distance from mouse cursor for interactive hover effect
        const dxMouse = x - this.mouseX;
        const dyMouse = y - this.mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        // Primary wave harmonic
        const wave = Math.sin(distCenter * 0.016 - this.phase);

        // Mouse proximity boost
        let mouseBoost = 0;
        if (distMouse < 220) {
          mouseBoost = (1 - distMouse / 220) * 2.8;
        }

        // Calculate dynamic dot radius and opacity
        const normalizedWave = (wave + 1) * 0.5; // 0 to 1
        const radius = Math.max(0.8, 1.2 + normalizedWave * 2.2 + mouseBoost);
        const alpha = Math.min(0.85, 0.14 + normalizedWave * 0.45 + mouseBoost * 0.25);

        // Render dot
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 30, 39, ${alpha})`;
        this.ctx.fill();
      }
    }

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

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
