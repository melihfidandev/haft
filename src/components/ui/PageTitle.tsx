"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";

/** Sayfa başlığı: harfler ince doğar (wght 100), aşağı düşerken kalınlaşır. Markanın "ağırlaşma" hareketinin kısa hali. */
export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-title-inner]", { yPercent: -105, y: 0, "--w": 100 });
        return onIntroDone(() =>
          gsap.to("[data-title-inner]", { yPercent: 0, y: 0, "--w": 900, duration: 1.3, ease: "expo.out", delay: 0.1 }),
        );
      });
    },
    { scope: root },
  );

  return (
    <h1
      ref={root}
      className={cn("mask-line font-display text-display leading-[0.88] tracking-[-0.01em] uppercase lang-tr:leading-[1.02]", className)}
    >
      <span data-title-inner className="block [font-variation-settings:'wght'_var(--w,900)]">
        {children}
      </span>
    </h1>
  );
}
