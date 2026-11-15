# Mizu Deals 水

A water-themed coupon & deals website with motion graphics: liquid wave canvas, split-text intro, scroll-driven scenes, 3D-tilt store cards, animated coupon filtering and a code-reveal modal.

**Stack:** [Vite](https://vite.dev) · [GSAP](https://gsap.com) (ScrollTrigger, Flip) · [Lenis](https://lenis.darkroom.engineering) smooth scroll · vanilla JS/CSS.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | Page structure and sections |
| `src/style.css` | Design tokens, layout, responsive rules |
| `src/main.js` | Rendering, GSAP animations, search, filters, modal |
| `src/waves.js` | Interactive hero wave + bubble canvas |
| `src/data.js` | Sample stores, coupons, guides, FAQ (fictional — swap for a real API/CMS) |

## Deploy

Every push and pull request to `main` runs the build as a check (`.github/workflows/deploy.yml`).

Deploying to **GitHub Pages** is off by default because this repo is private (Pages on private repos needs a paid GitHub plan). To turn it on:
1. **Settings → Pages → Source** → **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → add `DEPLOY_PAGES` = `true`.

Alternatively, import the repo into Vercel or Netlify (build command `npm run build`, output `dist`) — both support private repos for free.

## Accessibility

All motion is disabled or reduced when the visitor has `prefers-reduced-motion` turned on. Search supports `/` to focus and arrow keys to navigate results.
