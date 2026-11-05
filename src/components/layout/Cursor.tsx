"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Tıklanabilir öğeler: üstlerinde nokta biraz büyür (etiketli büyük daire yalnızca `data-cursor` alanlarında). */
const INTERACTIVE = 'a, button:not(:disabled), [role="button"], [role="radio"]:not([aria-disabled="true"]), summary, label[for], select';

const SCALE = { rest: 0.14, interactive: 0.45, label: 1 };

/**
 * Yalnızca ince imleçli cihazlarda. Normal halde küçük nokta; tıklanabilir öğede biraz büyür,
 * `data-cursor="Etiket"` taşıyan öğenin üstünde etiketli, ağır bir daireye dönüşür.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const el = dot.current!;
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
      let current = "";

      const move = (event: PointerEvent) => {
        gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });
        x(event.clientX);
        y(event.clientY);
        const over = event.target as Element | null;
        const labelled = over?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
        const state = labelled ? "label" : over?.closest(INTERACTIVE) ? "interactive" : "rest";
        const key = `${state}:${labelled}`;
        if (key === current) return;
        current = key;
        setLabel(labelled);
        gsap.to(el, { scale: SCALE[state], duration: 0.6, ease: "expo.out" });
      };
      const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });

      gsap.set(el, { scale: SCALE.rest });
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
  });

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none invisible fixed top-0 left-0 z-[85] grid size-24 place-items-center rounded-full bg-paper px-3 text-center text-small leading-tight font-semibold tracking-wide text-ink uppercase opacity-0 mix-blend-difference"
    >
      <span>{label}</span>
    </div>
  );
}
