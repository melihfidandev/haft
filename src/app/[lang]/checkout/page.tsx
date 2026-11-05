import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PageTitle } from "@/components/ui/PageTitle";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.checkoutTitle, robots: { index: false } };
}

export default async function CheckoutPage() {
  const dict = await getDictionary();
  return (
    <div className="px-gutter pt-36 pb-space-xl md:pt-44">
      <PageTitle>{dict.checkout.title}</PageTitle>
      <div className="mt-space-m">
        <CheckoutForm />
      </div>
    </div>
  );
}
