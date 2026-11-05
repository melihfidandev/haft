"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { useLenis } from "@/components/layout/SmoothScroll";
import type { ProductImage } from "@/content/products";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

type ProductLightboxProps = {
  images: ProductImage[];
  /** Açılan görselin sırası. Bileşen yalnızca önizleme açıkken çizilir. */
  index: number;
  /** Galerideki kareler (`data-zoom-source`): açılış oradan büyür, kapanış oraya küçülür. */
  gallery: RefObject<HTMLElement | null>;
  onClose: () => void;
};

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const CLICK_SCALE = 2;
const TAP_SLOP = 8;
const DOUBLE_TAP_MS = 280;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Bir öğenin ekrandaki dikdörtgenini tam ekran kutuya göre clip-path inset'ine çevirir. */
function insetFrom(el: HTMLElement | null) {
  if (!el) return "inset(50% 50% 50% 50%)";
  const r = el.getBoundingClientRect();
  return `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px)`;
}

type View = { s: number; x: number; y: number };
type Gesture =
  | { kind: "idle" }
  | { kind: "pending"; x: number; y: number }
  | { kind: "swipe"; x: number }
  | { kind: "dismiss"; y: number; dy: number }
  | { kind: "pan"; x: number; y: number; from: View }
  | { kind: "pinch"; d: number; mid: { x: number; y: number }; from: View };

/**
 * Ürün görseli önizlemesi. Native <dialog> (top layer, odak tuzağı, Esc) üstüne kendi dokunma hareketleri:
 * yana kaydırarak geçiş, iki parmakla ya da çift dokunarak yakınlaştırma, yakınken gezinme, aşağı sürükleyerek
 * kapatma, fotoğrafın dışına dokununca kapatma. Hepsi tek bir pointer akışında; tarayıcının kendi kaydırma ve
 * yakınlaştırması bu yüzden kapalı (touch-action: none), aksi halde iki parmak hareketi tarayıcıya kaçıyordu.
 */
export function ProductLightbox({ images, index, gallery, onClose }: ProductLightboxProps) {
  const { locale, dict } = useI18n();
  const lenis = useLenis();
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(index);
  const at = useRef(index);
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture>({ kind: "idle" });
  const lastTap = useRef<{ x: number; y: number; t: number } | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closing = useRef(false);

  const slide = (i: number) => track.current?.children[i] as HTMLElement | undefined;
  const frame = () => slide(at.current)?.querySelector<HTMLElement>("[data-lb-frame]") ?? null;
  const layer = () => slide(at.current)?.querySelector<HTMLElement>("[data-lb-layer]") ?? null;
  const sourceFor = (i: number) => gallery.current?.querySelectorAll<HTMLElement>("[data-zoom-source]")[i] ?? null;

  /** object-contain ile çizilen fotoğrafın çerçeve içindeki gerçek kutusu (siyah boşluklar hariç). */
  const contained = () => {
    const box = frame();
    const img = box?.querySelector("img");
    if (!box || !img?.naturalWidth) return null;
    const r = box.getBoundingClientRect();
    const fit = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const w = img.naturalWidth * fit;
    const h = img.naturalHeight * fit;
    return { box: r, w, h, left: r.left + (r.width - w) / 2, top: r.top + (r.height - h) / 2 };
  };

  /** Nokta fotoğrafın üstünde mi? Yakınken büyümüş ve kaymış haliyle ölçülür, ekranın dışı sayılmaz. */
  const onImage = (x: number, y: number) => {
    const c = contained();
    if (!c) return false;
    const { s, x: tx, y: ty } = view.current;
    const cx = c.box.left + c.box.width / 2 + tx;
    const cy = c.box.top + c.box.height / 2 + ty;
    return Math.abs(x - cx) <= (c.w * s) / 2 && Math.abs(y - cy) <= (c.h * s) / 2;
  };

  /** Masaüstünde büyüteç yalnızca fotoğrafın üstünde; siyah boşlukta (tıklayınca kapanan yer) normal imleç. */
  const updateCursor = (x: number, y: number) => {
    const surface = dialog.current?.querySelector<HTMLElement>("[data-lb-surface]");
    if (surface) surface.style.cursor = onImage(x, y) ? (view.current.s > 1 ? "zoom-out" : "zoom-in") : "";
  };

  /** Yakınken fotoğraf çerçeveden dışarı kaçmasın: kenarı ekrana değince durur. */
  const bounded = (v: View): View => {
    const c = contained();
    if (!c) return v;
    const mx = Math.max(0, (c.w * v.s - c.box.width) / 2);
    const my = Math.max(0, (c.h * v.s - c.box.height) / 2);
    return { s: v.s, x: clamp(v.x, -mx, mx), y: clamp(v.y, -my, my) };
  };

  const apply = (v: View, animate = false) => {
    view.current = v;
    const el = layer();
    if (!el) return;
    if (animate) gsap.to(el, { scale: v.s, x: v.x, y: v.y, duration: 0.55, ease: "back.out(1.2)", overwrite: true });
    else gsap.set(el, { scale: v.s, x: v.x, y: v.y, overwrite: true });
  };

  /** Hareket bitince: 1'in altına inildiyse geri yaylanır, üst sınır aşıldıysa sınıra oturur. */
  const settle = () => {
    const v = view.current;
    const next = v.s <= 1.02 ? { s: 1, x: 0, y: 0 } : bounded({ ...v, s: Math.min(v.s, MAX_SCALE) });
    apply(next, true);
  };

  /** Ekrandaki (x, y) noktası yerinde kalacak şekilde ölçek değiştirir: dokunulan yer büyür. */
  const zoomAt = (x: number, y: number, s: number) => {
    const c = contained();
    if (!c) return;
    const from = view.current;
    const px = x - (c.box.left + c.box.width / 2);
    const py = y - (c.box.top + c.box.height / 2);
    apply(bounded({ s, x: px - ((px - from.x) / from.s) * s, y: py - ((py - from.y) / from.s) * s }), !reduced());
  };

  const resetZoom = (animate: boolean) => {
    const v = view.current;
    if (v.s === 1 && !v.x && !v.y) return;
    apply({ s: 1, x: 0, y: 0 }, animate);
  };

  const place = (i: number, animate: boolean) => {
    const x = -i * window.innerWidth;
    if (animate && !reduced()) gsap.to(track.current, { x, duration: 0.7, ease: "expo.out", overwrite: true });
    else gsap.set(track.current, { x, overwrite: true });
  };

  const go = (i: number) => {
    const next = clamp(i, 0, images.length - 1);
    if (next !== at.current) {
      resetZoom(false);
      at.current = next;
      setCurrent(next);
    }
    place(next, true);
  };

  useEffect(() => {
    const el = dialog.current!;
    const scroller = lenis.current;
    el.showModal();
    scroller?.stop();
    document.documentElement.style.overflow = "hidden";
    place(index, false);

    if (!reduced()) {
      gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(slide(index)!, { clipPath: insetFrom(sourceFor(index)) }, { clipPath: "inset(0px 0px 0px 0px)", duration: 0.9, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo("[data-lb-ui]", { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.5 });
    }

    const onResize = () => {
      place(at.current, false);
      resetZoom(false);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(tapTimer.current);
      scroller?.start();
      document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca açılışta bir kez
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const done = () => {
      dialog.current?.close();
      onClose();
    };
    if (reduced()) return done();
    const el = slide(at.current);
    resetZoom(true);
    gsap.to("[data-lb-ui]", { opacity: 0, duration: 0.2 });
    gsap.to(backdrop.current, { opacity: 0, duration: 0.7, ease: "power2.inOut" });
    if (!el) return void gsap.delayedCall(0.7, done);
    gsap.to(el, {
      clipPath: insetFrom(sourceFor(at.current)),
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "expo.inOut",
      onComplete: () => {
        gsap.set(el, { clearProps: "clipPath,transform" });
        done();
      },
    });
  };

  // Dokunma ve fare tek akıştan geçer: dokunuş, kaydırma, gezinme, kapatma ya da iki parmak.

  const onTap = (x: number, y: number, mouse: boolean) => {
    if (mouse) {
      // Masaüstü: fotoğrafa tıklamak yakınlaştırır/uzaklaştırır, dışına tıklamak kapatır.
      if (!onImage(x, y)) return close();
      if (view.current.s > 1) resetZoom(true);
      else zoomAt(x, y, CLICK_SCALE);
      return updateCursor(x, y);
    }
    const prev = lastTap.current;
    const now = performance.now();
    if (prev && now - prev.t < DOUBLE_TAP_MS && Math.hypot(x - prev.x, y - prev.y) < 30) {
      clearTimeout(tapTimer.current);
      lastTap.current = null;
      if (view.current.s > 1) resetZoom(true);
      else zoomAt(x, y, DOUBLE_TAP_SCALE);
      return;
    }
    lastTap.current = { x, y, t: now };
    // Tek dokunuş, ikincisi gelmeyince işlenir; yakın değilken fotoğrafın dışına dokunmak kapatır.
    tapTimer.current = setTimeout(() => {
      if (view.current.s === 1 && !onImage(x, y)) close();
    }, DOUBLE_TAP_MS);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (closing.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const list = [...pointers.current.values()];
    if (list.length === 2) {
      clearTimeout(tapTimer.current);
      place(at.current, false);
      gesture.current = {
        kind: "pinch",
        d: Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y),
        mid: { x: (list[0].x + list[1].x) / 2, y: (list[0].y + list[1].y) / 2 },
        from: { ...view.current },
      };
    } else if (list.length === 1) {
      gesture.current = { kind: "pending", x: event.clientX, y: event.clientY };
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    const mouse = event.pointerType === "mouse";
    if (mouse) updateCursor(event.clientX, event.clientY);
    // Masaüstünde yakınken fotoğraf fareyi izler: imleç hangi kenara giderse o kenar görünür.
    if (mouse && !pointers.current.size && view.current.s > 1) {
      const c = contained();
      if (!c) return;
      const mx = Math.max(0, (c.w * view.current.s - c.box.width) / 2);
      const my = Math.max(0, (c.h * view.current.s - c.box.height) / 2);
      const fx = clamp((event.clientX - c.box.left) / c.box.width, 0, 1) * 2 - 1;
      const fy = clamp((event.clientY - c.box.top) / c.box.height, 0, 1) * 2 - 1;
      view.current = { s: view.current.s, x: -fx * mx, y: -fy * my };
      gsap.to(layer(), { x: view.current.x, y: view.current.y, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      return;
    }
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const g = gesture.current;

    if (g.kind === "pinch") {
      const list = [...pointers.current.values()];
      const c = contained();
      if (list.length < 2 || !c) return;
      const d = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
      const mid = { x: (list[0].x + list[1].x) / 2, y: (list[0].y + list[1].y) / 2 };
      const s = clamp(g.from.s * (d / g.d), 0.8, MAX_SCALE * 1.2);
      // Parmakların başladığı noktadaki fotoğraf pikseli, parmakların şimdiki ortasında kalır.
      const cx = c.box.left + c.box.width / 2;
      const cy = c.box.top + c.box.height / 2;
      const ix = (g.mid.x - cx - g.from.x) / g.from.s;
      const iy = (g.mid.y - cy - g.from.y) / g.from.s;
      apply({ s, x: mid.x - cx - ix * s, y: mid.y - cy - iy * s });
      return;
    }

    if (g.kind === "pending") {
      const dx = event.clientX - g.x;
      const dy = event.clientY - g.y;
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      clearTimeout(tapTimer.current);
      lastTap.current = null;
      // Yakınken her sürükleme gezinmedir; geçiş ve kapatma ancak normal boyda.
      if (view.current.s > 1) gesture.current = { kind: "pan", x: g.x, y: g.y, from: { ...view.current } };
      else if (Math.abs(dx) > Math.abs(dy)) gesture.current = { kind: "swipe", x: g.x };
      else if (dy > 0 && !mouse) gesture.current = { kind: "dismiss", y: g.y, dy: 0 };
      else gesture.current = { kind: "idle" };
      return;
    }

    if (g.kind === "pan") {
      apply(bounded({ s: g.from.s, x: g.from.x + event.clientX - g.x, y: g.from.y + event.clientY - g.y }));
    } else if (g.kind === "swipe") {
      let dx = event.clientX - g.x;
      // İlk ve son karede kenara doğru çekince lastik gibi direnir.
      if ((at.current === 0 && dx > 0) || (at.current === images.length - 1 && dx < 0)) dx *= 0.3;
      gsap.set(track.current, { x: -at.current * window.innerWidth + dx, overwrite: true });
    } else if (g.kind === "dismiss") {
      g.dy = Math.max(0, event.clientY - g.y);
      gsap.set(slide(at.current) ?? [], { y: g.dy, scale: 1 - g.dy / 2400 });
      gsap.set(backdrop.current, { opacity: 1 - g.dy / 500 });
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    const start = pointers.current.get(event.pointerId);
    if (!start) return;
    pointers.current.delete(event.pointerId);
    const g = gesture.current;
    const cancelled = event.type === "pointercancel";
    // İki parmaktan biri kalkınca hareket biter; kalan parmak yeni bir hareket başlatmaz.
    gesture.current = { kind: "idle" };

    if (g.kind === "pinch") settle();
    else if (g.kind === "pending" && !cancelled) onTap(start.x, start.y, event.pointerType === "mouse");
    else if (g.kind === "pan") settle();
    else if (g.kind === "swipe") {
      const dx = event.clientX - g.x;
      go(at.current + (Math.abs(dx) > window.innerWidth * 0.18 ? -Math.sign(dx) : 0));
    } else if (g.kind === "dismiss") {
      if (g.dy > 110 && !cancelled) return close();
      gsap.to(slide(at.current) ?? [], { y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)" });
      gsap.to(backdrop.current, { opacity: 1, duration: 0.4 });
    }
  };

  // Kontroller difference ile çizilir: yakınlaşan fotoğraf altlarına girse de beyaz ya da siyah zeminde okunur.
  const button = "pointer-events-auto grid size-12 place-items-center text-paper transition-opacity hover:opacity-70";

  return (
    <dialog
      ref={dialog}
      aria-label={dict.product.viewer}
      aria-describedby="lb-hint"
      className="fixed inset-0 m-0 h-lvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-paper backdrop:bg-transparent"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(at.current + 1);
        if (event.key === "ArrowLeft") go(at.current - 1);
      }}
    >
      <p id="lb-hint" className="sr-only">
        {dict.product.zoomHint}
      </p>
      <div ref={backdrop} className="absolute inset-0 bg-night" aria-hidden />
      <div
        data-lb-surface
        className="absolute inset-0 touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={track} className="flex h-full will-change-transform">
          {images.map((image, i) => (
            <div key={image.src} className="relative h-full w-screen shrink-0 overflow-hidden" aria-hidden={i !== current}>
              {/* Mobilde üstte kapat, altta sayaç için pay (beyaz zeminli fotoğrafta kaybolmasınlar); alt pay tarayıcı çubuğunu da içerir. */}
              <div data-lb-frame className="absolute inset-x-0 top-16 bottom-[calc(100lvh-100dvh+4.5rem)] md:inset-x-24 md:bottom-20">
                <div data-lb-layer className="absolute inset-0">
                  {/* Mobilde 2 kat geniş kaynak istenir: yakınlaşınca fotoğraf bulanıklaşmasın. */}
                  <Image
                    src={image.src}
                    alt={image.alt[locale]}
                    fill
                    quality={90}
                    sizes="(min-width: 768px) 100vw, 200vw"
                    draggable={false}
                    className="pointer-events-none object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div data-lb-ui className="pointer-events-none absolute inset-x-0 top-0 flex mix-blend-difference justify-end px-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button type="button" autoFocus onClick={close} className={cn(button, "text-3xl font-light")} aria-label={dict.product.closeViewer}>
          ×
        </button>
      </div>

      {images.length > 1 && (
        <div
          data-lb-ui
          className="pointer-events-none absolute inset-x-0 bottom-[calc(100lvh-100dvh)] flex items-center mix-blend-difference justify-between px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <button type="button" onClick={() => go(at.current - 1)} disabled={current === 0} className={cn(button, "text-xl disabled:opacity-0")} aria-label={dict.product.prevImage}>
            ←
          </button>
          <p className="text-small font-semibold tracking-[0.2em] tabular-nums" aria-live="polite">
            {current + 1} / {images.length}
          </p>
          <button
            type="button"
            onClick={() => go(at.current + 1)}
            disabled={current === images.length - 1}
            className={cn(button, "text-xl disabled:opacity-0")}
            aria-label={dict.product.nextImage}
          >
            →
          </button>
        </div>
      )}
    </dialog>
  );
}
