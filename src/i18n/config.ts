export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeCookie = "HAFT_LOCALE";

export const hasLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

/** Locale'e göre `Intl` etiketi; para ve sayı biçimleri bununla yapılır. */
export const intlTag: Record<Locale, string> = { en: "en-IE", tr: "tr-TR" };

/** `/tr/shop` → `/en/shop`. Dil değiştirici ve hreflang bağlantıları için. */
export function swapLocale(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  if (hasLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

/** Dil seçimini bir yıl hatırlar; proxy öneksiz adreslerde bunu okur. */
export function rememberLocale(locale: Locale) {
  document.cookie = `${localeCookie}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** "{n} items" gibi yer tutucuları doldurur. */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
