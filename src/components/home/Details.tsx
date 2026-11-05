"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";

/** Kalite detayları: her rakam yukarıdan düşüp yerine "oturur", çizgi soldan çekilir. */
export function Details() {
  const { dict } = useI18n();
  const t = dict.home.details;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-details-title] > span > span", { yPercent: 110, y: 0 }, {
          yPercent: 0,
          y: 0,
          duration: 1.1,
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-details-title]", start: "top 80%" },
        });
        gsap.utils.toArray<HTMLElement>("[data-detail]").forEach((item, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 85%" }, delay: (i % 4) * 0.08 });
          tl.fromTo(item.querySelector("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "expo.out" })
            .fromTo(item.querySelector("[data-figure]"), { yPercent: -90, y: 0, opacity: 0 }, { yPercent: 0, y: 0, opacity: 1, duration: 1.1, ease: "bounce.out" }, 0.1)
            .fromTo(item.querySelectorAll("[data-copy]"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 }, 0.35);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="screen-fit flex flex-col justify-center px-gutter pt-header pb-space-m">
      <h2 data-details-title className="font-display max-w-[20ch] text-display leading-[0.88] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02]">
        {t.title.split(" ").map((word, i) => (
          <span key={i} className="mask-line inline-block pr-[0.22em] align-top">
            <span className="inline-block">{word}</span>
          </span>
        ))}
      </h2>

      <ul className="mt-space-m grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item) => (
          <li key={item.title} data-detail>
            <span data-rule aria-hidden className="block h-[3px] w-full origin-left bg-ink" />
            <p className="mt-6 flex items-baseline gap-2 overflow-hidden pt-2">
              <span data-figure className="font-figure text-h1 leading-none">{item.figure}</span>
              <span className="text-small font-semibold tracking-wide uppercase">{item.unit}</span>
            </p>
            <h3 data-copy className="mt-6 font-bold uppercase">{item.title}</h3>
            <p data-copy className="mt-2 max-w-[32ch] text-mute">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
