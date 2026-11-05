"use client";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { formatKg, formatMoney } from "@/lib/format";

/**
 * Ağırlık: gramı kg olarak basar. `figure` açıkken rakam Geostar ile (yalnızca büyük boyutlarda;
 * Geostar 40px altında okunmuyor), değilse Archivo tabular rakam.
 */
export function Weight({ grams, className, figure = false }: { grams: number; className?: string; figure?: boolean }) {
  const { locale, dict } = useI18n();
  return (
    <span className={cn("inline-flex items-baseline gap-[0.25em] whitespace-nowrap", className)}>
      <span className={figure ? "font-figure" : "font-semibold tabular-nums"}>{formatKg(grams, locale)}</span>
      <span className={cn("font-semibold tracking-wide uppercase", figure ? "text-small" : "text-[0.55em]")}>{dict.units.kg}</span>
    </span>
  );
}

export function Price({ cents, className }: { cents: number; className?: string }) {
  const { locale } = useI18n();
  return <span className={cn("tabular-nums", className)}>{formatMoney(cents, locale)}</span>;
}
