"use client";

import { creditFor } from "@/content/photo-credits";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type PhotoCreditProps = {
  src: string;
  className?: string;
  /** Bağlantı olarak çizilir; kart gibi zaten bir linkin içindeyse false (iç içe link olmaz). */
  link?: boolean;
  /** Yalnızca dokunmatikte görünür; masaüstünde hover'da başka bir karenin atfı gösteriliyorsa. */
  touchOnly?: boolean;
};

/**
 * Fotoğrafın üstündeki atıf satırı. Ebeveyn `group/photo` taşır: masaüstünde hover'da belirir,
 * hover olmayan cihazlarda hep görünür (bilgi hover'a bağlı kalmasın).
 */
export function PhotoCredit({ src, className, link = false, touchOnly = false }: PhotoCreditProps) {
  const { dict } = useI18n();
  const credit = creditFor(src);
  if (!credit) return null;

  const who = credit.author === credit.source ? credit.source : `${credit.author} / ${credit.source}`;
  const classes = cn(
    "absolute right-2 bottom-2 z-10 bg-paper/90 px-2 py-1 text-[0.75rem] leading-none text-ink opacity-0 transition-opacity duration-300 [@media(hover:none)]:opacity-100",
    !touchOnly && "group-hover/photo:opacity-100 group-focus-within/photo:opacity-100",
    // Bağlantıysa dokunma hedefi en az 24px (WCAG 2.2); görünüş aynı kalır.
    link ? "pointer-events-auto inline-flex min-h-6 items-center hover:underline" : "pointer-events-none",
    className,
  );
  const text = `${dict.credit.photo}: ${who}`;

  return link ? (
    <a href={credit.url} target="_blank" rel="noopener noreferrer" className={classes}>
      {text}
    </a>
  ) : (
    <span className={classes}>{text}</span>
  );
}
