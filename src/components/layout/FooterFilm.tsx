"use client";

import { useEffect, useRef } from "react";

const POSTER = "/video/haft-loop-poster.jpg";

/**
 * Logo filmi: yalnızca görünürken yüklenir ve oynar. Hareketi azaltan kullanıcıya poster karesi.
 * Poster de footer'a yaklaşınca verilir: `poster` niteliği HTML'de olsaydı her sayfada en baştan indirilir,
 * yavaş mobil bağlantıda sayfanın asıl görselleriyle yarışırdı (Lighthouse).
 * Video dekoratif; kontrol ve ses yok.
 *
 * Kaynak, görünür olduğu anda doğrudan `src` ile verilir ve hemen `play()` çağrılır. Önceki sürümde kaynaklar
 * React render'ıyla sonradan ekleniyordu; `play()` kaynaksız videoya düşüp sessizce başarısız oluyor,
 * gözlemci tekrar tetiklenmediği için video hiç başlamıyordu.
 */
export function FooterFilm() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");

    // React, sunucuda çizilen <video>'da `muted`'ı özellik olarak garanti etmiyor; sessiz değilse tarayıcı otomatik oynatmayı reddeder.
    el.muted = true;

    const play = () => {
      if (reduce.matches) return;
      if (!el.getAttribute("src")) {
        el.src = small.matches ? "/video/haft-loop-640.mp4" : "/video/haft-loop-960.mp4";
      }
      el.play().catch(() => {
        // Tarayıcı veri gelmeden oynatmayı reddederse, yeterli veri gelince bir kez daha denenir.
        el.addEventListener("canplay", () => el.play().catch(() => {}), { once: true });
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : el.pause()),
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    // Poster bir ekran önceden yüklenir; video gelene kadar footer boş görünmesin.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.poster = POSTER;
        near.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(el);
    // Sekme arka plana gidip dönünce tarayıcı videoyu durdurabiliyor; görünürken geri başlat.
    const onVisibility = () => {
      if (document.visibilityState === "visible" && el.getBoundingClientRect().top < window.innerHeight) play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      near.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <video
      ref={video}
      aria-hidden
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 size-full object-cover"
    />
  );
}
