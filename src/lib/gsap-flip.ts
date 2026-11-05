"use client";

import { Flip } from "gsap/Flip";
import { gsap } from "./gsap";

// Yalnızca mağaza filtresi kullanıyor; o sayfanın paketine girer.
gsap.registerPlugin(Flip);

export { Flip };
