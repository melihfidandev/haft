"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Sonsuz bant: scroll hızıyla hızlanır, scroll yönüne göre döner. */
export function Marquee() {
  const { dict } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const items = dict.home.marquee;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector("[data-track]")!;
        const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
        // Ters yöne dönünce sıfırda takılmasın diye döngü çok ileriden başlar.
        loop.totalTime(28 * 1000);
        let direction = 1;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            direction = self.direction;
            const boost = Math.min(6, 1 + Math.abs(self.getVelocity()) / 400);
            gsap.to(loop, { timeScale: boost * direction, duration: 0.25, overwrite: true });
            gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.25, ease: "power2.out" });
          },
        });
        return () => {
          loop.kill();
          st.kill();
        };
      });
    },
    { scope: root },
  );

  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-6 md:px-10">{item}</span>
          <span aria-hidden className="inline-block size-[0.35em] rounded-full bg-current" />
        </span>
      ))}
    </span>
  );

  return (
    <div ref={root} className="overflow-hidden border-y border-ink bg-paper py-4 md:py-6" aria-label={items.join(", ")} role="img">
      <div data-track className="font-display flex w-max text-h2 leading-none font-black tracking-tight whitespace-nowrap uppercase" aria-hidden>
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
