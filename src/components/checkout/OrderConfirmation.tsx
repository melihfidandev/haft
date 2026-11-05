"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Price, Weight } from "@/components/ui/Figures";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { getProduct } from "@/content/products";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { lastOrder, readOrder, type PlacedOrder } from "@/lib/order";

const noopSubscribe = () => () => {};

/**
 * Sipariş onayı. `/order/HAFT-1234` adresi gerçek bir mağazadaki gibi görünür ama veri sunucuda değil, bu sekmede:
 * numara burada yoksa (başka cihaz, kapanmış sekme, uydurma numara) bunu dürüstçe söyleyen bir ekran çıkar.
 * Numarasız `/order` en son siparişe yönlenir.
 */
export function OrderConfirmation({ id }: { id?: string }) {
  const { locale, dict } = useI18n();
  const t = dict.order;
  const router = useRouter();
  // sessionStorage yalnızca istemcide okunabilir; sunucuda "henüz bilinmiyor" (undefined).
  const order = useSyncExternalStore<PlacedOrder | null | undefined>(
    noopSubscribe,
    () => (id ? readOrder(id) : lastOrder()),
    () => undefined,
  );
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id && order) router.replace(`/${locale}/order/${order.id}`);
  }, [id, order, locale, router]);

  useGSAP(
    () => {
      if (order === undefined || (!id && order)) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-order-line] > span", { yPercent: 110, y: 0 });
        return onIntroDone(() => {
          const tl = gsap
            .timeline({ delay: 0.15 })
            .to("[data-order-line] > span", { yPercent: 0, y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" })
            .fromTo("[data-order-meta]", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 }, 0.6);
          // Ağırlık yalnızca bulunan siparişte var; "bu cihazda yok" ekranında tartı boş kalır.
          if (order) tl.fromTo("[data-order-weight]", { yPercent: -120, y: 0, opacity: 0 }, { yPercent: 0, y: 0, opacity: 1, duration: 1.1, ease: "bounce.out" }, 0.4);
        });
      });
    },
    { scope: root, dependencies: [order, id] },
  );

  if (order === undefined || (!id && order)) return <div className="min-h-[60svh]" aria-busy="true" />;

  if (!order) {
    // Numara var ama bu sekmede değil: başlık onay sayfasıyla aynı dilde düşer, numara açıkça yazılır.
    return (
      <div ref={root} className="flex min-h-[60svh] flex-col items-start justify-center">
        <h1 className="font-display text-display leading-[0.84] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02]">
          {(id ? t.notHere : t.missing).split(" ").map((word, i) => (
            <span key={i} data-order-line className="mask-line inline-block pr-[0.22em] align-top">
              <span className="inline-block">{word}</span>
            </span>
          ))}
        </h1>
        {id && (
          <p data-order-meta className="mt-space-s max-w-[52ch] text-lead text-mute">
            {t.notHereText.split("{id}").map((part, i) => (
              <span key={i}>
                {i > 0 && <strong className="font-bold text-ink">{id}</strong>}
                {part}
              </span>
            ))}
          </p>
        )}
        <TransitionLink data-order-meta href={`/${locale}/shop`} className="mt-space-s inline-block border-b-2 border-ink pb-1 font-semibold uppercase">
          {t.back} →
        </TransitionLink>
      </div>
    );
  }

  return (
    <div ref={root}>
      <h1 className="font-display text-display leading-[0.84] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02]">
        {t.title.split(" ").map((word, i) => (
          <span key={i} data-order-line className="mask-line inline-block pr-[0.22em] align-top">
            <span className="inline-block">{word}</span>
          </span>
        ))}
      </h1>

      <div className="mt-space-m grid gap-10 border-t border-ink pt-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <p data-order-meta className="text-small font-semibold text-mute uppercase">{t.weight}</p>
          <p data-order-weight className="mt-2">
            <Weight grams={order.weight} figure className="text-display leading-none" />
          </p>
        </div>
        <div className="space-y-6 md:col-span-7">
          <p data-order-meta className="text-lead">
            {t.number} <strong className="font-bold tracking-wide">{order.id}</strong>
          </p>
          <p data-order-meta className="max-w-[44ch] text-mute">{t.thanks}</p>
          <ul data-order-meta className="divide-y divide-line border-y border-line text-small">
            {order.lines.map((line) => {
              const product = getProduct(line.slug);
              if (!product) return null;
              return (
                <li key={`${line.slug}-${line.size}`} className="flex justify-between gap-4 py-3">
                  <span>
                    {line.qty} × {product.name[locale]} · {line.size === "OS" ? dict.product.oneSize : line.size}
                  </span>
                  <Price cents={product.price * line.qty} />
                </li>
              );
            })}
            <li className="flex justify-between gap-4 py-3 font-semibold">
              <span>{dict.bag.total}</span>
              <Price cents={order.total} />
            </li>
          </ul>
          <TransitionLink data-order-meta href={`/${locale}/shop`} className="inline-block border-b-2 border-ink pb-1 font-semibold uppercase">
            {t.back} →
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
