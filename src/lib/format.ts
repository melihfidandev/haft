import { intlTag, type Locale } from "@/i18n/config";

export function formatMoney(cents: number, locale: Locale) {
  return new Intl.NumberFormat(intlTag[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Gramı kg'a çevirir: 840 → "0,84" (tr) / "0.84" (en). Birim ayrı basılır. */
export function formatKg(grams: number, locale: Locale) {
  return new Intl.NumberFormat(intlTag[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(grams / 1000);
}

export function plural(n: number, one: string, other: string) {
  return (n === 1 ? one : other).replace("{n}", String(n));
}
