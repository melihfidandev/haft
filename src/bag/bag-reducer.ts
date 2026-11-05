import { FREE_SHIPPING_FROM, getProduct, SHIPPING_COST, type Product, type ShippingMethod } from "@/content/products";

export const MAX_QTY = 10;

/** Fiyat ve ağırlık state'te tutulmaz, katalogdan türetilir: eski localStorage verisi bozuk fiyat taşıyamaz. */
export type BagLine = { slug: string; size: string; qty: number };
export type BagState = { lines: BagLine[] };

export type BagAction =
  | { type: "add"; slug: string; size: string; qty?: number }
  | { type: "setQty"; slug: string; size: string; qty: number }
  | { type: "remove"; slug: string; size: string }
  | { type: "clear" }
  | { type: "hydrate"; state: BagState };

export const emptyBag: BagState = { lines: [] };

const same = (l: BagLine, slug: string, size: string) => l.slug === slug && l.size === size;
const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n)));

export function bagReducer(state: BagState, action: BagAction): BagState {
  switch (action.type) {
    case "add": {
      if (!isValid(action.slug, action.size)) return state;
      const qty = clamp(action.qty ?? 1);
      const existing = state.lines.find((l) => same(l, action.slug, action.size));
      if (existing) {
        return {
          lines: state.lines.map((l) => (l === existing ? { ...l, qty: clamp(l.qty + qty) } : l)),
        };
      }
      return { lines: [...state.lines, { slug: action.slug, size: action.size, qty }] };
    }
    case "setQty":
      if (action.qty <= 0) return bagReducer(state, { type: "remove", slug: action.slug, size: action.size });
      return {
        lines: state.lines.map((l) => (same(l, action.slug, action.size) ? { ...l, qty: clamp(action.qty) } : l)),
      };
    case "remove":
      return { lines: state.lines.filter((l) => !same(l, action.slug, action.size)) };
    case "clear":
      return emptyBag;
    case "hydrate":
      return sanitize(action.state);
  }
}

function isValid(slug: string, size: string) {
  const product = getProduct(slug);
  return !!product && product.sizes.includes(size) && !product.soldOut.includes(size);
}

/** Bilinmeyen ürün, geçersiz beden ya da bozuk adet içeren satırları sessizce atar. */
export function sanitize(input: unknown): BagState {
  if (!input || typeof input !== "object" || !Array.isArray((input as BagState).lines)) return emptyBag;
  const lines: BagLine[] = [];
  for (const raw of (input as BagState).lines) {
    if (!raw || typeof raw.slug !== "string" || typeof raw.size !== "string") continue;
    if (!isValid(raw.slug, raw.size) || !Number.isFinite(raw.qty) || raw.qty < 1) continue;
    lines.push({ slug: raw.slug, size: raw.size, qty: clamp(raw.qty) });
  }
  return { lines };
}

export type PricedLine = BagLine & { product: Product; total: number; weight: number };

export type BagSummary = {
  lines: PricedLine[];
  count: number;
  subtotal: number;
  weight: number;
  shipping: number;
  total: number;
  /** Ücretsiz kargoya kalan tutar; ulaşıldıysa 0. */
  toFreeShipping: number;
};

export function summarize(state: BagState, method: ShippingMethod = "standard"): BagSummary {
  const lines = state.lines.flatMap((line) => {
    const product = getProduct(line.slug);
    return product ? [{ ...line, product, total: product.price * line.qty, weight: product.weight * line.qty }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const free = subtotal >= FREE_SHIPPING_FROM;
  // Ücretsiz kargo yalnızca standart gönderimde; hızlı gönderim her zaman ücretli.
  const shipping = subtotal === 0 ? 0 : method === "standard" && free ? 0 : SHIPPING_COST[method];
  return {
    lines,
    count: lines.reduce((sum, l) => sum + l.qty, 0),
    subtotal,
    weight: lines.reduce((sum, l) => sum + l.weight, 0),
    shipping,
    total: subtotal + shipping,
    toFreeShipping: free ? 0 : FREE_SHIPPING_FROM - subtotal,
  };
}
