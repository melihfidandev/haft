import type { BagLine } from "@/bag/bag-reducer";
import type { ShippingMethod } from "@/content/products";

export type PlacedOrder = {
  id: string;
  lines: BagLine[];
  method: ShippingMethod;
  subtotal: number;
  shipping: number;
  total: number;
  weight: number;
  name: string;
};

// Sunucu yok: siparişler verildikleri sekmede tutulur ve sekme kapanınca silinir.
// Her siparişin kendi adresi (/order/HAFT-1234) olduğu için oturumdaki son birkaç sipariş saklanır.
const KEY = "haft-orders";
const KEEP = 5;

/** Proxy ve sayfa aynı biçimi kabul eder: HAFT- ve en az 4 rakam. */
export const ORDER_ID = /^HAFT-\d{4,}$/;

// useSyncExternalStore aynı veri için aynı referansı ister; ham metne göre önbelleklenir.
let cache: { raw: string | null; orders: PlacedOrder[] } = { raw: null, orders: [] };

function readAll(): PlacedOrder[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, orders: raw ? (JSON.parse(raw) as PlacedOrder[]) : [] };
    return cache.orders;
  } catch {
    return [];
  }
}

export function saveOrder(order: PlacedOrder) {
  try {
    const rest = readAll().filter((o) => o.id !== order.id);
    sessionStorage.setItem(KEY, JSON.stringify([order, ...rest].slice(0, KEEP)));
  } catch {
    // Depolama kapalıysa onay sayfası "bu cihazda yok" der; akış yine bozulmaz.
  }
}

/** Adresteki numaraya ait sipariş; bu sekmede verilmediyse null. */
export const readOrder = (id: string) => readAll().find((o) => o.id === id) ?? null;

/** Oturumdaki en son sipariş (numarasız /order adresi buna yönlenir). */
export const lastOrder = () => readAll()[0] ?? null;

/** HAFT-4 haneli numara; oturumdaki siparişlerle çakışmaz. */
export function newOrderId() {
  const taken = new Set(readAll().map((o) => o.id));
  let id: string;
  do id = `HAFT-${Math.floor(1000 + Math.random() * 9000)}`;
  while (taken.has(id));
  return id;
}
