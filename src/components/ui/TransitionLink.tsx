"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useTransitionNavigate } from "@/components/layout/PageTransition";
import { useLenis } from "@/components/layout/SmoothScroll";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** İç bağlantılar için: tıklamada sayfa geçiş perdesini oynatır, sonra yönlendirir. */
export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const navigate = useTransitionNavigate();
  const lenis = useLenis();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Yeni sekme, indirme gibi tarayıcı davranışlarına dokunma.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Zaten bu sayfadaysak (ör. ana sayfada logoya basmak) perde yerine ağırca en üste çıkılır.
    const target = new URL(href, window.location.href);
    if (target.pathname === window.location.pathname && !target.hash) {
      if (lenis.current) lenis.current.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0 });
      return;
    }
    navigate(href);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
