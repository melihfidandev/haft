"use client";

import Image from "next/image";
import { useBag } from "@/bag/bag-context";
import { Price, Weight } from "@/components/ui/Figures";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

/** Sepet satırları; çekmecede ve /bag sayfasında ortak. */
export function BagLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { lines, dispatch, announce } = useBag();
  const { locale, dict } = useI18n();

  return (
    <ul className="divide-y divide-line border-y border-line">
      {lines.map((line) => {
        const name = line.product.name[locale];
        const image = line.product.images[0];
        const href = `/${locale}/shop/${line.slug}`;
        return (
          <li key={`${line.slug}-${line.size}`} data-bag-line className="flex gap-4 py-5">
            <TransitionLink
              href={href}
              onClick={onNavigate}
              className={cn("relative shrink-0 overflow-hidden bg-tile", compact ? "h-28 w-22" : "h-40 w-32 md:h-48 md:w-40")}
              tabIndex={-1}
              aria-hidden
            >
              <Image src={image.src} alt="" fill sizes="160px" className="object-cover" />
            </TransitionLink>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <TransitionLink href={href} onClick={onNavigate} className="font-semibold leading-tight hover:underline">
                  {name}
                </TransitionLink>
                <Price cents={line.total} className="font-semibold" />
              </div>
              <p className="mt-1 text-small text-mute">
                {dict.bag.size} {line.size === "OS" ? dict.product.oneSize : line.size} ·{" "}
                <Weight grams={line.weight} className="text-[1em]" />
              </p>
              <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                <QtyStepper
                  value={line.qty}
                  allowZero
                  label={`${dict.bag.quantity}, ${name}`}
                  onChange={(qty) => {
                    dispatch({ type: "setQty", slug: line.slug, size: line.size, qty });
                    if (qty <= 0) announce(fill(dict.bag.removed, { name }));
                  }}
                />
                <button
                  type="button"
                  className="text-small text-mute underline underline-offset-4 hover:text-ink"
                  onClick={() => {
                    dispatch({ type: "remove", slug: line.slug, size: line.size });
                    announce(fill(dict.bag.removed, { name }));
                  }}
                >
                  {dict.bag.remove}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Ara toplam, kargo eşiği ve toplam. */
export function BagTotals({ shipping, total }: { shipping?: number; total?: number }) {
  const bag = useBag();
  const { dict } = useI18n();
  const ship = shipping ?? bag.shipping;
  const progress = Math.min(1, bag.subtotal / (bag.subtotal + bag.toFreeShipping || 1));

  return (
    <div className="space-y-3 text-small">
      <div>
        <p className="mb-2 font-semibold">
          {bag.toFreeShipping > 0 ? (
            fillMoney(dict.bag.freeIn, bag.toFreeShipping)
          ) : (
            dict.bag.freeReached
          )}
        </p>
        <div className="h-[3px] w-full bg-line" aria-hidden>
          <div className="h-full origin-left bg-ink transition-transform duration-700 ease-heavy" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <dl className="space-y-1.5 pt-2">
        <div className="flex justify-between">
          <dt className="text-mute">{dict.bag.subtotal}</dt>
          <dd><Price cents={bag.subtotal} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mute">{dict.bag.shipping}</dt>
          <dd>{ship === 0 ? dict.bag.free : <Price cents={ship} />}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mute">{dict.bag.weighs}</dt>
          <dd><Weight grams={bag.weight} className="text-[1em]" /></dd>
        </div>
        <div className="flex justify-between border-t border-ink pt-3 text-body font-semibold">
          <dt>{dict.bag.total}</dt>
          <dd><Price cents={total ?? bag.subtotal + ship} /></dd>
        </div>
      </dl>
    </div>
  );

  function fillMoney(template: string, cents: number) {
    // Para biçimi bileşen içinde: Price istemci locale'ini kullanıyor.
    const [before, after] = template.split("{amount}");
    return (
      <>
        {before}
        <Price cents={cents} />
        {after}
      </>
    );
  }
}
