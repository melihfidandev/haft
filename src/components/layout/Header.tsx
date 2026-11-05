"use client";

import { useRef } from "react";
import { useBag } from "@/bag/bag-context";
import { Weight } from "@/components/ui/Figures";
import { Logo } from "@/components/ui/Logo";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { LocaleSwitch } from "./LocaleSwitch";
import { WithPathname } from "./RouteChange";

/**
 * mix-blend-difference sayesinde beyaz metin koyu hero'da beyaz, beyaz sayfada siyah görünür;
 * bölüme göre tema değiştirmeye gerek kalmaz.
 */
export function Header() {
  const { locale, dict } = useI18n();
  const { count, weight, setOpen, hydrated } = useBag();
  const root = useRef<HTMLElement>(null);
  const scale = useRef<HTMLSpanElement>(null);
  const lastCount = useRef(count);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-header-item]", { yPercent: -120 });
        return onIntroDone(() =>
          gsap.to("[data-header-item]", {
            yPercent: 0,
            duration: 1,
            stagger: 0.06,
            delay: 0.25,
          }),
        );
      });
    },
    { scope: root },
  );

  // Sepete ürün düşünce "tartı" çöker ve geri yaylanır.
  useGSAP(
    () => {
      if (!hydrated || count === lastCount.current) return;
      const grew = count > lastCount.current;
      lastCount.current = count;
      if (
        !grew ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      gsap.fromTo(
        scale.current,
        { y: 0, scaleY: 1 },
        {
          keyframes: [
            { y: 5, scaleY: 0.82, duration: 0.14, ease: "power2.in" },
            { y: 0, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" },
          ],
        },
      );
    },
    { dependencies: [count, hydrated] },
  );

  return (
    <header
      ref={root}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 text-paper mix-blend-difference"
    >
      <div className="flex items-center justify-between gap-6 px-gutter pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        {/* Logo hiç daralmaz; 320px'te sıkışınca "HAF" diye kesiliyordu. Yer gerekirse menü aralıkları daralır. */}
        <div className="mask-line shrink-0">
          <TransitionLink
            href={`/${locale}`}
            data-header-item
            className="pointer-events-auto block text-[1.6rem] md:text-[2rem]"
            aria-label={`HAFT. — ${dict.nav.home}`}
          >
            <Logo />
          </TransitionLink>
        </div>

        <nav
          aria-label={dict.nav.primary}
          className="flex items-center gap-3 text-small font-semibold tracking-wide uppercase min-[400px]:gap-5 md:gap-9"
        >
          {/* Animasyon hedefi Suspense'in dışında: GSAP henüz hydrate olmamış bir öğeye stil yazmasın. */}
          <div className="mask-line">
            <div data-header-item>
              <WithPathname>
                {(pathname) => (
                  <TransitionLink
                    href={`/${locale}/shop`}
                    data-text={dict.nav.shop}
                    aria-current={
                      pathname?.startsWith(`/${locale}/shop`)
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "split pointer-events-auto block py-2",
                      pathname?.startsWith(`/${locale}/shop`) &&
                        "underline underline-offset-4",
                    )}
                  >
                    {dict.nav.shop}
                  </TransitionLink>
                )}
              </WithPathname>
            </div>
          </div>

          {/* 360px altında header'a sığmıyor; dil seçimi footer'da da var. */}
          <div className="mask-line max-[359px]:hidden">
            <div data-header-item className="pointer-events-auto">
              <LocaleSwitch />
            </div>
          </div>

          <div className="mask-line">
            <button
              type="button"
              data-header-item
              data-bag-target
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-label={`${dict.nav.openBag}, ${count}`}
              className="pointer-events-auto flex items-center gap-2 py-2 uppercase"
            >
              <span className="hidden sm:inline">{dict.nav.bag}</span>
              <span
                ref={scale}
                className="inline-flex origin-bottom items-baseline gap-1.5 border border-current px-2 py-1"
              >
                <span className="tabular-nums">{count}</span>
                <span aria-hidden className="opacity-50">
                  ·
                </span>
                <Weight grams={weight} className="text-[0.95em]" />
              </span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
