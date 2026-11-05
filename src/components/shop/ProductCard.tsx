"use client";

import Image from "next/image";
import { useRef, type MouseEvent } from "react";
import { useFlightNavigate } from "@/components/layout/PageTransition";
import { Price } from "@/components/ui/Figures";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { TransitionLink } from "@/components/ui/TransitionLink";
import type { Product } from "@/content/products";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type ProductCardProps = {
  product: Product;
  className?: string;
  sizes?: string;
  /** Mağazada h1'den sonra h2; ürün sayfasındaki "Bununla iyi gider" altında h3. */
  heading?: "h2" | "h3";
  /** İlk görünen kartlar: görsel öncelikli yüklenir (sayfanın en büyük öğesi genelde bu). */
  preload?: boolean;
};

/** Hover'da ikinci kare alttan "düşerek" gelir; gram rakamı belirir. Dokunmatikte ilk kare sabit. */
export function ProductCard({
  product,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  heading: Heading = "h3",
  preload = false,
}: ProductCardProps) {
  const { locale, dict } = useI18n();
  const [first, second] = product.images;
  const media = useRef<HTMLDivElement>(null);
  const fly = useFlightNavigate();
  const href = `/${locale}/shop/${product.slug}`;

  // Perde yerine görsel ürün sayfasındaki yerine uçar. Yeni sekme vb. tarayıcı davranışlarına dokunulmaz.
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !media.current) return;
    event.preventDefault();
    fly(href, media.current);
  };

  return (
    <article data-card={product.slug} className={cn("group relative", className)}>
      <TransitionLink href={href} onClick={onClick} data-cursor={dict.shop.view} className="block">
        <div ref={media} className="group/photo relative aspect-[4/5] overflow-hidden bg-tile">
          <Image
            src={first.src}
            alt={first.alt[locale]}
            fill
            preload={preload}
            sizes={sizes}
            className="object-cover transition-transform duration-[1.2s] ease-heavy group-hover:scale-[1.04]"
          />
          {/* Masaüstünde hover ikinci kareyi açar, atıf da onunla gelir; dokunmatikte ilk karenin atfı görünür. */}
          <PhotoCredit src={first.src} touchOnly={Boolean(second)} />
          {second && (
            <div className="absolute inset-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ease-heavy group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none">
              <Image src={second.src} alt="" fill sizes={sizes} className="object-cover" />
              <PhotoCredit src={second.src} />
            </div>
          )}
          {product.gsm && (
            <p className="absolute bottom-3 left-3 flex items-baseline gap-1 bg-paper px-2 py-1 text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:opacity-100">
              <span className="font-bold tabular-nums leading-none">{product.gsm}</span>
              <span className="text-[0.7rem] font-semibold">{dict.units.gsm}</span>
            </p>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <Heading className="font-semibold leading-tight uppercase">{product.name[locale]}</Heading>
          <Price cents={product.price} className="shrink-0 font-semibold" />
        </div>
        <p className="mt-1 text-small text-mute">{dict.shop.colors[product.color]}</p>
      </TransitionLink>
    </article>
  );
}
