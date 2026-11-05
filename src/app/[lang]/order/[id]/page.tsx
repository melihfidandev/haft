import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.orderTitle, robots: { index: false } };
}

/** Numara isteğe göre okunur (cacheComponents): sayfa iskeleti statik, numaralı içerik Suspense içinde gelir. */
async function Order({ params }: { params: PageProps<"/[lang]/order/[id]">["params"] }) {
  const { id } = await params;
  return <OrderConfirmation id={id} />;
}

export default function OrderByIdPage({ params }: PageProps<"/[lang]/order/[id]">) {
  return (
    <div className="px-gutter pt-36 pb-space-xl md:pt-44">
      <Suspense fallback={<div className="min-h-[60svh]" aria-busy="true" />}>
        <Order params={params} />
      </Suspense>
    </div>
  );
}
