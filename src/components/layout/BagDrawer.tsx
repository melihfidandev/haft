"use client";

import { useEffect, useRef } from "react";
import { useBag } from "@/bag/bag-context";
import { BagLines, BagTotals } from "@/components/checkout/BagLines";
import { Weight } from "@/components/ui/Figures";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useI18n } from "@/i18n/provider";
import { plural } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { RouteChange } from "./RouteChange";
import { useLenis } from "./SmoothScroll";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function BagDrawer() {
  const { open, setOpen, lines, count, weight } = useBag();
  const { locale, dict } = useI18n();
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const timeline = useRef<gsap.core.Timeline>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
        const tl = gsap.timeline({ paused: true });
        tl.set(root.current, { autoAlpha: 1 });
        tl.fromTo("[data-backdrop]", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0);
        if (conditions?.full) {
          tl.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: "expo.out" }, 0);
          tl.fromTo("[data-drawer-item]", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 }, 0.2);
        } else {
          tl.fromTo(panel.current, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0);
        }
        timeline.current = tl;
        return () => tl.kill();
      });
    },
    { scope: root },
  );

  // Safari üstteki saat/pil şeridini tema renginden boyar: sepet açıkken beyaz, kapanınca gece.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const night = meta.content;
    if (open) meta.content = "#ffffff";
    return () => {
      meta.content = night;
    };
  }, [open]);

  useEffect(() => {
    const tl = timeline.current;
    if (!tl) return;
    if (open) {
      opener.current = document.activeElement as HTMLElement;
      lenis.current?.stop();
      tl.timeScale(1).play(0);
      // Odağı panele taşı (ilk etkileşimli öğe: kapat butonu).
      requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus());
    } else if (tl.progress() > 0) {
      lenis.current?.start();
      tl.timeScale(1.6).reverse();
      opener.current?.focus?.();
    }
  }, [open, lenis]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
    if (event.key !== "Tab" || !panel.current) return;
    // Basit odak tuzağı: sekme tuşu panelin dışına çıkmaz.
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const close = () => setOpen(false);

  return (
    // Yükseklik lvh: karartma ve beyaz panel Safari'nin alt çubuğunun arkasına da uzanır, altta sayfa görünmez.
    // Panelin içeriği ise görünen alanda kalır: alt boşluk çubuğun o anki boyu kadar (lvh − dvh).
    <div ref={root} className="invisible fixed inset-x-0 top-0 z-[70] h-lvh opacity-0" onKeyDown={onKeyDown}>
      {/* Geri/ileri tuşuyla rota değişirse çekmece kapanır. */}
      <RouteChange onChange={close} />
      <div data-backdrop className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={close} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        inert={!open}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-paper pb-[calc(100lvh-100dvh)] sm:max-w-[30rem]"
      >
        <div data-drawer-item className="flex items-start justify-between gap-6 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6">
          <div>
            <h2 id="bag-title" className="font-display text-h1 leading-[0.85] font-black tracking-tight uppercase">
              {dict.bag.title}
            </h2>
            <p className="mt-3 flex items-baseline gap-2 text-small text-mute">
              {plural(count, dict.bag.itemsOne, dict.bag.itemsOther)} · {dict.bag.weighs}
              <Weight grams={weight} className="text-lead text-ink" />
            </p>
          </div>
          <button type="button" onClick={close} className="-mr-2 grid size-11 place-items-center text-2xl" aria-label={dict.bag.close}>
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div data-drawer-item className="flex flex-1 flex-col items-start justify-center gap-6 px-6 pb-24">
            <p className="text-h2 leading-tight font-bold">{dict.bag.empty}</p>
            <TransitionLink href={`/${locale}/shop`} onClick={close} className="border-b-2 border-ink pb-1 font-semibold uppercase">
              {dict.bag.emptyCta} →
            </TransitionLink>
          </div>
        ) : (
          <>
            <div data-drawer-item data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6">
              <BagLines compact onNavigate={close} />
            </div>
            <div data-drawer-item className="space-y-4 border-t border-ink px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <BagTotals />
              <div className="grid grid-cols-2 gap-2">
                <TransitionLink href={`/${locale}/bag`} onClick={close} className="grid min-h-13 place-items-center border border-ink text-small font-semibold uppercase">
                  {dict.bag.viewBag}
                </TransitionLink>
                <TransitionLink href={`/${locale}/checkout`} onClick={close} className="grid min-h-13 place-items-center bg-ink text-small font-semibold text-paper uppercase">
                  {dict.bag.checkout}
                </TransitionLink>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
