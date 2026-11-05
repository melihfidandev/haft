import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/content/products";
import { ORDER_ID } from "@/lib/order";
import { defaultLocale, hasLocale, localeCookie, type Locale } from "@/i18n/config";

const SLUGS = new Set(products.map((p) => p.slug));
const PAGES = new Set(["", "shop", "bag", "checkout", "order"]);

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(localeCookie)?.value;
  if (hasLocale(saved)) return saved;
  // İki dil için tam bir eşleştirici gereksiz: Türkçe öncelikliyse tr, değilse en.
  const header = request.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("tr") ? "tr" : defaultLocale;
}

/** `/en/shop/x` → ["shop", "x"] gibi dil sonrası parçalar bilinen bir sayfaya karşılık geliyor mu? */
function isKnownRoute(rest: string[]) {
  if (rest.length === 0) return true;
  if (rest.length === 1) return PAGES.has(rest[0]);
  if (rest.length !== 2) return false;
  // Sipariş numarası biçimi doğruysa sayfa açılır; numara bu cihazda yoksa sayfa kendisi söyler.
  return (rest[0] === "shop" && SLUGS.has(rest[1])) || (rest[0] === "order" && ORDER_ID.test(rest[1]));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, segment, ...rest] = pathname.split("/");
  const parts = rest.filter(Boolean);

  if (!hasLocale(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Tanımsız adres (bilinmeyen ürün dahil): hiçbir rotayla eşleşmeyen bir yola rewrite edilir,
  // böylece Next global-not-found sayfasını gerçek 404 koduyla sunar; adres çubuğu değişmez.
  // (cacheComponents açıkken rota içinden notFound() atmak layout'suz bir hata kabuğu üretiyordu.)
  if (!isKnownRoute(parts)) {
    const url = request.nextUrl.clone();
    url.pathname = "/_haft/not-found";
    return NextResponse.rewrite(url);
  }
}

export const config = {
  // Next iç yolları, statik dosyalar ve uzantılı her şey hariç.
  matcher: ["/((?!_next|api|images|video|.*\\..*).*)"],
};
