"use client";

import { useI18n } from "@/i18n/provider";
import { Weightless } from "./Weightless";

/** Dil kökü içindeki notFound() çağrıları için (örn. ürün sayfası). */
export function NotFoundView() {
  const { locale, dict } = useI18n();
  const t = dict.notFound;
  return <Weightless lines={[{ lang: locale, title: t.title, text: t.text, cta: t.cta, href: `/${locale}`, pageTitle: dict.meta.notFoundTitle }]} />;
}
