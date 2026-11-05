"use client";

import { useRef, useState, type MouseEvent } from "react";
import { useLenis } from "@/components/layout/SmoothScroll";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

type Spec = { label: string; text: string };

/** Kumaş / Kalıp / Bakım. İlki açık başlar; her biri bağımsız açılıp kapanır. */
export function SpecAccordion({ items }: { items: Spec[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <SpecItem key={item.label} {...item} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

/**
 * Native <details>: JS yoksa da çalışır. JS varken yükseklik animasyonlu açılır/kapanır.
 *
 * Bilgi paneli yapışkan (sticky) ve ekrandan uzun; sayfanın sonunda alt kenarı sabitlenir. O durumda panel uzayınca
 * üst kenarı, yani ürün başlığı yukarı kayar. Bu yüzden animasyon boyunca tıklanan başlığın ekrandaki yeri sabit
 * tutulur: kayma ne kadarsa sayfa o kadar ters yöne kaydırılır. Sonuç: başlık yerinde, içerik aşağı açılır.
 */
function SpecItem({ label, text, defaultOpen }: Spec & { defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const details = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const toggle = (event: MouseEvent) => {
    event.preventDefault();
    const el = details.current!;
    const panel = body.current!;
    const summary = event.currentTarget as HTMLElement;
    const opening = !el.open;
    setOpen(opening);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.open = opening;
      return;
    }

    const anchor = summary.getBoundingClientRect().top;
    const hold = () => {
      const drift = summary.getBoundingClientRect().top - anchor;
      if (Math.abs(drift) < 0.5) return;
      const instance = lenis.current;
      if (instance) instance.scrollTo(instance.scroll + drift, { immediate: true, force: true });
      else window.scrollBy(0, drift);
    };

    gsap.killTweensOf([panel, panel.firstElementChild]);
    if (opening) {
      el.open = true;
      gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.7, ease: "power3.out", onUpdate: hold, onComplete: hold });
      gsap.fromTo(panel.firstElementChild, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: "power2.out" });
    } else {
      gsap.to(panel.firstElementChild, { opacity: 0, duration: 0.2 });
      gsap.to(panel, {
        height: 0,
        duration: 0.5,
        ease: "power3.inOut",
        onUpdate: hold,
        onComplete: () => {
          el.open = false;
          gsap.set([panel, panel.firstElementChild], { clearProps: "height,opacity" });
          hold();
        },
      });
    }
  };

  return (
    <details ref={details} open={defaultOpen} className="py-4">
      <summary
        onClick={toggle}
        className="flex min-h-8 list-none items-center justify-between font-semibold uppercase [&::-webkit-details-marker]:hidden"
      >
        {label}
        <span aria-hidden className={cn("text-xl transition-transform duration-500 ease-heavy", open && "rotate-45")}>
          +
        </span>
      </summary>
      <div ref={body} className="overflow-hidden">
        <p className="max-w-[48ch] pt-3 text-mute">{text}</p>
      </div>
    </details>
  );
}
