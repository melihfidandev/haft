"use client";

import Image from "next/image";
import { useRef } from "react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Markanın iki rengi, iki kare: ekran tam ortadan ikiye bölünür, her yarı mağazayı kendi rengiyle açar.
 * Yarılar sabit genişlikte kalır; hareket karelerin açılışında ve zıt yönlü parallax'ta.
 */
export function TwoTone() {
  const { locale, dict } = useI18n();
  const t = dict.home.twoTone;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const enter = { trigger: root.current, start: "top 70%" };

        // Kareler ortadaki ek yerinden dışa doğru açılır.
        gsap.fromTo(
          "[data-tt-media='black']",
          { clipPath: "inset(0% 0% 0% 100%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: enter },
        );
        gsap.fromTo(
          "[data-tt-media='white']",
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: enter },
        );
        // fromTo: bitiş değeri açıkça 1; from() bitişi o anki stilden okur ve geliştirmede çift çalışan effect onu 1.3 bırakabiliyor.
        gsap.fromTo("[data-tt-img]", { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out", scrollTrigger: enter });
        gsap.fromTo(
          "[data-tt-label]",
          { yPercent: 110, y: 0 },
          { yPercent: 0, y: 0, duration: 1.1, stagger: 0.12, ease: "expo.out", delay: 0.8, scrollTrigger: enter },
        );
        gsap.fromTo("[data-tt-meta]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, delay: 1, scrollTrigger: enter });

        // İki kare scroll'da zıt yönlere kayar: iki ayrı an, aynı ağırlık.
        const scroll = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo("[data-tt-img='black']", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: scroll });
        // Gün batımı karesinde yüz karenin tepesinde: bu yüzden yalnızca yukarı kayar, üstten kesilmez.
        gsap.fromTo("[data-tt-img='white']", { yPercent: 0 }, { yPercent: -10, ease: "none", scrollTrigger: scroll });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from("[data-tt-media]", { opacity: 0, duration: 0.6, scrollTrigger: { trigger: root.current, start: "top 70%" } });
      });
    },
    { scope: root },
  );

  const half = (color: "black" | "white") => {
    const black = color === "black";
    const label = black ? t.shopBlack : t.shopWhite;
    return (
      <TransitionLink
        href={`/${locale}/shop?color=${color}`}
        data-cursor={label}
        className="group/half relative block h-[80svh] bg-night md:h-auto md:w-1/2"
      >
        <div data-tt-media={color} className="absolute inset-0 overflow-hidden bg-night">
          <div data-tt-img={color} className={`absolute inset-x-0 ${black ? "-inset-y-[8%]" : "top-0 -bottom-[16%]"}`}>
            <Image
              src={black ? "/images/editorial/night-hoodie.jpg" : "/images/editorial/sunset-sweat.jpg"}
              alt={black ? t.altNight : t.altDay}
              fill
              quality={90}
              sizes="(min-width: 768px) 50vw, 100vw"
              className={`object-cover transition-transform duration-1200 ease-heavy group-hover/half:scale-[1.04] ${
                black ? "object-[50%_45%]" : "object-[58%_0%]"
              }`}
            />
          </div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/60 to-transparent" />
          {/* Üstte header'ın difference karışımı açık karede griye düşmesin diye. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/40 to-transparent" />
          {/* Sağdaki pay, hover'da kayan okun maskede kesilmemesi için. */}
          <p className="mask-line absolute bottom-5 left-gutter pr-6 text-body font-semibold tracking-wide text-paper uppercase md:bottom-8 md:text-lead">
            <span data-tt-label className="flex items-center gap-3">
              {label}
              <span aria-hidden className="transition-transform duration-500 ease-heavy group-hover/half:translate-x-2">
                →
              </span>
            </span>
          </p>
        </div>
      </TransitionLink>
    );
  };

  return (
    <section ref={root} aria-label={t.sub} className="screen-fit relative flex flex-col overflow-hidden md:flex-row">
      {half("black")}
      {half("white")}

      <p data-tt-meta className="absolute top-header left-gutter z-10 max-w-[24ch] text-small text-paper md:text-body">
        {t.sub}
      </p>
    </section>
  );
}
