import type { Metadata, Viewport } from "next";
import { BagProvider } from "@/bag/bag-context";
import { BagDrawer } from "@/components/layout/BagDrawer";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Preloader } from "@/components/layout/Preloader";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/provider";
import { fontVariables } from "../fonts";
import "../globals.css";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const locale = await getLocale();
  return {
    metadataBase: new URL("https://haft.example"),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { languages: { en: "/en", tr: "/tr" } },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === "tr" ? "tr_TR" : "en_IE",
      images: [{ url: "/images/hero/hero-motion.jpg", width: 1672, height: 941 }],
    },
  };
}

// cover: sayfa iPhone'da saat/pil şeridinin arkasına da çizilir; açık sepetin beyaz zemini oraya kadar uzanır.
// Kenar boşlukları header ve çekmecede env(safe-area-inset-*) ile zaten korunuyor.
export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  viewportFit: "cover",
};

// Preloader oturumda bir kez oynar. Sayfa çizilmeden önce işaretlenir ki dönüş ziyaretinde siyah perde yanıp sönmesin.
const introScript = `try{if(sessionStorage.getItem("haft-intro"))document.documentElement.dataset.intro="done"}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <html
      lang={locale}
      // Sayfanın en arka zemini gece: hero ve footer koyu; mobilde esnetince ve Safari'nin çubuğunun arkasında beyaz görünmesin.
      className={`${fontVariables} bg-night`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="grain min-h-svh bg-paper text-ink">
        <I18nProvider locale={locale} dict={dict}>
          <BagProvider>
            <a
              href="#main"
              className="fixed top-2 left-2 z-[100] -translate-y-[200%] bg-ink px-4 py-3 text-small text-paper focus:translate-y-0"
            >
              {dict.nav.skip}
            </a>
            <SmoothScroll>
              <PageTransition>
                <Header />
                <main id="main">{children}</main>
                <Footer />
                <BagDrawer />
              </PageTransition>
            </SmoothScroll>
            <Cursor />
            <Preloader />
          </BagProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
