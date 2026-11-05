"use client";

import { SplitText } from "gsap/SplitText";
import { gsap } from "./gsap";

// Yalnızca ana sayfadaki ağırlaşan cümle kullanıyor; o sayfanın paketine girer.
gsap.registerPlugin(SplitText);

export { SplitText };
