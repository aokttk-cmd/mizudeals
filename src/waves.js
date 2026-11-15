// Layered, mouse-reactive water waves + rising bubbles on a 2D canvas.
export function initWaves(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  const layers = [
    { amp: 26, len: 0.0042, speed: 0.6, y: 0.70, color: ['rgba(94,242,225,0.10)', 'rgba(94,242,225,0.02)'] },
    { amp: 34, len: 0.0030, speed: -0.45, y: 0.77, color: ['rgba(76,201,240,0.14)', 'rgba(15,53,80,0.2)'] },
    { amp: 22, len: 0.0055, speed: 0.8, y: 0.84, color: ['rgba(94,242,225,0.18)', 'rgba(4,18,31,0.6)'] },
    { amp: 18, len: 0.0068, speed: -0.9, y: 0.91, color: ['rgba(10,34,54,0.95)', 'rgba(4,18,31,1)'] },
  ];
  let w = 0, h = 0, dpr = 1, t = 0, raf = 0, running = true;
  const mouse = { x: -9999, y: 0, tx: -9999, power: 0 };
  let bubbles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(w / 40);
    bubbles = Array.from({ length: count }, () => newBubble(true));
  }
  function newBubble(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20,
      r: 1 + Math.random() * 4,
      v: 0.2 + Math.random() * 0.7,
      wob: Math.random() * Math.PI * 2,
    };
  }

  function draw() {
    t += reduced ? 0 : 0.016;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.power *= 0.96;
    ctx.clearRect(0, 0, w, h);

    // bubbles
    for (const b of bubbles) {
      b.y -= b.v; b.wob += 0.03;
      const bx = b.x + Math.sin(b.wob) * 6;
      if (b.y < -10) Object.assign(b, newBubble(false));
      ctx.beginPath();
      ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(94,242,225,${0.15 + b.r / 20})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // waves
    for (const L of layers) {
      const base = h * L.y;
      const grad = ctx.createLinearGradient(0, base - L.amp, 0, h);
      grad.addColorStop(0, L.color[0]); grad.addColorStop(1, L.color[1]);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 10; x += 10) {
        const d = Math.abs(x - mouse.x);
        const swell = Math.exp(-(d * d) / 40000) * (14 + mouse.power * 40);
        const y = base
          + Math.sin(x * L.len + t * L.speed * 2) * L.amp
          + Math.sin(x * L.len * 2.3 - t * L.speed) * L.amp * 0.35
          - swell;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    if (running) raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const nx = e.clientX - r.left;
    mouse.power = Math.min(1, mouse.power + Math.abs(nx - mouse.tx) / 400);
    mouse.tx = nx;
  });
  new IntersectionObserver(([entry]) => {
    const vis = entry.isIntersecting;
    if (vis && !running) { running = true; raf = requestAnimationFrame(draw); }
    if (!vis) { running = false; cancelAnimationFrame(raf); }
  }).observe(canvas);

  resize();
  draw();
}
