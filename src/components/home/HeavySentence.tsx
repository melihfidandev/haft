"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { SplitText } from "@/lib/gsap-split";

/**
 * Konseptin en net anı: ikinci cümlenin harfleri scroll'la soldan sağa wght 100 → 900 "ağırlaşır".
 * Ağırlık bir CSS değişkeniyle (--w) tutulur; GSAP onu harf harf tweenler.
 */
export function HeavySentence() {
  const { dict } = useI18n();
  const t = dict.home.sentence;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Satırlar en kalın haliyle (wght 900) bölünüp sabitlenir: ince başlayan harfler kalınlaştıkça kelimeler
        // genişleyip alt satıra düşmesin, blok aşağı itilmesin. İnce halde satırlar yalnızca biraz kısa kalır.
        const split = SplitText.create("[data-heavy]", { type: "lines,words,chars", charsClass: "heavy-char", aria: "none" });
        gsap.set(split.lines, { whiteSpace: "nowrap" });
        gsap.set(split.chars, { "--w": 100 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=140%", scrub: 0.6, pin: true },
        });
        tl.to(split.chars, { "--w": 900, duration: 0.5, stagger: { each: 0.04, ease: "power1.in" }, ease: "power2.inOut" }, 0.15)
          .fromTo(split.chars, { yPercent: -18, y: 0 }, { yPercent: 0, y: 0, duration: 0.5, stagger: { each: 0.04, ease: "power1.in" }, ease: "back.out(2)" }, 0.15)
          .to("[data-light]", { opacity: 0.3, duration: 0.4 }, 0.5);
        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="screen-fit flex items-center px-gutter pt-header pb-space-m">
      {/* Ad başlıkta: span'ler ad taşıyamaz, SplitText'in parçaları da okunmasın diye iki satır gizli. */}
      <h2
        aria-label={`${t.a} ${t.b}`}
        className="font-display w-full text-display leading-[0.9] tracking-[-0.01em] uppercase lang-tr:leading-[1.02]">
        <span data-light aria-hidden className="block font-[200]">{t.a}</span>
        <span
          data-heavy
          aria-hidden
          className="mt-[0.15em] block font-[900] [&_.heavy-char]:[font-variation-settings:'wght'_var(--w,900)]"
        >
          {t.b}
        </span>
      </h2>
    </section>
  );
}
