"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export type WeightlessLine = {
  lang: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  pageTitle: string;
};

/**
 * 404, "Ağırlıksız": markanın tersi. Harfler en ince ağırlıkta (wght 100) havada süzülür;
 * bu sitede yere düşmeyen tek şey bu sayfa. Her dil `data-only` ile işaretli; hangisinin görüneceğini
 * global-not-found adrese bakarak seçer, diğeri display:none ile erişilebilirlik ağacından da çıkar.
 */
export function Weightless({ lines }: { lines: WeightlessLine[] }) {
  const root = useRef<HTMLElement>(null);

  // Next başlığı hydration sonrası metadata'dan yeniden yazıyor; görünen dile göre burada düzeltilir.
  useEffect(() => {
    const line = lines.find((l) => l.lang === document.documentElement.lang);
    if (line) document.title = line.pageTitle;
  }, [lines]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-float]", {
          yPercent: 60,
          opacity: 0,
          duration: 1.6,
          stagger: 0.04,
          ease: "expo.out",
        });
        gsap.to("[data-float]", {
          y: (i) => (i % 2 ? -14 : 14),
          rotate: (i) => (i % 2 ? -3 : 3),
          duration: (i) => 2.4 + (i % 3) * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1,
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="flex min-h-svh flex-col justify-center gap-space-m px-gutter pt-32 pb-space-l"
    >
      <p
        className="font-figure text-display leading-none text-mute"
        aria-hidden
      >
        404
      </p>
      {lines.map((line) => {
        return (
          <div key={line.lang} lang={line.lang} data-only={line.lang}>
            <h1
              className="font-display text-[clamp(2.75rem,10.5vw,13rem)] leading-[0.85] font-[100] tracking-[-0.01em] whitespace-nowrap uppercase lang-tr:leading-[1.02]"
              aria-label={line.title}
            >
              {line.title.split("").map((char, i) => (
                <span
                  key={i}
                  data-float
                  aria-hidden
                  className="inline-block whitespace-pre"
                >
                  {char}
                </span>
              ))}
            </h1>
            <p className="mt-space-xs max-w-[36ch] text-lead text-mute">
              {line.text}
            </p>
            <Link
              href={line.href}
              className="mt-space-xs inline-block border-b-2 border-ink pb-1 font-semibold uppercase"
            >
              {line.cta} →
            </Link>
          </div>
        );
      })}
    </section>
  );
}
