import { Badeen_Display, Geist, Geostar_Fill, Grenze } from "next/font/google";

// İki kök (app/[lang]/layout ve app/global-not-found) aynı font tanımlarını paylaşır.

// Yalnızca "HAFT." logosunda: Türkçe karakter gerekmez, latin-ext dosyası ilk yüklemede boşa inmesin.
export const badeen = Badeen_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-badeen",
  display: "swap",
});

export const geostar = Geostar_Fill({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-geostar",
  display: "swap",
});

// Başlıklar: wght ekseni 100–900, "ağırlaşan tipografi" bunun üstüne kurulu.
export const grenze = Grenze({
  subsets: ["latin", "latin-ext"],
  variable: "--font-grenze",
  display: "swap",
});

// Metin, buton, form: Grenze küçük boyutta yorucu, yanına sade bir grotesk.
export const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
});

export const fontVariables = `${badeen.variable} ${geostar.variable} ${grenze.variable} ${geist.variable}`;
