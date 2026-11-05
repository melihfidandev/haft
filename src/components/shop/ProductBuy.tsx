"use client";

import { useId, useRef, useState } from "react";
import { useBag } from "@/bag/bag-context";
import { Price } from "@/components/ui/Figures";
import { QtyStepper } from "@/components/ui/QtyStepper";
import type { Product } from "@/content/products";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

export function ProductBuy({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const { dispatch, announce } = useBag();
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const errorId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const name = product.name[locale];

  const add = () => {
    if (!size) {
      setError(true);
      document.querySelector<HTMLElement>("[data-size-option]:not([aria-disabled='true'])")?.focus();
      return;
    }
    dispatch({ type: "add", slug: product.slug, size, qty });
    announce(fill(dict.bag.added, { name, size: oneSize ? dict.product.oneSize : size }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    dropIntoBag();
  };

  /** Galerideki ilk karenin kopyası küçülüp yay çizerek header'daki sepete düşer. */
  const dropIntoBag = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const source = document.querySelector<HTMLElement>("[data-frame] img");
    const target = document.querySelector<HTMLElement>("[data-bag-target]");
    if (!source || !target) return;
    const from = (source.getBoundingClientRect().width ? source : button.current!).getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const size = 120;
    const ghost = document.createElement("div");
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${size}px`,
      height: `${size * 1.25}px`,
      backgroundImage: `url(${product.images[0].src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: "75",
      pointerEvents: "none",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,.45)",
    });
    document.body.appendChild(ghost);

    const start = { x: from.left + from.width / 2 - size / 2, y: from.top + Math.min(from.height, 500) / 2 - size / 2 };
    const end = { x: to.left + to.width / 2 - size / 2, y: to.top + to.height / 2 - (size * 1.25) / 2 };
    const progress = { t: 0 };
    // Yay: x doğrusal, y önce yukarı kalkar sonra ağırca düşer (ikinci dereceden Bezier).
    const peak = Math.min(start.y, end.y) - 140;
    gsap.set(ghost, { x: start.x, y: start.y, scale: 1 });
    gsap.to(progress, {
      t: 1,
      duration: 0.95,
      ease: "power2.in",
      onUpdate: () => {
        const t = progress.t;
        const x = start.x + (end.x - start.x) * t;
        const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * peak + t ** 2 * end.y;
        gsap.set(ghost, { x, y, scale: 1 - 0.82 * t, rotate: 12 * t });
      },
      onComplete: () => ghost.remove(),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <fieldset aria-describedby={error ? errorId : undefined}>
        <legend className="mb-3 flex w-full items-baseline justify-between text-small font-semibold uppercase">
          <span>{dict.product.size}</span>
          {product.low && size === product.low.size && (
            <span className="text-mute normal-case">{fill(dict.product.lastN, { n: product.low.left })}</span>
          )}
        </legend>
        {oneSize ? (
          <p className="font-semibold">{dict.product.oneSize}</p>
        ) : (
          <div role="radiogroup" aria-label={dict.product.size} className="grid grid-cols-6 border-t border-l border-ink">
            {product.sizes.map((s) => {
              const soldOut = product.soldOut.includes(s);
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={soldOut}
                  aria-label={soldOut ? `${s}, ${dict.product.soldOut}` : s}
                  data-size-option
                  tabIndex={selected || (!size && !soldOut && s === product.sizes.find((x) => !product.soldOut.includes(x))) ? 0 : -1}
                  onClick={() => {
                    if (soldOut) return;
                    setSize(s);
                    setError(false);
                  }}
                  onKeyDown={(e) => {
                    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
                    e.preventDefault();
                    const open = product.sizes.filter((x) => !product.soldOut.includes(x));
                    const i = open.indexOf(size ?? open[0]);
                    const next = open[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + open.length) % open.length];
                    setSize(next);
                    setError(false);
                    (e.currentTarget.parentElement?.querySelector(`[aria-label="${next}"]`) as HTMLElement | null)?.focus();
                  }}
                  className={cn(
                    "relative grid min-h-13 place-items-center border-r border-b border-ink text-small font-semibold transition-colors",
                    selected ? "bg-ink text-paper" : "hover:bg-tile",
                    soldOut && "cursor-not-allowed text-mute line-through hover:bg-transparent",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
        {error && (
          <p id={errorId} role="alert" className="mt-2 text-small font-semibold">
            {dict.product.selectSize}
          </p>
        )}
      </fieldset>

      <div className="flex items-stretch gap-3">
        <QtyStepper value={qty} onChange={setQty} label={dict.product.quantity} />
        <button
          ref={button}
          type="button"
          onClick={add}
          className={cn(
            "group relative flex min-h-13 flex-1 items-center justify-between overflow-hidden border border-ink px-5 font-semibold uppercase transition-colors duration-500 ease-heavy",
            added ? "bg-ink text-paper" : "bg-paper text-ink hover:text-paper focus-visible:text-paper",
          )}
        >
          {/* Adet kutusuyla aynı çerçeve; hover'da siyah dolgu alttan "dolar". Eklenince kısa süre dolu kalır. */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 origin-bottom bg-ink transition-transform duration-500 ease-heavy group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none",
              added ? "scale-y-100" : "scale-y-0",
            )}
          />
          <span className="relative">{added ? dict.product.added : dict.product.add}</span>
          <Price cents={product.price * qty} className="relative" />
        </button>
      </div>
    </div>
  );
}
