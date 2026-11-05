import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductBuy } from "@/components/shop/ProductBuy";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { SpecAccordion } from "@/components/shop/SpecAccordion";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { getProduct, products } from "@/content/products";
import { fill } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { formatMoney } from "@/lib/format";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const locale = await getLocale();
  return {
    title: `${product.name[locale]} — HAFT.`,
    description: product.tagline[locale],
    openGraph: { images: [{ url: product.images[0].src }] },
  };
}

// params Suspense içinde okunur: Next anlık gezinme için kabuğu hemen gösterebilsin.
// Bütün slug'lar generateStaticParams ile önceden üretildiği için içerik yine statik gelir.
export default function ProductPage({ params }: PageProps<"/[lang]/shop/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/[lang]/shop/[slug]">["params"] }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const locale = await getLocale();
  const dict = await getDictionary();
  const pairs = product.pairs.map(getProduct).filter((p) => p !== undefined);
  const inStock = product.sizes.some((s) => !product.soldOut.includes(s));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: product.tagline[locale],
    image: product.images.map((i) => i.src),
    brand: { "@type": "Brand", name: "HAFT." },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.price / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const specs = [
    { label: dict.product.fabric, text: product.fabric[locale] },
    { label: dict.product.fit, text: product.fit[locale] },
    { label: dict.product.care, text: product.care[locale] },
  ];

  return (
    <div className="px-gutter pt-28 pb-space-l md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <TransitionLink href={`/${locale}/shop`} className="split mb-6 inline-block text-small font-semibold uppercase" data-text={`← ${dict.product.back}`}>
        ← {dict.product.back}
      </TransitionLink>

      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        {/* min-w-0: yatay kaydırmalı galeri grid sütununu kendi genişliğine büyütmesin (mobil taşma). */}
        <div className="min-w-0 md:col-span-7">
          <ProductGallery product={product} />
        </div>

        <div className="min-w-0 md:col-span-5">
          <div className="flex flex-col gap-8 md:sticky md:top-28">
            <div>
              <h1 className="font-display text-[clamp(2.25rem,1rem+3.2vw,5.25rem)] leading-[0.88] font-black tracking-[-0.01em] uppercase lang-tr:leading-[1.02] [overflow-wrap:anywhere]">
                {product.name[locale]}
              </h1>
              <p className="mt-4 text-lead">{formatMoney(product.price, locale)}</p>
              <p className="mt-4 max-w-[40ch] text-mute">{product.tagline[locale]}</p>
            </div>

            <dl className="grid grid-cols-2 border-y border-ink">
              <div className="border-r border-ink py-4 pr-4">
                <dt className="text-small font-semibold text-mute uppercase">{dict.product.weight}</dt>
                <dd className="mt-2 flex items-baseline gap-1.5">
                  {product.gsm ? (
                    <>
                      <span className="font-figure text-h1 leading-none">{product.gsm}</span>
                      <span className="text-small font-semibold">{dict.units.gsm}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-figure text-h1 leading-none">6</span>
                      <span className="text-small font-semibold">{dict.units.panels}</span>
                    </>
                  )}
                </dd>
              </div>
              <div className="py-4 pl-4">
                <dt className="text-small font-semibold text-mute uppercase">{dict.bag.weighs}</dt>
                <dd className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-figure text-h1 leading-none">{product.weight}</span>
                  <span className="text-small font-semibold">{dict.units.g}</span>
                </dd>
              </div>
            </dl>

            <ProductBuy product={product} />

            <SpecAccordion items={specs} />
            <p className="text-small text-mute">{fill(dict.product.pieceWeight, { g: product.weight })}</p>
          </div>
        </div>
      </div>

      {pairs.length > 0 && (
        <section className="mt-space-xl border-t border-ink pt-space-m" aria-labelledby="pairs-title">
          <h2 id="pairs-title" className="font-display text-h2 font-black tracking-tight uppercase">
            {dict.product.pairs}
          </h2>
          <div className="mt-space-m grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:w-2/3">
            {pairs.map((p) => (
              <ProductCard key={p.slug} product={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
