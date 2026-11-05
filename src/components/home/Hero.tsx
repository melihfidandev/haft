"use client";

import Image from "next/image";
import { useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";

export function Hero() {
  const { dict } = useI18n();
  const t = dict.home.hero;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Başlangıç ve bitiş açıkça (y: 0 dahil): rota önbellekten geri gelince öğede kalan px kaymasını sıfırlar.
        gsap.set("[data-hero-line]", { yPercent: 110, y: 0 });
        gsap.set("[data-hero-image]", { scale: 1.25 });
        gsap.set("[data-hero-meta]", { yPercent: 120, y: 0 });

        const cleanup = onIntroDone(() => {
          gsap
            .timeline()
            .to("[data-hero-image]", { scale: 1.06, duration: 2.2, ease: "expo.out" }, 0)
            .to("[data-hero-line]", { yPercent: 0, y: 0, duration: 1.3, stagger: 0.12, ease: "expo.out" }, 0.15)
            .to("[data-hero-meta]", { yPercent: 0, y: 0, duration: 1, stagger: 0.08 }, 0.6);
        });

        // Scroll'da iki satır zıt yönlere "yırtılır" (görseldeki hareket bulanıklığının devamı), görsel ağırca iner.
        const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-image]", { yPercent: 18, ease: "none", scrollTrigger: scroll });
        gsap.to("[data-hero-row='1']", { xPercent: -12, ease: "none", scrollTrigger: scroll });
        gsap.to("[data-hero-row='2']", { xPercent: 9, ease: "none", scrollTrigger: scroll });
        gsap.to("[data-hero-shade]", { opacity: 0.85, ease: "none", scrollTrigger: scroll });
        return cleanup;
      });

      mm.add("(prefers-reduced-motion: reduce)", () =>
        onIntroDone(() => gsap.from("[data-hero-fade]", { opacity: 0, duration: 0.5, stagger: 0.05 })),
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="on-night relative h-lvh min-h-[34rem] overflow-hidden bg-night text-paper">
      <div className="absolute inset-0" data-hero-fade>
        {/* Dikey ekranda kare yüksekliğe sığar, yalnızca yatay kırpılır: yüz (görselin ~%49'u) ortaya alınır.
            Yüz karenin tepesinde; ölçek animasyonu üstten büyütür ki yüz yukarı kaçıp header'ın altına girmesin. */}
        <div data-hero-image className="absolute inset-0 will-change-transform portrait:origin-top">
          <Image
            src="/images/hero/hero-motion.jpg"
            alt={t.alt}
            fill
            preload
            quality={90}
            sizes="100vw"
            className="object-cover object-[50%_30%] landscape:object-[62%_30%]"
          />
        </div>
        {/* Alt kısımda metin okunurluğu için koyulaşma; scroll'la tüm kare kararır. */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent" aria-hidden />
        {/* Üstte header'ın difference karışımı orta tonlarda griye düşmesin diye hafif koyulaşma. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" aria-hidden />
        <div data-hero-shade className="absolute inset-0 bg-night opacity-0" aria-hidden />
      </div>

      {/* Hero tam ekran (lvh); alt boşluk tarayıcı çubuğunun boyu kadar (lvh − svh) artar, yazı çubuğun altında kalmaz. */}
      <div className="relative flex h-full flex-col justify-end px-gutter pb-[max(calc(100lvh-100svh+1.5rem),env(safe-area-inset-bottom))]">
        <h1 className="font-display text-[18vw] leading-[0.86] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02] sm:text-[clamp(3rem,min(13vw,26svh),20rem)] sm:whitespace-nowrap">
          <span className="mask-line block pb-[0.04em]" data-hero-row="1" data-hero-fade>
            <span data-hero-line className="block">{t.line1}</span>
          </span>
          <span className="mask-line block pb-[0.06em] sm:pl-[0.6em]" data-hero-row="2" data-hero-fade>
            <span data-hero-line className="block">{t.line2}</span>
          </span>
        </h1>

        <div className="mt-space-s grid grid-cols-2 items-end gap-4 border-t border-paper/25 pt-4 md:grid-cols-12">
          <div className="overflow-hidden md:col-span-5">
            <p data-hero-meta data-hero-fade className="max-w-[32ch] text-small text-paper/75 md:text-body">
              {t.sub}
            </p>
          </div>
          <div className="overflow-hidden justify-self-end md:col-span-7">
            <p data-hero-meta data-hero-fade className="flex items-baseline gap-2">
              <span className="font-figure text-h1 leading-none">320</span>
              <span className="text-small font-semibold">{dict.units.gsm}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
