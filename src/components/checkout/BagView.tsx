"use client";

import { useBag } from "@/bag/bag-context";
import { Weight } from "@/components/ui/Figures";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useI18n } from "@/i18n/provider";
import { plural } from "@/lib/format";
import { BagLines, BagTotals } from "./BagLines";

export function BagView() {
  const { lines, count, weight, hydrated } = useBag();
  const { locale, dict } = useI18n();

  // Sepet localStorage'dan okunana kadar "boş" demeyelim.
  if (!hydrated) return <div className="min-h-[40svh]" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[40svh] flex-col items-start justify-center gap-6">
        <p className="text-h2 font-bold">{dict.bag.empty}</p>
        <TransitionLink href={`/${locale}/shop`} className="border-b-2 border-ink pb-1 font-semibold uppercase">
          {dict.bag.emptyCta} →
        </TransitionLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-8">
        <p className="mb-4 flex items-baseline gap-3 text-mute">
          {plural(count, dict.bag.itemsOne, dict.bag.itemsOther)} · {dict.bag.weighs}
          <Weight grams={weight} figure className="text-h2 text-ink" />
        </p>
        <BagLines />
      </div>
      <aside className="lg:col-span-4">
        <div className="space-y-5 border border-ink p-5 lg:sticky lg:top-28">
          <BagTotals />
          <TransitionLink href={`/${locale}/checkout`} className="grid min-h-13 place-items-center bg-ink font-semibold text-paper uppercase">
            {dict.bag.checkout}
          </TransitionLink>
          <TransitionLink href={`/${locale}/shop`} className="block text-center text-small font-semibold uppercase underline underline-offset-4">
            {dict.bag.keepShopping}
          </TransitionLink>
        </div>
      </aside>
    </div>
  );
}
