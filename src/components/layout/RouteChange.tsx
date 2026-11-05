"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, type ReactNode } from "react";

/*
 * cacheComponents açıkken usePathname, önceden üretilemeyen rotalarda (/[lang]/[...rest]) prerender'ı bloklar.
 * Next'in önerisi: rotayı okuyan kısmı en küçük yaprağa indirip <Suspense> ile sarmak.
 * Bu dosyadaki iki yaprak bunu tek yerde yapar; layout'un geri kalanı statik kalır.
 */

function Watcher({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  const callback = useRef(onChange);
  const previous = useRef(pathname);

  useEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    if (pathname === previous.current) return;
    previous.current = pathname;
    callback.current(pathname);
  }, [pathname]);

  return null;
}

/** Rota değişince (ilk yükleme hariç) çağrılır. */
export function RouteChange({ onChange }: { onChange: (pathname: string) => void }) {
  return (
    <Suspense fallback={null}>
      <Watcher onChange={onChange} />
    </Suspense>
  );
}

function Reader({ children }: { children: (pathname: string | null) => ReactNode }) {
  return children(usePathname());
}

/** Geçerli yolu render'da okur; prerender sırasında bilinmiyorsa `null` ile çizer. */
export function WithPathname({ children }: { children: (pathname: string | null) => ReactNode }) {
  return (
    <Suspense fallback={children(null)}>
      <Reader>{children}</Reader>
    </Suspense>
  );
}
