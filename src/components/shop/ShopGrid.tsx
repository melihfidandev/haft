"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { products, type Category, type Color } from "@/content/products";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip";
import { ProductCard } from "./ProductCard";

type CategoryFilter = Category | "all";
type ColorFilter = Color | "all";

/**
 * Ana sayfadaki "Siyah. / Beyaz." bölümü mağazayı `?color=black|white` ile açar.
 * Arama parametresi prerender'da bilinmez: sayfa önce filtresiz çizilir, parametre okununca filtreli hali gelir.
 */
export function ShopGrid() {
  return (
    <Suspense fallback={<Grid initialColor="all" />}>
      <GridFromUrl />
    </Suspense>
  );
}

function GridFromUrl() {
  const param = useSearchParams().get("color");
  const color: ColorFilter = param === "black" || param === "white" ? param : "all";
  return <Grid key={color} initialColor={color} />;
}

function Grid({ initialColor }: { initialColor: ColorFilter }) {
  const { dict } = useI18n();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [color, setColor] = useState<ColorFilter>(initialColor);
  const root = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const gridHeight = useRef(0);

  const visible = products.filter((p) => (category === "all" || p.category === category) && (color === "all" || p.color === color));

  // Filtre değişmeden hemen önce kartların yeri kaydedilir; render sonrası Flip aradaki farkı oynatır.
  const change = (apply: () => void) => {
    flipState.current = Flip.getState(root.current!.querySelectorAll("[data-card]"));
    gridHeight.current = grid.current?.offsetHeight ?? 0;
    apply();
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Flip kartları animasyon boyunca absolute yapar; grid'in boyu sıfıra düşüp footer yukarı fırlamasın diye
    // grid eski boyundan yeni boyuna aynı süre ve eğriyle geçer.
    const box = grid.current;
    if (box && gridHeight.current) {
      gsap.fromTo(box, { height: gridHeight.current }, { height: box.offsetHeight, duration: 0.8, ease: "expo.inOut" });
    }
    Flip.from(state, {
      targets: root.current!.querySelectorAll("[data-card]"),
      duration: 0.8,
      ease: "expo.inOut",
      stagger: 0.04,
      absolute: true,
      // Yükseklik kartlar akışa döndükten sonra serbest bırakılır; önce bırakılırsa grid bir kare çöker.
      onComplete: () => {
        if (box) gsap.set(box, { clearProps: "height" });
      },
      // Elenen kartları React hemen kaldırır; yeni gelenler yukarıdan düşüp yerine oturur.
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, yPercent: -12 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: "back.out(1.4)" }),
    });
  }, [category, color]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-card]", { yPercent: 18, y: 0, opacity: 0 }, { yPercent: 0, y: 0, opacity: 1, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.15 });
      });
    },
    { scope: root },
  );

  const chip = (active: boolean) =>
    cn(
      "min-h-11 border px-3 text-small font-semibold uppercase transition-colors md:px-4",
      active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
    );

  const categories: CategoryFilter[] = ["all", "tee", "sweat", "cap"];
  const colors: ColorFilter[] = ["all", "black", "white"];

  return (
    <div ref={root}>
      {/* Mobilde iki ayrı bant: kategoriler tek satırda dört eşit kutu, aralarında üst ve alttaki gibi siyah çizgi, sonra renkler. */}
      <div role="group" aria-label={dict.shop.filterLabel} className="flex flex-col border-y border-ink md:flex-row md:items-center md:justify-between md:gap-3 md:py-4">
        <div className="grid grid-cols-4 gap-2 py-3 md:flex md:flex-wrap md:py-0">
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} className={cn(chip(category === c), "px-1 md:px-4")} onClick={() => change(() => setCategory(c))}>
              {dict.shop.categories[c]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-ink py-3 md:border-0 md:py-0">
          {colors.map((c) => (
            <button key={c} type="button" aria-pressed={color === c} className={cn(chip(color === c), "flex items-center gap-2")} onClick={() => change(() => setColor(c))}>
              {c !== "all" && <span aria-hidden className={cn("size-3 rounded-full border border-current", c === "black" ? "bg-ink" : "bg-paper")} />}
              {dict.shop.colors[c]}
            </button>
          ))}
          <span className="ml-auto pl-2 text-small whitespace-nowrap text-mute tabular-nums md:ml-2" aria-live="polite">
            {plural(visible.length, dict.shop.countOne, dict.shop.countOther)}
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-space-l text-h2 font-bold">{dict.shop.empty}</p>
      ) : (
        <div ref={grid} className="mt-space-m grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <ProductCard key={p.slug} product={p} heading="h2" preload={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
