"use client";

import Image from "next/image";
import { useRef } from "react";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";

const IMAGES = [
  { src: "/images/cloth/white-fold.jpg", w: 1400, h: 933 },
  { src: "/images/cloth/black-hem.jpg", w: 1400, h: 933 },
  { src: "/images/cloth/collar-detail.jpg", w: 1400, h: 2099 },
  { src: "/images/cloth/black-tee-window.jpg", w: 1400, h: 933 },
  { src: "/images/cloth/black-rack.jpg", w: 1400, h: 2132 },
];

// Grenze'nin kalın büyük harfleri ortalama ~0.55em genişliğinde; panelin ~%88'ini dolduracak katsayı.
const WORD_FIT = 160;

/**
 * Kumaşın beş adımı. Her ekranda pinned yatay şerit: paneller sola akar, her görsel clip-path ile açılır,
 * dev kelime görselin tersine kayar. Azaltılmış harekette native yatay kaydırma (scroll-snap).
 */
export function ClothStrip() {
  const { dict } = useI18n();
  const t = dict.home.cloth;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const distance = () => track.scrollWidth - window.innerWidth;

        const scroll = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
          const containerAnimation = scroll;
          gsap.fromTo(
            panel.querySelector("[data-panel-media]"),
            { clipPath: "inset(18% 12% 18% 12%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: panel, containerAnimation, start: "left 95%", end: "left 35%", scrub: true } },
          );
          gsap.fromTo(
            panel.querySelector("[data-panel-img]"),
            { scale: 1.3, xPercent: -6 },
            { scale: 1, xPercent: 6, ease: "none", scrollTrigger: { trigger: panel, containerAnimation, start: "left right", end: "right left", scrub: true } },
          );
          gsap.fromTo(
            panel.querySelector("[data-panel-word]"),
            // Kelime panelin içinde kalacak kadar kayar; büyük kayma kelimeyi kenardan kesiyordu.
            { xPercent: 6 },
            { xPercent: -6, ease: "none", scrollTrigger: { trigger: panel, containerAnimation, start: "left right", end: "right left", scrub: true } },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    // Bölüm sabitlenir; yüksekliği tam bir ekran olmalı. Başlık bu yüzden şeridin ilk paneli olur.
    // Azaltılmış harekette (motion-reduce) mobil şerit parmakla kaydırılan native bir listeye döner.
    <section
      ref={root}
      className="on-night overflow-hidden bg-night text-paper motion-safe:flex motion-safe:h-svh motion-safe:items-center md:flex md:h-svh md:items-center"
      aria-labelledby="cloth-title"
    >
      <div
        className="snap-x snap-mandatory overflow-x-auto pt-header pb-space-l [scrollbar-width:none] motion-safe:snap-none motion-safe:overflow-visible motion-safe:pb-0 md:overflow-visible md:snap-none md:py-0"
        data-lenis-prevent-horizontal
      >
        <ol data-track className="flex w-max items-stretch gap-4 px-gutter md:gap-10">
          <li className="flex w-[82vw] shrink-0 snap-center flex-col justify-between gap-6 md:w-[38vw] lg:w-[32vw]">
            <h2 id="cloth-title" className="font-display text-display leading-[0.85] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02]">
              {t.title}
            </h2>
            <p className="max-w-[30ch] text-lead text-paper/70">{t.intro} →</p>
          </li>
          {t.panels.map((panel, i) => {
            const image = IMAGES[i];
            return (
              <li key={panel.word} data-panel className="relative w-[82vw] shrink-0 snap-center md:w-[58vw] lg:w-[44vw]">
                <div data-panel-media className="group/photo @container relative aspect-[4/5] max-h-[56svh] w-full overflow-hidden bg-paper/5 md:aspect-auto md:h-[64svh] md:max-h-none">
                  <Image data-panel-img src={image.src} alt="" fill sizes="(min-width: 1024px) 44vw, (min-width: 768px) 58vw, 82vw" className="object-cover" />
                  {/* Dev kelime görselin içinde; difference ile hem beyaz hem siyah karede okunur.
                      Boyut panelin genişliğinden ve kelimenin uzunluğundan türetilir: her kelime panele tam sığar. */}
                  <p
                    data-panel-word
                    aria-hidden
                    className="font-display pointer-events-none absolute bottom-[-0.12em] left-[0.04em] leading-none font-black whitespace-nowrap text-paper uppercase mix-blend-difference"
                    style={{ fontSize: `min(30cqi, ${(WORD_FIT / panel.word.length).toFixed(1)}cqi)` }}
                  >
                    {panel.word}
                  </p>
                  <PhotoCredit src={image.src} link className="top-2 bottom-auto" />
                </div>
                <div className="mt-5 flex max-w-[44ch] gap-4">
                  <h3 className="shrink-0 text-small font-semibold tracking-[0.2em] uppercase">{panel.word}</h3>
                  <p className="text-small text-paper/70 md:text-body">{panel.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
