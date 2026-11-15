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

Pushes to `main` build and deploy to **GitHub Pages** via `.github/workflows/deploy.yml`. Pull requests run the build as a check.
In the repo, set **Settings → Pages → Source** to **GitHub Actions** once.

## Accessibility

All motion is disabled or reduced when the visitor has `prefers-reduced-motion` turned on. Search supports `/` to focus and arrow keys to navigate results.
