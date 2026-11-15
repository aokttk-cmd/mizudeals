import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { loadContent } from './cms.js';
import { initWaves } from './waves.js';

gsap.registerPlugin(ScrollTrigger, Flip);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
// Content comes from the CMS, so escape everything placed into HTML.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const safeColor = (c) => (/^#[0-9a-fA-F]{3,8}$/.test(c || '') ? c : '#2b8cff');
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

// Filled by loadContent() during boot
let allStores = [], stores = [], coupons = [], guides = [], faqs = [], storeById = {};

/* ---------------- Render ---------------- */
function render() {
  // Marquee (two copies for a seamless loop)
  const names = stores.map((s) => `<span>${esc(s.name)}</span>`).join('');
  $('.marquee__track').innerHTML = names + names;

  $('.stores').innerHTML = stores.map((s) => `
    <a href="#coupons" class="store" id="store-${esc(s.id)}" data-cat="${esc(s.cat)}" style="--c:${safeColor(s.color)}">
      <div class="store__logo">${s.logo
        ? `<img src="${esc(s.logo)}?w=120&h=120&fit=max&auto=format" alt="" loading="lazy" />`
        : esc(initials(s.name))}</div>
      <h3>${esc(s.name)}</h3>
      <p>${s.coupons} coupon${s.coupons === 1 ? '' : 's'} · ${esc(s.cat)}</p>
      <span class="store__arrow" aria-hidden="true">→</span>
    </a>`).join('');

  const cats = ['All', ...new Set(coupons.map((c) => c.cat).filter(Boolean))];
  $('.chips').innerHTML = cats.map((c, i) =>
    `<button class="chip${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  $('.coupons').innerHTML = coupons.length ? coupons.map((c, i) => {
    const s = storeById[c.store];
    const isCode = c.type === 'code';
    return `
    <article class="coupon" data-cat="${esc(c.cat)}" data-i="${i}" style="--c:${safeColor(s.color)}">
      <div>
        <div class="coupon__store"><span class="coupon__dot"></span>${esc(s.name)}</div>
        <h3>${esc(c.title)}</h3>
        <small>Used ${Number(c.used || 0).toLocaleString()} times · Verified</small>
      </div>
      <button class="reveal-btn${isCode ? '' : ' reveal-btn--deal'}" data-i="${i}">
        ${isCode ? `<span class="reveal-btn__code">${esc(String(c.code).slice(-3))}</span>` : ''}
        <span class="reveal-btn__face">${isCode ? 'GET CODE' : 'GET DEAL'}</span>
      </button>
    </article>`;
  }).join('') : '<p class="empty-note">New deals are on the way — check back soon.</p>';

  $('.guides__track').innerHTML = guides.map((g, i) => `
    <a href="#guides" class="guide" style="--h:${safeColor(g.hue)}">
      <div class="guide__art" aria-hidden="true">${blobArt(safeColor(g.hue), i)}</div>
      <span class="guide__tag">${esc(g.tag)}</span>
      <div><h3>${esc(g.title)}</h3><time>${esc(g.date)}</time></div>
    </a>`).join('');

  $('.faq').innerHTML = faqs.map((f, i) => `
    <div class="faq__item">
      <button class="faq__q" aria-expanded="false" aria-controls="faq-${i}">${esc(f.q)}<span class="faq__icon" aria-hidden="true"></span></button>
      <div class="faq__a" id="faq-${i}" role="region"><p>${esc(f.a)}</p></div>
    </div>`).join('');

  $('.year').textContent = new Date().getFullYear();
}

// Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour
function shade(hex, amt) {
  const n = parseInt(hex.slice(1, 7).padEnd(6, '0'), 16);
  const ch = (v) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(ch);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function blobArt(color, i) {
  const seed = i % 5; // keep shapes inside the card however many guides there are
  const y = 150 + seed * 18;
  // Unique ids (prefixed) so they never collide with the logo's gradient ids
  return `<svg viewBox="0 0 380 475" preserveAspectRatio="none">
    <defs><linearGradient id="guide-grad-${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(color, 0.25)}"/><stop offset="1" stop-color="${shade(color, -0.35)}"/></linearGradient></defs>
    <path fill="url(#guide-grad-${i})" d="M0,${y} C90,${y - 70} 180,${y + 60} 380,${y - 30} L380,475 L0,475Z" style="transform-origin:50% 100%"/>
    <circle cx="${280 - seed * 30}" cy="${80 + seed * 12}" r="${36 + seed * 6}" fill="${color}" opacity=".85"/>
  </svg>`;
}

/* ---------------- Text splitting ---------------- */
function splitChars(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = ch === ' ' ? ' ' : ch;
          frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else walk(n);
    });
  };
  walk(el);
  return $$('.char', el);
}
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'word';
          const inner = document.createElement('span'); inner.textContent = part;
          w.appendChild(inner); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else walk(n);
    });
  };
  walk(el);
  return $$('.word > span', el);
}

/* ---------------- Smooth scroll ---------------- */
let lenis;
function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -20 });
    closeMenu();
  }));
}

/* ---------------- Intro ---------------- */
function intro() {
  const chars = $$('.hero__title .split').flatMap(splitChars);
  const tl = gsap.timeline({ onComplete: () => document.body.classList.remove('is-loading') });
  if (reduced) { gsap.set('.loader', { display: 'none' }); return tl; }
  tl.from('.loader__drop', { y: -innerHeight / 2, duration: 0.6, ease: 'power2.in' })
    // The falling blue drop splashes into deep night water, so the logo's blue + rainbow pop
    .to('.loader__drop', { scale: 160, backgroundColor: '#0b1a52', duration: 0.9, ease: 'expo.inOut' })
    .add(() => $('.loader').classList.add('is-night'))
    .to('.loader__drop', { opacity: 0, duration: 0.4 })
    .to('.loader__mark', { opacity: 1, duration: 0.2 }, '-=0.2')
    .from('.loader__glow', { scale: 0.3, opacity: 0, duration: 1, ease: 'expo.out' }, '<')
    .from('.loader__mark .mark-drop', { scale: 0, svgOrigin: '110 110', duration: 0.6, ease: 'back.out(2)' }, '<')
    .from('.loader__mark .wing-l', { rotate: 70, scale: 0.2, opacity: 0, svgOrigin: '100 110', duration: 0.8, ease: 'expo.out' }, '-=0.35')
    .from('.loader__mark .wing-r', { rotate: -70, scale: 0.2, opacity: 0, svgOrigin: '120 110', duration: 0.8, ease: 'expo.out' }, '<')
    .to('.loader', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.25')
    .from(chars, { yPercent: 110, rotate: 8, duration: 1, stagger: 0.035, ease: 'expo.out' }, '-=0.45')
    .from('.hero .reveal-up', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=0.8')
    .from('.ticket, .bubble', { scale: 0, rotate: -40, duration: 1, stagger: 0.08, ease: 'back.out(2)' }, '-=0.9')
    .from('.nav', { y: -100, duration: 0.8, ease: 'expo.out' }, '-=0.9')
    .set('.loader', { display: 'none' })
    // Gentle idle wing-flap on the nav logo
    .add(() => {
      gsap.to('.logo .wing-l', { rotate: 6, svgOrigin: '100 110', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.logo .wing-r', { rotate: -6, svgOrigin: '120 110', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
  return tl;
}

/* ---------------- Interactions ---------------- */
function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) return;
  const c = $('.cursor');
  const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { c.classList.add('is-active'); xTo(e.clientX); yTo(e.clientY); });
  document.documentElement.addEventListener('pointerleave', () => c.classList.remove('is-active'));
  document.addEventListener('pointerover', (e) => {
    c.classList.toggle('is-hover', !!e.target.closest('a, button, .store, input'));
  });
}

function initMagnetic() {
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4 });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
  });
}

function initNav() {
  const nav = $('.nav');
  let last = 0;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-hidden', y > last && y > 300 && !nav.classList.contains('is-open'));
      last = y;
    },
  });
  $('.nav__burger').addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    $('.nav__burger').setAttribute('aria-expanded', open);
  });
}
function closeMenu() {
  $('.nav').classList.remove('is-open');
  $('.nav__burger').setAttribute('aria-expanded', 'false');
}

function initFloaters() {
  if (reduced) return;
  const els = $$('.floaters [data-depth]');
  addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    els.forEach((el) => {
      const d = +el.dataset.depth;
      gsap.to(el, { x: nx * 60 * d, y: ny * 60 * d, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    });
  });
  els.forEach((el, i) => gsap.to(el, { yPercent: -10 - i * 6, duration: 2.4 + i * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  gsap.to('.floaters', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__inner', { yPercent: 25, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

function initMarquee() {
  const track = $('.marquee__track');
  const loop = gsap.to(track, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
  if (reduced) { loop.pause(); return; }
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity() / 300;
      gsap.to(loop, { timeScale: self.direction * Math.max(1, Math.abs(v)), duration: 0.3, overwrite: true });
      gsap.to(loop, { timeScale: self.direction, duration: 1, delay: 0.3, overwrite: false });
    },
  });
}

function initStores() {
  $$('.store').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      if (!reduced) gsap.to(card, { rotateY: (px - 0.5) * 16, rotateX: (0.5 - py) * 16, duration: 0.5, ease: 'power2.out' });
    });
    card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
    card.addEventListener('click', (e) => {
      // Jump to the store's category in the coupons filter
      const chip = $(`.chip[data-cat="${card.dataset.cat}"]`);
      if (chip) chip.click();
    });
  });
  if (reduced) return;
  gsap.from('.store', {
    y: 80, opacity: 0, rotateX: -25, duration: 1, ease: 'expo.out',
    stagger: { each: 0.06, grid: 'auto', from: 'start' },
    scrollTrigger: { trigger: '.stores', start: 'top 85%' },
  });
}

function initCoupons() {
  const chips = $$('.chip');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-selected', c === chip); });
    const cat = chip.dataset.cat;
    const state = Flip.getState('.coupon');
    $$('.coupon').forEach((c) => c.classList.toggle('is-hidden', cat !== 'All' && c.dataset.cat !== cat));
    Flip.from(state, {
      duration: reduced ? 0 : 0.6, ease: 'expo.out', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.3 }),
    });
  }));

  $('.coupons').addEventListener('click', (e) => {
    const btn = e.target.closest('.reveal-btn');
    if (!btn) return;
    const c = coupons[+btn.dataset.i];
    const s = storeById[c.store];
    if (c.type === 'code') { openModal(c); return; }
    splash(e.clientX, e.clientY, safeColor(s.color));
    const link = safeUrl(c.url) || safeUrl(s.website);
    if (link) { window.open(link, '_blank', 'noopener'); toast(`Opening ${s.name} — deal applied ✦`); }
    else toast(`Deal activated at ${s.name} ✦`);
  });

  if (reduced) return;
  ScrollTrigger.batch('.coupon', {
    start: 'top 90%',
    onEnter: (els) => gsap.from(els, { y: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }),
    once: true,
  });
}

/* ---------------- Modal / toast / splash ---------------- */
const modal = $('.modal');
let lastFocus;
function openModal(c) {
  const s = storeById[c.store];
  lastFocus = document.activeElement;
  $('.modal__logo').textContent = initials(s.name);
  $('.modal__logo').style.background = safeColor(s.color);
  $('#modal-title').textContent = `${s.name}: ${c.title}`;
  $('.modal__code span').textContent = c.code;
  const shop = $('.modal__shop'), link = safeUrl(c.url) || safeUrl(s.website);
  shop.hidden = !link;
  if (link) { shop.href = link; shop.textContent = `Shop at ${s.name} →`; }
  modal.hidden = false;
  lenis?.stop();
  gsap.fromTo('.modal__backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
  gsap.fromTo('.modal__card', { y: 60, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.6)' });
  $('.modal__code .btn').focus();
}
function closeModal() {
  gsap.to('.modal__card', { y: 40, opacity: 0, duration: 0.25 });
  gsap.to('.modal__backdrop', { opacity: 0, duration: 0.25, onComplete: () => { modal.hidden = true; lenis?.start(); lastFocus?.focus(); } });
}
$$('[data-close]', modal).forEach((el) => el.addEventListener('click', closeModal));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
$('.modal__code .btn').addEventListener('click', async (e) => {
  const code = $('.modal__code span').textContent;
  try { await navigator.clipboard.writeText(code); } catch { /* clipboard blocked — still show feedback */ }
  splash(e.clientX, e.clientY, '#ffc414');
  toast(`Copied “${code}” — paste it at checkout`);
});

let toastTimer;
function toast(msg) {
  const t = $('.toast');
  t.textContent = msg;
  t.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-show'), 2600);
}
function splash(x, y, color) {
  if (reduced) return;
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('div');
    d.className = 'splash';
    d.style.cssText = `left:${x}px;top:${y}px;background:${i % 3 ? color : '#fff'}`;
    document.body.appendChild(d);
    const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 90;
    gsap.fromTo(d, { scale: 0.5 + Math.random() }, {
      x: Math.cos(a) * r, y: Math.sin(a) * r - 40, scale: 0, duration: 0.9 + Math.random() * 0.5,
      ease: 'power3.out', onComplete: () => d.remove(),
    });
  }
}

/* ---------------- Search ---------------- */
function initSearch() {
  const input = $('.search input');
  const list = $('.search__results');
  const show = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { list.classList.remove('is-open'); return; }
    const hits = stores.filter((s) => s.name.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q)).slice(0, 6);
    list.innerHTML = hits.length
      ? hits.map((s) => `<li><a href="#store-${esc(s.id)}" data-id="${esc(s.id)}"><span class="coupon__dot" style="--c:${safeColor(s.color)}"></span><b>${esc(s.name)}</b><small>${s.coupons} coupon${s.coupons === 1 ? '' : 's'}</small></a></li>`).join('')
      : `<li class="empty">No stores match “${esc(input.value)}” yet.</li>`;
    list.classList.add('is-open');
    gsap.from($$('li', list), { y: 10, opacity: 0, stagger: 0.03, duration: 0.3 });
  };
  input.addEventListener('input', show);
  input.addEventListener('focus', show);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); $('a', list)?.focus(); }
    if (e.key === 'Enter') { e.preventDefault(); $('a', list)?.click(); }
  });
  list.addEventListener('keydown', (e) => {
    const links = $$('a', list), i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(i + 1, links.length - 1)]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? input : links[i - 1]).focus(); }
  });
  list.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    list.classList.remove('is-open');
    const card = $(`#store-${a.dataset.id}`);
    lenis ? lenis.scrollTo(card, { offset: -120 }) : card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    gsap.fromTo(card, { boxShadow: '0 0 0 0 rgba(46,197,245,.9)' }, { boxShadow: '0 0 0 18px rgba(46,197,245,0)', duration: 1.2, delay: 0.8, repeat: 1 });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search')) list.classList.remove('is-open'); });
  addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault(); input.focus();
    }
  });
}

/* ---------------- Scroll scenes ---------------- */
function initScenes() {
  // Headline word reveals
  $$('.title-reveal').forEach((h) => {
    const words = splitWords(h);
    if (reduced) return;
    gsap.from(words, { yPercent: 110, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  $$('.section .reveal-up').forEach((el) => {
    if (reduced) return;
    gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // Horizontal guides on wide screens
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const pin = $('.guides__pin');
    const dist = () => pin.scrollWidth - innerWidth;
    const tween = gsap.to(pin, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.guides', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
    });
    // One staggered entrance for all cards as the section arrives, played once. Per-card triggers
    // tied to the horizontal tween left cards hidden on wide screens (some start already in view).
    gsap.from('.guide', {
      rotate: 6, y: 80, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.guides', start: 'top 75%', once: true },
    });
  });

  // Counters
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, dec = +(el.dataset.decimals || 0);
    const fmt = (v) => `${el.dataset.prefix || ''}${v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}${el.dataset.suffix || ''}`;
    if (reduced) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // How-it-works: draw the path and float the steps in
  const path = $('.how__path path');
  if (path && !reduced) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.8 });
    gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.how', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    gsap.from('.step', { y: 100, opacity: 0, stagger: 0.15, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.how', start: 'top 80%' } });
    gsap.from('.step__num', { scale: 0, rotate: -180, stagger: 0.15, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.how', start: 'top 75%' } });
  }

  // Footer
  if (!reduced) {
    gsap.from('.footer__big', { y: 120, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
    gsap.to('.footer__wave path', {
      attr: { d: 'M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z' },
      duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true,
    });
  }
}

function initFaq() {
  $$('.faq__item').forEach((item) => {
    const q = $('.faq__q', item), a = $('.faq__a', item);
    q.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', open);
      gsap.to(a, { height: open ? 'auto' : 0, duration: reduced ? 0 : 0.5, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
    });
  });
}

$('.newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: connect to a newsletter provider (e.g. Buttondown, Mailchimp) — no data is sent yet.
  e.target.reset();
  toast('You’re in — fresh deals every Friday ✦');
});

/* ---------------- Boot ---------------- */
document.body.classList.add('is-loading');
const content = await loadContent(); // Sanity, or sample data as a fallback (loader screen covers the wait)
allStores = content.stores;
storeById = Object.fromEntries(allStores.map((s) => [s.id, s]));
stores = allStores.filter((s) => s.featured);
({ coupons, guides, faqs } = content);
document.documentElement.dataset.content = content.source;
// Add ?debug to the URL to see where content came from (handy for troubleshooting)
if (new URLSearchParams(location.search).has('debug')) {
  const b = document.createElement('div');
  b.className = 'debug-badge';
  b.textContent = [
    `Content source: ${content.source}`,
    content.cachedAt ? `Saved copy from: ${new Date(content.cachedAt).toLocaleString()}` : '',
    `Coupons: ${content.coupons.length} · Stores: ${content.stores.length}`,
    ...(content.errors || []).map((e) => `Error: ${e}`),
  ].filter(Boolean).join('\n');
  document.body.appendChild(b);
}
render();
initScroll();
initWaves($('.hero__waves'), { reduced });
initCursor();
initMagnetic();
initNav();
initFloaters();
initMarquee();
initStores();
initCoupons();
initSearch();
initFaq();
initScenes();
intro();
addEventListener('load', () => ScrollTrigger.refresh());
