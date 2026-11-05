import type { Metadata } from "next";
import Link from "next/link";
import { Cursor } from "@/components/layout/Cursor";
import { Logo } from "@/components/ui/Logo";
import { Weightless } from "@/components/ui/Weightless";
import { localeCookie } from "@/i18n/config";
import en from "@/i18n/dictionaries/en";
import tr from "@/i18n/dictionaries/tr";
import { fontVariables } from "./fonts";
import "./globals.css";

// Başlık burada verilmez: Next metadata başlığını hydration sonrası yeniden yazıp seçilen dili eziyordu.
// Sekme başlığını görünen dile göre Weightless koyar.
export const metadata: Metadata = {
  robots: { index: false },
};

/**
 * Sayfa statik olduğu için dili sunucuda bilemez. Boyamadan önce çalışan bu script dili adresin ilk parçasından,
 * yoksa kayıtlı çerezden okur ve <html>'e yazar; CSS yalnızca o dilin parçalarını gösterir. JS yoksa İngilizce kalır.
 */
const pickLocale = `(function(){try{var s=location.pathname.split("/")[1];if(s!=="en"&&s!=="tr"){var m=document.cookie.match(/(?:^|; )${localeCookie}=(en|tr)/);s=m?m[1]:"en"}var d=document.documentElement;d.lang=s;d.dataset.locale=s;document.title=s==="tr"?${JSON.stringify(tr.meta.notFoundTitle)}:${JSON.stringify(en.meta.notFoundTitle)}}catch(e){}})()`;

// Varsayılan İngilizce; Türkçe seçilince roller yer değiştirir.
const onlyStyles = `[data-only="tr"]{display:none}html[data-locale="tr"] [data-only="tr"]{display:revert}html[data-locale="tr"] [data-only="en"]{display:none}html[data-locale="tr"] [data-lang-link="en"],html:not([data-locale="tr"]) [data-lang-link="tr"]{opacity:.45}`;

/** Eşleşmeyen her adres buraya düşer: statik, gerçek 404 kodlu, layout'tan bağımsız. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: pickLocale }} />
        <style dangerouslySetInnerHTML={{ __html: onlyStyles }} />
      </head>
      <body className="grain min-h-svh bg-paper text-ink">
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-gutter pt-4 pb-4">
          {(["en", "tr"] as const).map((lang) => (
            <Link key={lang} href={`/${lang}`} data-only={lang} className="text-[1.6rem] md:text-[2rem]" aria-label="HAFT.">
              <Logo />
            </Link>
          ))}
          <nav className="flex gap-4 text-small font-semibold uppercase" aria-label="Language">
            <Link href="/en" hrefLang="en" data-lang-link="en" className="py-2">
              EN
            </Link>
            <Link href="/tr" hrefLang="tr" data-lang-link="tr" className="py-2">
              TR
            </Link>
          </nav>
        </header>
        <main>
          <Weightless
            lines={[
              { lang: "en", title: en.notFound.title, text: en.notFound.text, cta: en.notFound.cta, href: "/en", pageTitle: en.meta.notFoundTitle },
              { lang: "tr", title: tr.notFound.title, text: tr.notFound.text, cta: tr.notFound.cta, href: "/tr", pageTitle: tr.meta.notFoundTitle },
            ]}
          />
        </main>
        <Cursor />
      </body>
    </html>
  );
}
