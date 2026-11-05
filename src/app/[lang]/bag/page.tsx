import type { Metadata } from "next";
import { BagView } from "@/components/checkout/BagView";
import { PageTitle } from "@/components/ui/PageTitle";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.bagTitle, robots: { index: false } };
}

export default async function BagPage() {
  const dict = await getDictionary();
  return (
    <div className="px-gutter pt-36 pb-space-xl md:pt-44">
      <PageTitle>{dict.bag.title}</PageTitle>
      <div className="mt-space-m">
        <BagView />
      </div>
    </div>
  );
}
