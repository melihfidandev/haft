import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.orderTitle, robots: { index: false } };
}

export default function OrderPage() {
  return (
    <div className="px-gutter pt-36 pb-space-xl md:pt-44">
      <OrderConfirmation />
    </div>
  );
}
