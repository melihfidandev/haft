"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Her sayfada gereken çekirdek burada; bileşenler gsap'i yalnızca bu dosyadan alır.
// Tek bileşenin kullandığı eklentiler (SplitText, Flip) kendi dosyalarında kayıtlıdır: her sayfanın ilk
// yüklemesine binmesinler (mobil Lighthouse'ta JS'in bitişi LCP'yi belirliyor).
gsap.registerPlugin(useGSAP, ScrollTrigger);

// "Ağırlık" hareket kimliği: yerine oturan, tok hareketler.
gsap.defaults({ ease: "power4.out", duration: 1.1 });

export { gsap, ScrollTrigger, useGSAP };

export const motionQuery = {
  full: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;
