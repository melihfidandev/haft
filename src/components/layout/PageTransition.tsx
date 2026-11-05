"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useCallback, useRef, type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { RouteChange } from "./RouteChange";
import { useLenis } from "./SmoothScroll";

type NavigateOptions = {
  /** Geçmişe yeni kayıt eklemek yerine mevcut sayfanın yerine geçer: geri tuşu bu sayfaya dönmez. */
  replace?: boolean;
};
type TransitionContextValue = {
  navigate: (href: string, options?: NavigateOptions) => void;
  fly: (href: string, media: HTMLElement) => void;
};
const TransitionContext = createContext<TransitionContextValue | null>(null);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sayfa geçişi: koyu perde aşağıdan "düşer", ortasındaki HAFT. dikeyde esner (logo filminden),
 * yeni sayfa perdenin altından açılır. Azaltılmış harekette kısa bir crossfade.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const lenis = useLenis();
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const flight = useRef<{ flyer: HTMLElement; hover: HTMLElement | null; media: HTMLElement } | null>(null);

  const navigate = useCallback(
    (href: string, { replace = false }: NavigateOptions = {}) => {
      const go = () => (replace ? router.replace(href) : router.push(href));
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname && !target.hash) return;
      if (busy.current) return;
      busy.current = true;
      router.prefetch(target.pathname);

      const el = curtain.current;
      if (!el) return go();
      const chars = el.querySelectorAll("[data-logo-char]");

      if (reduced()) {
        gsap.fromTo(el, { autoAlpha: 0, yPercent: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none", onComplete: go });
        return;
      }

      gsap
        .timeline({ onComplete: go })
        .set(el, { autoAlpha: 1, yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
        .fromTo(
          chars,
          { scaleY: 0.05, yPercent: 40 },
          { scaleY: 1, yPercent: 0, duration: 0.6, stagger: 0.04, ease: "back.out(1.6)" },
          "-=0.35",
        );
    },
    [router],
  );

  /**
   * Kart → ürün detayı: perde yerine ortak öğe geçişi. Kartın görseli kopyalanıp sayfanın üstündeki sabit bir
   * katmana alınır (rota değişse de yaşar), sayfa aşağı düşüp söner, rota değişir; iniş onRouteChange'te.
   */
  const fly = useCallback(
    (href: string, media: HTMLElement) => {
      if (busy.current) return;
      if (reduced()) return navigate(href);
      busy.current = true;
      router.prefetch(new URL(href, window.location.href).pathname);

      const r = media.getBoundingClientRect();
      const [base, second] = media.querySelectorAll<HTMLImageElement>("img");
      const flyer = document.createElement("div");
      flyer.setAttribute("aria-hidden", "true");
      flyer.className = "pointer-events-none fixed z-[75] overflow-hidden bg-tile";
      Object.assign(flyer.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      const copy = (img: HTMLImageElement) => {
        const el = document.createElement("img");
        el.src = img.currentSrc || img.src;
        el.alt = "";
        el.className = "absolute inset-0 size-full object-cover";
        return flyer.appendChild(el);
      };
      copy(base);
      // Hover'daki ikinci kare açıkken tıklandıysa kopya onunla başlar, uçarken ilk kareye geçer.
      const shown = second?.parentElement && getComputedStyle(second.parentElement).clipPath.startsWith("inset(0");
      const hover = shown ? copy(second) : null;
      document.body.appendChild(flyer);
      media.style.visibility = "hidden";
      // Ürün galerisi ilk karesinin kendi açılış animasyonunu bu işarete bakıp atlar.
      document.documentElement.dataset.flight = "1";
      flight.current = { flyer, hover, media };

      gsap
        .timeline({ onComplete: () => router.push(href) })
        .to("#main", { opacity: 0, y: 40, duration: 0.5, ease: "power3.in" }, 0)
        .to(flyer, { scale: 1.03, duration: 0.4, ease: "power2.out" }, 0);
    },
    [router, navigate],
  );

  /** Yeni sayfada hedef kare çizilene kadar bekler (en fazla ~1 sn), sonra kopyayı oraya indirir. */
  const land = () => {
    const current = flight.current!;
    flight.current = null;
    const { flyer, hover, media } = current;
    gsap.set("#main", { opacity: 1, y: 0 });
    const finish = () => {
      flyer.remove();
      // Mağaza sayfası önbellekte saklanıyor; geri dönülünce kartın görseli görünür olmalı.
      media.style.visibility = "";
      delete document.documentElement.dataset.flight;
      busy.current = false;
      ScrollTrigger.refresh();
    };

    let frames = 0;
    const seek = () => {
      // Önbellekte gizli tutulan eski sayfalarda da hedef olabilir (ör. başka bir ürün); görünür olanı seç.
      const target = [...document.querySelectorAll<HTMLElement>("[data-flight-target]")].find((el) => el.getClientRects().length > 0);
      if (!target) {
        if (++frames < 60) return requestAnimationFrame(seek);
        return gsap.to(flyer, { opacity: 0, duration: 0.4, onComplete: finish });
      }
      target.style.visibility = "hidden";
      const to = target.getBoundingClientRect();
      if (hover) gsap.to(hover, { opacity: 0, duration: 0.6, delay: 0.2, ease: "power2.inOut" });
      gsap.to(flyer, {
        left: to.left,
        top: to.top,
        width: to.width,
        height: to.height,
        scale: 1,
        duration: 1,
        ease: "expo.inOut",
        onComplete: () => {
          // Gerçek görsel yüklenmeden kopya kalkmasın: göz tek, kesintisiz bir fotoğraf görsün.
          const img = target.querySelector("img");
          const ready = img && !img.complete ? img.decode().catch(() => {}) : Promise.resolve();
          Promise.race([ready, new Promise((r) => setTimeout(r, 800))]).then(() => {
            target.style.visibility = "";
            finish();
          });
        },
      });
    };
    requestAnimationFrame(seek);
  };

  // Yeni rota çizildiğinde perde yukarı kalkar. RouteChange callback'i ref'te tuttuğu için memo gerekmez.
  const onRouteChange = () => {
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    if (flight.current) return land();

    const el = curtain.current;
    if (!el || !busy.current) return;
    const chars = el.querySelectorAll("[data-logo-char]");
    const done = () => {
      busy.current = false;
      ScrollTrigger.refresh();
    };

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (reduced()) {
        gsap.to(el, { autoAlpha: 0, duration: 0.3, ease: "none", onComplete: done });
        return;
      }
      gsap
        .timeline({ onComplete: done })
        .to(chars, { scaleY: 2.4, yPercent: -60, autoAlpha: 0, duration: 0.45, stagger: 0.03, ease: "power3.in" })
        .to(el, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, "-=0.2")
        .set(el, { autoAlpha: 0 })
        .set(chars, { clearProps: "all" });
    });
  };

  return (
    <TransitionContext value={{ navigate, fly }}>
      <RouteChange onChange={onRouteChange} />
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="invisible fixed inset-0 z-[80] flex items-center justify-center bg-night text-paper opacity-0"
      >
        <Logo split className="text-display" />
      </div>
    </TransitionContext>
  );
}

function useTransition() {
  const value = use(TransitionContext);
  if (!value) throw new Error("Sayfa geçişi, PageTransition dışında kullanıldı");
  return value;
}

export const useTransitionNavigate = () => useTransition().navigate;

/** Kartın görselini yeni sayfadaki yerine uçurarak gider (`data-flight-target`). */
export const useFlightNavigate = () => useTransition().fly;
