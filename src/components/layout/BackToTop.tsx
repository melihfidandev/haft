"use client";

import { useLenis } from "./SmoothScroll";

export function BackToTop({ label }: { label: string }) {
  const lenis = useLenis();
  return (
    <button
      type="button"
      className="justify-self-end py-2 font-semibold whitespace-nowrap text-paper uppercase"
      onClick={() => {
        if (lenis.current) lenis.current.scrollTo(0, { duration: 1.6 });
        else window.scrollTo({ top: 0 });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
    >
      {label} ↑
    </button>
  );
}
