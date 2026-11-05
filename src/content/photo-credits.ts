export type PhotoCredit = { author: string; source: "Unsplash" | "Pexels"; url: string };

/**
 * Ürün ve kumaş fotoğraflarının atıfları; fotoğrafın üstünde gösterilir (ayrı bir atıf sayfası yok).
 * Hero ve editoryal kareler site sahibinin, atıf gerekmez.
 */
const credits: Record<string, PhotoCredit> = {
  "/images/products/tee-white-hanger.jpg": { author: "Dayong Tien", source: "Pexels", url: "https://www.pexels.com/photo/18257675/" },
  "/images/products/tee-black-pair.jpg": { author: "Unsplash", source: "Unsplash", url: "https://unsplash.com/photos/iiqg2xbmvk0" },
  "/images/products/sweat-black-single.jpg": { author: "Ryan Hoffman", source: "Unsplash", url: "https://unsplash.com/photos/Cs4GVbMqKGY" },
  "/images/products/sweat-white-flat.jpg": { author: "Mediamodifier", source: "Unsplash", url: "https://unsplash.com/photos/7cERndkOyDw" },
  "/images/products/cap-washed.jpg": { author: "Unsplash", source: "Unsplash", url: "https://unsplash.com/photos/2loKxdi6Hmo" },
  "/images/cloth/white-fold.jpg": { author: "Or Hakim", source: "Unsplash", url: "https://unsplash.com/photos/6sGz7mHH6Dg" },
  "/images/cloth/black-hem.jpg": { author: "Or Hakim", source: "Unsplash", url: "https://unsplash.com/photos/RKcQbvhqgTU" },
  "/images/cloth/black-tee-window.jpg": { author: "Anna Nekrashevich", source: "Pexels", url: "https://www.pexels.com/photo/8532616/" },
  "/images/cloth/black-rack.jpg": { author: "Tobias van Schneider", source: "Unsplash", url: "https://unsplash.com/photos/gCeCpP15V1o" },
  "/images/cloth/collar-detail.jpg": { author: "Pexels", source: "Pexels", url: "https://www.pexels.com/photo/9594089/" },
};

export function creditFor(src: string): PhotoCredit | undefined {
  return credits[src];
}
