import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/PageTitle";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.shopTitle, description: dict.meta.shopDescription };
}

export default async function ShopPage() {
  const dict = await getDictionary();
  return (
    <div className="px-gutter pt-36 pb-space-xl md:pt-44">
      <PageTitle>{dict.shop.title}</PageTitle>
      <div className="mt-space-m">
        <ShopGrid />
      </div>
    </div>
  );
}
