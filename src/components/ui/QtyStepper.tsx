"use client";

import { MAX_QTY } from "@/bag/bag-reducer";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type QtyStepperProps = {
  value: number;
  onChange: (next: number) => void;
  /** 1'de "−" basılınca satır silinsin mi (sepette evet, ürün sayfasında hayır). */
  allowZero?: boolean;
  label: string;
  className?: string;
};

export function QtyStepper({ value, onChange, allowZero = false, label, className }: QtyStepperProps) {
  const { dict } = useI18n();
  const min = allowZero ? 0 : 1;
  const button =
    "grid min-h-11 w-11 place-items-center self-stretch text-lg transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30";

  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-stretch border border-ink", className)}>
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={dict.bag.decrease}>
        −
      </button>
      <output className="grid w-8 place-items-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={dict.bag.increase}>
        +
      </button>
    </div>
  );
}
