import type { Locale } from "@/i18n/config";

type T = Record<Locale, string>;

export type Category = "tee" | "sweat" | "cap";
export type Color = "black" | "white";

export type ProductImage = { src: string; width: number; height: number; alt: T };

export type Product = {
  slug: string;
  category: Category;
  color: Color;
  /** Euro cent. */
  price: number;
  /** Kumaş ağırlığı; şapkada yok. */
  gsm: number | null;
  /** Tek parçanın yaklaşık ağırlığı; sepetin "tartısı" bunu toplar. */
  weight: number;
  sizes: string[];
  soldOut: string[];
  /** Az kalan beden ve adedi, örn. { size: "XL", left: 3 }. */
  low?: { size: string; left: number };
  name: T;
  tagline: T;
  fabric: T;
  fit: T;
  care: T;
  images: ProductImage[];
  pairs: string[];
};

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  {
    slug: "oversized-tee-white",
    category: "tee",
    color: "white",
    price: 6500,
    gsm: 320,
    weight: 290,
    sizes: APPAREL,
    soldOut: ["XS"],
    low: { size: "XL", left: 3 },
    name: { en: "Oversized Tee — White", tr: "Oversize Tişört — Beyaz" },
    tagline: {
      en: "The one we built the brand around. Dense, boxy, bright white.",
      tr: "Markayı etrafına kurduğumuz parça. Yoğun, kutu kesim, parlak beyaz.",
    },
    fabric: {
      en: "100% combed cotton single jersey, 320 g/m². Pre-washed.",
      tr: "%100 penye pamuk süprem, 320 g/m². Ön yıkamalı.",
    },
    fit: {
      en: "Oversized. Dropped shoulder, wide body, short sleeve that lands at the elbow. Take your usual size.",
      tr: "Oversize. Düşük omuz, geniş gövde, dirseğe inen kol. Her zamanki bedenini al.",
    },
    care: {
      en: "Wash cold, inside out. Dry flat. Do not tumble dry.",
      tr: "Soğuk suda, ters yüz yıka. Serip kurut. Kurutma makinesine atma.",
    },
    images: [
      {
        src: "/images/products/tee-white-hanger.jpg",
        width: 1400,
        height: 2061,
        alt: { en: "White oversized tee on a hanger", tr: "Askıda beyaz oversize tişört" },
      },
      {
        src: "/images/cloth/white-fold.jpg",
        width: 1400,
        height: 933,
        alt: { en: "Close-up of the white jersey fold", tr: "Beyaz süprem kumaşın kıvrımı, yakın plan" },
      },
    ],
    pairs: ["crewneck-black", "washed-cap-black"],
  },
  {
    slug: "heavy-tee-2-pack-black",
    category: "tee",
    color: "black",
    price: 11000,
    gsm: 320,
    weight: 580,
    sizes: APPAREL,
    soldOut: [],
    low: { size: "S", left: 2 },
    name: { en: "Heavy Tee 2-Pack — Black", tr: "Ağır Tişört İkili Paket — Siyah" },
    tagline: {
      en: "Two black tees, because you will wear the first one out of rotation.",
      tr: "İki siyah tişört; çünkü ilkini çıkarmak istemeyeceksin.",
    },
    fabric: {
      en: "100% combed cotton single jersey, 320 g/m². Garment dyed black.",
      tr: "%100 penye pamuk süprem, 320 g/m². Parça boyalı siyah.",
    },
    fit: {
      en: "Relaxed and boxy, slightly shorter in the body than the oversized tee.",
      tr: "Rahat ve kutu kesim; gövdesi oversize tişörtten biraz daha kısa.",
    },
    care: {
      en: "Wash cold with darks, inside out. Dry flat.",
      tr: "Koyularla soğuk suda, ters yüz yıka. Serip kurut.",
    },
    images: [
      {
        src: "/images/products/tee-black-pair.jpg",
        width: 2800,
        height: 1400,
        alt: { en: "Two black tees hanging side by side", tr: "Yan yana asılı iki siyah tişört" },
      },
      {
        src: "/images/cloth/black-tee-window.jpg",
        width: 1400,
        height: 933,
        alt: { en: "Black tee on a hanger in window light", tr: "Pencere ışığında askıda siyah tişört" },
      },
    ],
    pairs: ["oversized-tee-white", "crewneck-black"],
  },
  {
    slug: "crewneck-black",
    category: "sweat",
    color: "black",
    price: 14000,
    gsm: 480,
    weight: 720,
    sizes: APPAREL,
    soldOut: ["XXL"],
    name: { en: "Crewneck — Black", tr: "Sweat — Siyah" },
    tagline: {
      en: "480 grams of brushed cotton. It stands up on its own, almost.",
      tr: "480 gram şardonlu pamuk. Neredeyse kendi başına ayakta duruyor.",
    },
    fabric: {
      en: "100% cotton loopback, brushed inside, 480 g/m².",
      tr: "%100 pamuk, iç yüzü şardonlu, 480 g/m².",
    },
    fit: {
      en: "Relaxed with a dropped shoulder. Ribbed cuffs and hem gather the volume.",
      tr: "Rahat kesim, düşük omuz. Ribanalı kol ağzı ve etek hacmi toplar.",
    },
    care: {
      en: "Wash cold, inside out. Dry flat to keep the fleece soft.",
      tr: "Soğuk suda, ters yüz yıka. Şardon yumuşak kalsın diye serip kurut.",
    },
    images: [
      {
        src: "/images/products/sweat-black-single.jpg",
        width: 1210,
        height: 2410,
        alt: { en: "Black crewneck on a wooden hanger", tr: "Ahşap askıda siyah sweat" },
      },
      {
        src: "/images/cloth/black-rack.jpg",
        width: 1400,
        height: 2132,
        alt: { en: "A rail of black crewnecks", tr: "Askılıkta sıra sıra siyah sweatler" },
      },
    ],
    pairs: ["crewneck-white", "heavy-tee-2-pack-black"],
  },
  {
    slug: "crewneck-white",
    category: "sweat",
    color: "white",
    price: 14000,
    gsm: 480,
    weight: 720,
    sizes: APPAREL,
    soldOut: ["XS", "S"],
    low: { size: "M", left: 1 },
    name: { en: "Crewneck — White", tr: "Sweat — Beyaz" },
    tagline: {
      en: "The same heavy crewneck in optic white. Brave, and worth it.",
      tr: "Aynı ağır sweat, optik beyaz. Cesaret ister, değer.",
    },
    fabric: {
      en: "100% cotton loopback, brushed inside, 480 g/m².",
      tr: "%100 pamuk, iç yüzü şardonlu, 480 g/m².",
    },
    fit: {
      en: "Relaxed with a dropped shoulder. Ribbed cuffs and hem gather the volume.",
      tr: "Rahat kesim, düşük omuz. Ribanalı kol ağzı ve etek hacmi toplar.",
    },
    care: {
      en: "Wash cold with whites. Dry flat. No bleach.",
      tr: "Beyazlarla soğuk suda yıka. Serip kurut. Çamaşır suyu kullanma.",
    },
    images: [
      {
        src: "/images/products/sweat-white-flat.jpg",
        width: 1400,
        height: 1052,
        alt: { en: "White crewneck laid flat", tr: "Düz serilmiş beyaz sweat" },
      },
      {
        src: "/images/cloth/collar-detail.jpg",
        width: 1400,
        height: 2099,
        alt: { en: "Close-up of a ribbed crewneck collar", tr: "Ribanalı sweat yakası, yakın plan" },
      },
    ],
    pairs: ["crewneck-black", "oversized-tee-white"],
  },
  {
    slug: "washed-cap-black",
    category: "cap",
    color: "black",
    price: 5500,
    gsm: null,
    weight: 110,
    sizes: ["OS"],
    soldOut: [],
    name: { en: "Washed Cap — Black", tr: "Yıkanmış Şapka — Siyah" },
    tagline: {
      en: "Six panels of heavy twill, washed until it looks like you have had it for years.",
      tr: "Altı panel ağır twill; yıllardır seninmiş gibi görünene kadar yıkandı.",
    },
    fabric: {
      en: "100% cotton twill, enzyme washed. Tonal embroidery on the front.",
      tr: "%100 pamuk twill, enzim yıkamalı. Önde ton sür ton nakış.",
    },
    fit: {
      en: "Unstructured six-panel. Adjustable strap at the back.",
      tr: "Yumuşak altı panel. Arkada ayarlanabilir kayış.",
    },
    care: {
      en: "Hand wash cold. Reshape and air dry.",
      tr: "Soğuk suda elde yıka. Şekil verip havada kurut.",
    },
    images: [
      {
        src: "/images/products/cap-washed.jpg",
        width: 1400,
        height: 933,
        alt: { en: "Washed black six-panel cap", tr: "Yıkanmış siyah altı panel şapka" },
      },
      {
        src: "/images/cloth/black-hem.jpg",
        width: 1400,
        height: 933,
        alt: { en: "Close-up of a black stitched hem", tr: "Siyah dikişli etek, yakın plan" },
      },
    ],
    pairs: ["heavy-tee-2-pack-black", "oversized-tee-white"],
  },
];

const bySlug = new Map(products.map((p) => [p.slug, p]));
export const getProduct = (slug: string) => bySlug.get(slug);

export const FREE_SHIPPING_FROM = 15000;
export const SHIPPING_COST = { standard: 800, express: 1800 } as const;
export type ShippingMethod = keyof typeof SHIPPING_COST;
