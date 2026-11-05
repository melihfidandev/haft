import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Telefondan yerel ağ üzerinden test: dev sunucusu başka kökenden gelen istekleri varsayılan olarak engelliyor.
  // Yerel IP repoya girmesin diye .env.local'deki DEV_ORIGINS'ten okunur.
  allowedDevOrigins: ["*.local", ...(process.env.DEV_ORIGINS?.split(",").filter(Boolean) ?? [])],
  partialPrefetching: true,
  experimental: {
    // Eşleşmeyen her adres statik, iki dilli ve gerçek 404 kodlu app/global-not-found.tsx'e düşer.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16'da zorunlu izin listesi: 75 genel, 90 hero ve ürün detayı için.
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
