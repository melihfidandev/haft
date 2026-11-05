"use client";

import { useRef } from "react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { products } from "@/content/products";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Mağazaya çağrı. Dev "SHOP" bağlantısının üstünde gezinirken imlecin peşinden ürün kareleri düşer (image trail);
 * ana sayfada ürün grid'i olmasın kararının yaratıcı karşılığı: ürünler yalnızca bir an görünür.
 */
export function ShopCall() {
  const { locale, dict } = useI18n();
  const t = dict.home.shopCall;
  const root = useRef<HTMLElement>(null);
  const trail = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-call-line] > span", { yPercent: 110, y: 0 }, {
          yPercent: 0,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
      });

      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const area = root.current!.querySelector<HTMLElement>("[data-trail-area]")!;
        const images = gsap.utils.toArray<HTMLElement>("[data-trail-img]", trail.current);
        let index = 0;
        let last = { x: 0, y: 0 };

        const move = (event: PointerEvent) => {
          const dx = event.clientX - last.x;
          const dy = event.clientY - last.y;
          if (Math.hypot(dx, dy) < 90) return;
          last = { x: event.clientX, y: event.clientY };
          const img = images[index++ % images.length];
          const box = trail.current!.getBoundingClientRect();
          gsap.killTweensOf(img);
          gsap
            .timeline()
            .set(img, { x: event.clientX - box.left, y: event.clientY - box.top, xPercent: -50, yPercent: -50, zIndex: index, opacity: 1, scale: 0.6, rotate: gsap.utils.random(-8, 8) })
            .to(img, { scale: 1, duration: 0.5, ease: "back.out(1.6)" })
            .to(img, { y: "+=160", opacity: 0, duration: 0.9, ease: "power3.in" }, 0.45);
        };
        area.addEventListener("pointermove", move);
        return () => area.removeEventListener("pointermove", move);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="screen-fit relative flex flex-col justify-center overflow-hidden px-gutter pt-header pb-space-m">
      <h2 className="font-display text-display leading-[0.88] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02]">
        <span data-call-line className="mask-line block"><span className="block">{t.line1}</span></span>
        <span data-call-line className="mask-line block text-mute"><span className="block">{t.line2}</span></span>
      </h2>

      <div data-trail-area className="relative mt-space-m">
        <div ref={trail} aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-visible">
          {products.map((p) => (
            <div key={p.slug} data-trail-img className="absolute top-0 left-0 h-56 w-44 overflow-hidden bg-tile opacity-0 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]">
              {/* Trail görselleri küçük ve dekoratif; next/image optimizasyonu burada gereksiz yük. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0].src} alt="" loading="lazy" className="size-full object-cover" />
            </div>
          ))}
        </div>

        <TransitionLink
          href={`/${locale}/shop`}
          data-cursor={t.cta}
          data-text={`${t.cta} →`}
          className="font-display split relative z-0 block text-mega leading-[0.86] font-black tracking-[-0.01em] uppercase"
        >
          {t.cta} →
        </TransitionLink>
      </div>

      <p className="mt-space-s max-w-[36ch] text-lead text-mute">{t.sub}</p>
    </section>
  );
}
