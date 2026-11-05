"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";

const ORDINARY = 150;
const OURS = 320;

/**
 * Tartı: iki kefe, kiriş ortadan döner. Scroll ilerledikçe 320 tarafı ağır basar, sayaçlar Geostar ile döner.
 * Kirişin açısı ağırlık oranından türetilir, sihirli bir açı değil.
 */
export function Scale() {
  const { dict } = useI18n();
  const t = dict.home.scale;
  const root = useRef<HTMLElement>(null);
  const tilt = Math.round(((OURS - ORDINARY) / OURS) * 14);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
      const setCount = (progress: number) =>
        counters.forEach((el) => (el.textContent = String(Math.round(Number(el.dataset.count) * progress))));

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const values = { p: 0 };
        setCount(0);
        // Başlık bölüm gelirken bir kez düşüp oturur; sabitlenince yerinden oynamaz, scroll yalnızca tartıyı çalıştırır.
        gsap.fromTo("[data-scale-title] > span > span", { yPercent: 110, y: 0 }, {
          yPercent: 0,
          y: 0,
          duration: 1.1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=160%", scrub: 0.8, pin: true } })
          .to(values, { p: 1, duration: 0.5, ease: "power1.inOut", onUpdate: () => setCount(values.p) }, 0.15)
          .fromTo("[data-beam]", { rotate: 0 }, { rotate: tilt, duration: 0.6, ease: "back.out(1.6)" }, 0.25)
          .fromTo("[data-pan='left']", { y: 0 }, { y: () => -panTravel(), duration: 0.6, ease: "back.out(1.6)" }, 0.25)
          .fromTo("[data-pan='right']", { y: 0 }, { y: () => panTravel(), duration: 0.6, ease: "back.out(1.6)" }, 0.25)
          .fromTo("[data-scale-caption]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.7);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        setCount(1);
        gsap.set("[data-beam]", { rotate: tilt });
        gsap.set("[data-pan='left']", { y: -panTravel() });
        gsap.set("[data-pan='right']", { y: panTravel() });
      });

      // Kefelerin dikey yolu kirişin dönüşüyle uyumlu: kefe merkezinin pivota uzaklığı × sin(açı).
      // Kefe genişliği %38, merkezi uçtan %19 içeride → pivota uzaklık kirişin %31'i.
      function panTravel() {
        const beam = root.current!.querySelector<HTMLElement>("[data-beam]")!;
        return beam.offsetWidth * 0.31 * Math.sin((tilt * Math.PI) / 180);
      }
    },
    { scope: root },
  );

  const pan = (side: "left" | "right", value: number, label: string, strong: boolean) => (
    // GSAP, Tailwind v4'ün `translate` özelliğini kendi transform'una katıp sıfırlıyor; konum bu yüzden bottom-full ile.
    <div data-pan={side} className={`absolute bottom-full flex w-[38%] flex-col items-center ${side === "left" ? "left-0" : "right-0"}`}>
      <p className="mb-3 text-center text-small font-semibold tracking-wide uppercase text-mute">{label}</p>
      <p className="flex items-baseline gap-1">
        <span data-count={value} className={`font-figure leading-none tabular-nums ${strong ? "text-display" : "text-h1 text-mute"}`}>
          {value}
        </span>
        <span className="text-small font-semibold">g</span>
      </p>
      {/* Kefe: ağırlığı taşıyan tabak, kirişe ince bir çubukla oturur. */}
      <span aria-hidden className={`mt-3 h-3 w-full rounded-b-full ${strong ? "bg-ink" : "border border-t-0 border-ink"}`} />
      <span aria-hidden className="h-8 w-[3px] bg-ink" />
    </div>
  );

  return (
    // Tek ekran, her şey ortada: başlık üstte sabit durur, yalnızca kiriş ve kefeler hareket eder.
    <section
      ref={root}
      className="screen-fit flex flex-col items-center justify-center gap-space-s overflow-hidden px-gutter pt-header pb-space-m text-center"
    >
      <h2 data-scale-title className="font-display max-w-[28ch] text-h1 leading-[0.92] font-black uppercase lang-tr:leading-[1.02]">
        {t.title.split(" ").map((word, i) => (
          <span key={i} className="mask-line inline-block px-[0.12em] align-top">
            <span className="inline-block">{word}</span>
          </span>
        ))}
      </h2>

      {/* Üst boşluk kefelerin yüksekliği + inip kalkma payı: kefeler kirişin üstünde mutlak konumlu. */}
      <figure
        className="relative w-full max-w-4xl pt-[calc(var(--text-display)+7rem)]"
        aria-label={`${t.ordinary}: ${ORDINARY} g. ${t.ours}: ${OURS} g.`}
      >
        {/* Kefeler kirişin çocuğu değil: kiriş dönerken onlar dik kalır, yalnızca iner/kalkar. */}
        <div className="relative h-[3px] w-full">
          <div data-beam className="absolute inset-0 origin-center bg-ink" />
          {pan("left", ORDINARY, t.ordinary, false)}
          {pan("right", OURS, t.ours, true)}
        </div>
        {/* Dayanak: kiriş ortadaki üçgenin tepesinde döner. */}
        <div aria-hidden className="mx-auto h-0 w-0 border-x-[18px] border-b-[34px] border-x-transparent border-b-ink" />
        <div aria-hidden className="mx-auto h-[3px] w-32 bg-ink" />
      </figure>

      <p data-scale-caption className="max-w-[60ch] text-body text-mute md:text-lead">
        {t.caption}
      </p>
    </section>
  );
}
