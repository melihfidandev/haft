"use client";

import Lenis from "lenis";
import { createContext, use, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      // Hareketi azaltan kullanıcıda native scroll; Lenis hiç kurulmaz.
      if (media.matches) return;
      const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
      instance.on("scroll", ScrollTrigger.update);
      tick = (time) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenis.current = instance;
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      lenis.current?.destroy();
      lenis.current = null;
    };
    const onChange = () => {
      stop();
      start();
    };

    start();
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return <LenisContext value={lenis}>{children}</LenisContext>;
}

export function useLenis() {
  const ref = use(LenisContext);
  if (!ref) throw new Error("useLenis, SmoothScroll dışında kullanıldı");
  return ref;
}
