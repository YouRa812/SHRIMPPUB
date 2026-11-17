/**
 * AtmosphereCanvas.js
 * Mature, cinematic, atmospheric background for ShrimpPub:
 * - Slow-rolling volumetric dark crimson fog / smoke clouds drifting in 60fps
 * - Warm ambient spotlight caustics reflecting in the haze
 * - Rare glowing micro-embers floating slowly in dark space
 * - NO cartoon bubbles or playful circles: 100% neo-noir, brutalist, premium craft aesthetic
 */
export class AtmosphereCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animId = null;

    // Fog smoke nodes
    this.smokePuffs = [];
    // Burning micro-embers
    this.embers = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Initialize 14 large, slow-moving volumetric smoke puffs
    const smokeCount = 12;
    for (let i = 0; i < smokeCount; i++) {
      this.smokePuffs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 350 + Math.random() * 450,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.003 + Math.random() * 0.004,
        colorType: i % 3 // 0 = deep wine, 1 = dark crimson, 2 = dark blood ruby
      });
    }

    // Initialize 24 tiny burning micro-embers (like dust motes or malt embers)
    for (let i = 0; i < 24; i++) {
      this.embers.push(this.createEmber(true));
    }

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createEmber(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10 + Math.random() * 50,
      size: 0.8 + Math.random() * 1.6,
      speedY: 0.3 + Math.random() * 0.7,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0.2 + Math.random() * 0.6,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.03 + Math.random() * 0.04,
      hue: Math.random() > 0.5 ? '255, 60, 40' : '230, 30, 50'
    };
  }

  start() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Volumetric Dark Crimson Fog / Smoke
      this.drawVolumetricSmoke(dt);

      // 2. Draw Subtle Micro-Embers
      this.drawEmbers(dt);

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  drawVolumetricSmoke(dt) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < this.smokePuffs.length; i++) {
      const puff = this.smokePuffs[i];

      puff.x += puff.vx * 60 * dt;
      puff.y += puff.vy * 60 * dt;
      puff.phase += puff.phaseSpeed;

      // Wrap around screen boundaries smoothly
      if (puff.y < -puff.radius) puff.y = this.height + puff.radius;
      if (puff.y > this.height + puff.radius) puff.y = -puff.radius;
      if (puff.x < -puff.radius) puff.x = this.width + puff.radius;
      if (puff.x > this.width + puff.radius) puff.x = -puff.radius;

      const dynamicRadius = puff.radius * (1 + Math.sin(puff.phase) * 0.15);
      const alpha = 0.06 + Math.sin(puff.phase * 0.8) * 0.03;

      let r = 180, g = 15, b = 25;
      if (puff.colorType === 1) {
        r = 130; g = 5; b = 15;
      } else if (puff.colorType === 2) {
        r = 210; g = 25; b = 35;
      }

      const grad = this.ctx.createRadialGradient(
        puff.x, puff.y, 0,
        puff.x, puff.y, dynamicRadius
      );
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(puff.x, puff.y, dynamicRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawEmbers(dt) {
    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];

      e.y -= e.speedY * 60 * dt;
      e.x += e.speedX * 60 * dt;
      e.pulse += e.pulseSpeed;

      const currentOpacity = e.opacity * (0.6 + Math.sin(e.pulse) * 0.4);

      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${e.hue}, ${currentOpacity})`;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = `rgba(${e.hue}, 0.8)`;
      this.ctx.fill();

      // Reset when floating off top
      if (e.y < -10) {
        this.embers[i] = this.createEmber(false);
      }
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
