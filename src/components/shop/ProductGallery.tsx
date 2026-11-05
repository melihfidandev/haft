"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { fill } from "@/i18n/config";
import type { Product } from "@/content/products";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { ProductLightbox } from "./ProductLightbox";

/**
 * Masaüstünde dikey yığın (bilgi paneli yanında yapışkan durur), mobilde yatay kaydırmalı şerit.
 * İlk kare perde kalkarken alttan clip-path ile açılır; diğerleri scroll'da.
 */
export function ProductGallery({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");
        // Mağaza kartından uçarak gelindiyse ilk kare zaten yerinde: kendi açılışı oynamaz.
        const landing = document.documentElement.dataset.flight === "1";
        if (!landing) gsap.set(frames[0], { clipPath: "inset(100% 0 0 0)" });
        const cleanup = onIntroDone(() => {
          if (landing) return;
          gsap.to(frames[0], {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.4,
            ease: "expo.inOut",
            delay: 0.1,
          });
          gsap.fromTo(
            frames[0].querySelector("img"),
            { scale: 1.3 },
            { scale: 1, duration: 2, ease: "expo.out", delay: 0.1 },
          );
        });
        frames.slice(1).forEach((frame) =>
          gsap.fromTo(
            frame,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "expo.inOut",
              scrollTrigger: { trigger: frame, start: "top 85%" },
            },
          ),
        );
        return cleanup;
      });
    },
    { scope: root },
  );

  return (
    <>
      <div
        ref={root}
        aria-label={dict.product.gallery}
        role="region"
        className="-mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter [scrollbar-width:none] md:mx-0 md:flex-col md:gap-4 md:overflow-visible md:px-0"
        data-lenis-prevent-horizontal
      >
        {product.images.map((image, i) => (
          <figure
            key={image.src}
            data-frame
            className="relative w-[86vw] shrink-0 snap-center md:w-full"
          >
            <div
              data-zoom-source
              data-flight-target={i === 0 ? "" : undefined}
              className="group/photo relative aspect-[4/5] overflow-hidden bg-tile"
            >
              <Image
                src={image.src}
                alt={image.alt[locale]}
                fill
                preload={i === 0}
                quality={90}
                sizes="(min-width: 768px) 58vw, 86vw"
                className="object-cover"
              />
              {/* Görselin tamamı önizleme düğmesi; atıf bağlantısı üstte kalır (iç içe etkileşimli öğe olmasın diye kardeş). */}
              <button
                type="button"
                data-cursor={dict.product.zoom}
                onClick={() => setZoom(i)}
                className="absolute inset-0"
                aria-label={fill(dict.product.zoomImage, { n: i + 1 })}
                aria-haspopup="dialog"
              />
              <PhotoCredit src={image.src} link />
            </div>
          </figure>
        ))}
      </div>
      {zoom !== null && (
        <ProductLightbox
          images={product.images}
          index={zoom}
          gallery={root}
          onClose={() => setZoom(null)}
        />
      )}
    </>
  );
}
