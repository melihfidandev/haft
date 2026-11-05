<div align="center">

<img src="src/app/icon.svg" width="72" alt="HAFT logo" />

# HAFT.

**A motion-driven, fully working e-commerce store for a fictional heavyweight basics label.**

_Heavy by design._

**[🔗 Live Demo](https://melihfidan-haft.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js_16-0b0b0b?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-0b0b0b?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-0b0b0b?style=flat-square&logo=typescript&logoColor=3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-0b0b0b?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![GSAP](https://img.shields.io/badge/GSAP-0b0b0b?style=flat-square&logo=greensock&logoColor=88CE02)

</div>

<!-- Add a screenshot or GIF of the site here, e.g.:
<p align="center"><img src="docs/preview.gif" alt="HAFT preview" width="100%" /></p>
-->

---

## About

**HAFT** is a concept store for an imaginary label that makes oversized tees, crewnecks and a cap, in black and white only. The brand, its products and its prices are all made up.

I built it as a **portfolio piece** to show that I can build a real shop end to end, not just a landing page. It has product listing with filters, product pages, a persistent bag, a checkout with validation and an order confirmation. No real payment is taken and nothing ships.

The whole site is built on one idea: **weight = quality.** In premium basics, quality is measured in fabric weight. An ordinary tee is 140–160 g/m², a HAFT tee is 320 g/m², a crewneck 480 g/m². So the type gains weight as you scroll, the gram values are the heroes, the bag works like a scale (`2 items · 0.84 kg`) and every movement has mass. Things fall and settle into place; nothing floats.

## Features

- **Preloader:** the logo stretches into place with a red/blue channel split, and a counter weighs in from 0 → 320 g.
- **A sentence that gets heavier:** _"Most t-shirts weigh 150 grams. Ours weigh 320."_ thickens letter by letter from `wght 100` to `900` as you scroll (Grenze variable font).
- **Pinned weighing scale:** two pans, 150 g against 320 g. The heavier one sinks as you scroll.
- **Horizontal fabric strip:** a pinned section that turns vertical scroll into a walk through cotton, knit, brush, wash and finish.
- **Page curtain and shared-element flights:** a dark curtain falls between pages; from the shop, the product image flies into its place on the product page.
- **Shop filters with GSAP Flip:** cards rearrange when you filter by colour or category, and the ones that leave fall away.
- **Add to bag:** a copy of the product image drops into the header bag, which squashes like a scale and counts the new weight.
- **Working bag:** survives reloads, syncs across tabs, merges identical items and shows a free-shipping progress bar. Prices are always derived from the catalogue, never stored.
- **Checkout:** custom validation with accessible error messages. It scrolls to the first invalid field and never asks for card data.
- **Order confirmation:** every order gets its own URL (`/order/HAFT-4821`). Orders live only in the tab that placed them, and the page says so honestly when an order is not on this device.
- **Image viewer:** tap a product photo to open it full screen, then swipe, pinch to zoom or double-tap.
- **Bilingual:** English and Turkish (`/en`, `/tr`) without an i18n library. The language is detected from the browser and remembered in a cookie.
- **Reduced motion means less motion, not none:** every animation has a calmer version, and content never depends on JavaScript to be visible.
- **Mobile first:** tested from 320 px to 1920 px, including iOS Safari's toolbars (`svh`/`lvh`/`dvh`, safe areas).

## Tech Stack

| Area          | Tools                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router, Turbopack, Cache Components)                         |
| Language      | [TypeScript](https://www.typescriptlang.org) (strict)                                              |
| UI            | [React 19](https://react.dev)                                                                       |
| Styling       | [Tailwind CSS 4](https://tailwindcss.com)                                                           |
| Animation     | [GSAP](https://gsap.com): ScrollTrigger, SplitText, Flip                                            |
| React + GSAP  | [`@gsap/react`](https://gsap.com/resources/React) (`useGSAP`)                                      |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering)                                                         |
| State         | React context + an external store (`useSyncExternalStore`) persisted to `localStorage`             |
| Typography    | Badeen Display, Grenze, Geist & Geostar Fill via `next/font`                                        |
| Testing       | [Vitest](https://vitest.dev) (bag logic, prices, weights)                                          |
| Linting       | ESLint 9, Prettier                                                                                  |

## Getting Started

**Requirements:** Node.js 20.9+

```bash
# clone the repo
git clone https://github.com/melihfidandev/haft.git
cd haft

# install dependencies
npm install

# start the dev server
npm run dev
```

To test on a phone on the same Wi-Fi network, run `npm run dev -- -H 0.0.0.0`, add your computer's IP to `.env.local` as `DEV_ORIGINS=192.168.x.x` and open `http://<that-ip>:3000`.

### Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the local dev server    |
| `npm run build`     | Build for production          |
| `npm start`         | Serve the production build    |
| `npm test`          | Run the unit tests            |
| `npm run lint`      | Run ESLint                    |
| `npm run typecheck` | Run the TypeScript compiler   |

## Project Structure

```
haft/
├── public/
│   ├── images/            # hero, products, fabric & editorial photos
│   └── video/             # footer logo loop
└── src/
    ├── proxy.ts           # locale redirects + 404 rewrite
    ├── app/
    │   ├── [lang]/        # home, shop, product, bag, checkout, order
    │   ├── global-not-found.tsx
    │   ├── fonts.ts
    │   └── globals.css    # Tailwind theme (colours, type scale, utilities)
    ├── components/
    │   ├── layout/        # header, footer, bag drawer, preloader, page transition, cursor
    │   ├── home/          # hero, heavy sentence, scale, fabric strip, details, black/white
    │   ├── shop/          # grid, product card, gallery, buy panel
    │   ├── checkout/      # bag view, checkout form, order confirmation
    │   └── ui/            # logo, links, price, weight, qty stepper
    ├── bag/               # bag reducer, store & tests
    ├── content/           # product catalogue & photo credits
    ├── i18n/              # locale config + EN/TR dictionaries
    └── lib/               # GSAP setup, formatting, order storage
```

## Disclaimer

HAFT is **not a real brand** and this is **not a real store**. All products, prices, stock levels and orders are fictional and exist only for demonstration. No payment is ever taken.

Product and fabric photographs come from [Unsplash](https://unsplash.com) and [Pexels](https://www.pexels.com) and are used under their free licences. Each author is credited on the photo itself, and the full list is in [`src/content/photo-credits.ts`](src/content/photo-credits.ts). The hero image, the two editorial images and the logo film were made for this project. Fonts are from [Google Fonts](https://fonts.google.com).

If you own any of these images and would like them credited differently or removed, please open an issue and I'll take care of it.

## License

© 2026 Melih Fidan. All rights reserved.

This repository is shared for viewing and portfolio purposes. Please don't copy or reuse the code or design without permission.
