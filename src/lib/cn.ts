import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Özel @theme boyutlarını (text-small, text-h1…) tanıtmazsak tailwind-merge onları
// text-paper gibi renk sınıflarıyla çakışıyor sanıp siler.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["mega", "display", "h1", "h2", "lead", "body", "small"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
