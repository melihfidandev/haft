"use client";

import { TransitionLink } from "@/components/ui/TransitionLink";
import { locales, rememberLocale, swapLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { WithPathname } from "./RouteChange";

/** EN / TR. Diğer dile geçerken aynı sayfada kalınır; seçim çereze yazılır. Header ve footer paylaşır. */
export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, dict } = useI18n();

  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label={dict.nav.language}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden className="opacity-40">
              /
            </span>
          )}
          {l === locale ? (
            <span aria-current="true" className="py-2">
              {l.toUpperCase()}
            </span>
          ) : (
            <WithPathname>
              {(pathname) => (
                <TransitionLink
                  href={swapLocale(pathname ?? `/${locale}`, l)}
                  onClick={() => rememberLocale(l)}
                  hrefLang={l}
                  lang={l}
                  className="py-2 opacity-45 transition-opacity hover:opacity-100"
                >
                  {l.toUpperCase()}
                </TransitionLink>
              )}
            </WithPathname>
          )}
        </span>
      ))}
    </div>
  );
}
