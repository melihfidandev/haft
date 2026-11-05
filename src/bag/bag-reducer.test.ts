import { describe, expect, it } from "vitest";
import { bagReducer, emptyBag, MAX_QTY, sanitize, summarize, type BagState } from "./bag-reducer";

const add = (state: BagState, slug: string, size: string, qty?: number) =>
  bagReducer(state, { type: "add", slug, size, qty });

describe("bagReducer", () => {
  it("aynı ürün ve bedeni tek satırda birleştirir", () => {
    let s = add(emptyBag, "oversized-tee-white", "M");
    s = add(s, "oversized-tee-white", "M", 2);
    expect(s.lines).toEqual([{ slug: "oversized-tee-white", size: "M", qty: 3 }]);
  });

  it("farklı bedenleri ayrı satır tutar", () => {
    let s = add(emptyBag, "oversized-tee-white", "M");
    s = add(s, "oversized-tee-white", "L");
    expect(s.lines).toHaveLength(2);
  });

  it("tükenen bedeni ve bilinmeyen ürünü eklemez", () => {
    expect(add(emptyBag, "oversized-tee-white", "XS")).toBe(emptyBag);
    expect(add(emptyBag, "nope", "M")).toBe(emptyBag);
    expect(add(emptyBag, "washed-cap-black", "M")).toBe(emptyBag);
  });

  it("adedi 1 ile MAX_QTY arasında tutar", () => {
    let s = add(emptyBag, "crewneck-black", "L", 99);
    expect(s.lines[0].qty).toBe(MAX_QTY);
    s = bagReducer(s, { type: "setQty", slug: "crewneck-black", size: "L", qty: 4.6 });
    expect(s.lines[0].qty).toBe(5);
  });

  it("adet 0'a inince satırı kaldırır", () => {
    const s = add(emptyBag, "crewneck-black", "L");
    expect(bagReducer(s, { type: "setQty", slug: "crewneck-black", size: "L", qty: 0 }).lines).toEqual([]);
  });

  it("clear sepeti boşaltır", () => {
    expect(bagReducer(add(emptyBag, "crewneck-black", "L"), { type: "clear" })).toEqual(emptyBag);
  });
});

describe("sanitize", () => {
  it("bozuk localStorage verisini temizler", () => {
    expect(sanitize(null)).toEqual(emptyBag);
    expect(sanitize({ lines: "x" })).toEqual(emptyBag);
    expect(
      sanitize({
        lines: [
          { slug: "crewneck-black", size: "M", qty: 2 },
          { slug: "gone", size: "M", qty: 1 },
          { slug: "crewneck-black", size: "M", qty: Number.NaN },
          { slug: "crewneck-white", size: "S", qty: 1 },
        ],
      }),
    ).toEqual({ lines: [{ slug: "crewneck-black", size: "M", qty: 2 }] });
  });
});

describe("summarize", () => {
  it("toplamları ve ağırlığı katalogdan hesaplar", () => {
    let s = add(emptyBag, "oversized-tee-white", "M");
    s = add(s, "washed-cap-black", "OS");
    const sum = summarize(s);
    expect(sum.count).toBe(2);
    expect(sum.subtotal).toBe(12000);
    expect(sum.weight).toBe(400);
    expect(sum.shipping).toBe(800);
    expect(sum.total).toBe(12800);
    expect(sum.toFreeShipping).toBe(3000);
  });

  it("150 € üstünde standart kargo ücretsiz, hızlı kargo ücretli", () => {
    const s = add(emptyBag, "crewneck-black", "M", 2);
    expect(summarize(s, "standard").shipping).toBe(0);
    expect(summarize(s, "express").shipping).toBe(1800);
  });

  it("boş sepette kargo yok", () => {
    expect(summarize(emptyBag)).toMatchObject({ subtotal: 0, shipping: 0, total: 0, toFreeShipping: 15000 });
  });
});
