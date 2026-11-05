"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { introDone, markIntroDone } from "@/lib/intro";

const TARGET = 320;

/**
 * İlk girişte: HAFT. harfleri logo filmindeki gibi dikeyde esneyerek doğar, Geostar sayaç 0 → 320 g sayar.
 * Sayaç gerçek yüklemeye bağlı: fontlar ve sayfa yüklenmeden 320'ye varmaz.
 */
export function Preloader() {
  const { dict } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (introDone()) {
        setGone(true);
        return;
      }
      const counter = { value: 0 };
      const figure = root.current!.querySelector<HTMLElement>("[data-count]")!;
      const render = () => (figure.textContent = String(Math.round(counter.value)));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chars = root.current!.querySelectorAll("[data-logo-char]");

      const ready = Promise.all([
        document.fonts.ready,
        document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true })),
        new Promise((r) => setTimeout(r, reduce ? 300 : 1100)),
      ]);
      // Yavaş bir kaynak yüzünden kimse siyah ekranda beklemesin: en fazla 4 sn.
      const loaded = Promise.race([ready, new Promise((r) => setTimeout(r, 4000))]);

      const finish = () => {
        const out = gsap.timeline({
          onComplete: () => {
            markIntroDone();
            setGone(true);
          },
        });
        if (reduce) {
          out.to(root.current, { autoAlpha: 0, duration: 0.4, ease: "none" });
          return;
        }
        out
          .to(counter, { value: TARGET, duration: 0.5, ease: "power2.out", onUpdate: render })
          // Çıkış sade beyaz: kanal kayması yalnızca girişte (kullanıcı tercihi).
          .to(chars, { scaleY: 2.6, yPercent: -70, duration: 0.55, stagger: 0.035, ease: "power3.in" }, "+=0.1")
          .to("[data-count-row]", { yPercent: 120, duration: 0.5, ease: "power3.in" }, "<")
          // Header ve hero bu noktada girmeye başlasın diye perde kalkarken işaretlenir.
          .add(() => markIntroDone(), "-=0.1")
          .to(root.current, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.15");
      };

      if (reduce) {
        gsap.set(chars, { opacity: 1 });
        loaded.then(finish);
        return;
      }

      // Harfler ve gölgeler aynı zaman çizgisinde: gölgeler harfler doğarken ayrışıp birleşir.
      // (Harflerin doğuşu bir ara CSS'e taşınmıştı; gölgeler JS'i beklediği için geç kalıyordu, LCP'ye de faydası olmadı.)
      gsap
        .timeline()
        .fromTo(chars, { scaleY: 0.02, opacity: 1 }, { scaleY: 1, duration: 1, stagger: 0.07, ease: "back.out(1.4)" })
        // Logo filmindeki kanal kayması: gölgeler kısa bir an ayrışıp birleşir. autoAlpha: görünmezken
        // erişilebilirlik ağacından da çıksınlar (dekoratif kopya, kontrast denetimine takılmasın).
        .fromTo("[data-ghost]", { x: (i) => (i ? 10 : -10), autoAlpha: 0.9 }, { x: 0, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, 0.45)
        .to(counter, { value: TARGET * 0.72, duration: 1.4, ease: "power1.inOut", onUpdate: render }, 0);

      loaded.then(() => gsap.delayedCall(0.2, finish));
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div
      ref={root}
      data-preloader
      role="status"
      aria-label={dict.preloader.label}
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center overflow-hidden bg-night text-paper [[data-intro=done]_&]:hidden"
    >
      <div className="relative">
        <Logo split className="text-[clamp(4rem,20vw,16rem)] [&_[data-logo-char]]:opacity-0" />
        {/* Kanal kayması gölgeleri gerçek metin değil, ::before ile çizilir: erişilebilirlik ve kontrast
            denetimi bu dekoratif kopyaları okunacak metin saymasın. Görünüş Logo ile birebir aynı. */}
        {(["text-split-red", "text-split-blue"] as const).map((color) => (
          <span key={color} data-ghost aria-hidden className={`invisible absolute inset-0 opacity-0 mix-blend-screen ${color}`}>
            <span className="font-logo text-[clamp(4rem,20vw,16rem)] leading-none tracking-[0.04em] uppercase before:content-['HAFT.']" />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 overflow-hidden px-gutter pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Görünür "Yükleniyor" yazısı yok; ekran okuyucu durumu kapsayıcının aria-label'ından duyar. */}
        <div data-count-row className="flex items-end justify-end">
          <span className="flex items-baseline gap-2">
            <span data-count className="font-figure text-h1 leading-none tabular-nums">0</span>
            <span className="text-small font-semibold">g</span>
          </span>
        </div>
      </div>
    </div>
  );
}
