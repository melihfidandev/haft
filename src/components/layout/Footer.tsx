import { TransitionLink } from "@/components/ui/TransitionLink";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { BackToTop } from "./BackToTop";
import { FooterFilm } from "./FooterFilm";
import { LocaleSwitch } from "./LocaleSwitch";

/** Sitenin son ekranı: logo filmi tam ekran, altta tek bir ince menü satırı. */
export async function Footer() {
  const dict = await getDictionary();
  const locale = await getLocale();
  const link = "split py-2 font-semibold uppercase";

  return (
    <footer className="on-night relative h-lvh min-h-[30rem] overflow-hidden bg-night text-paper">
      <FooterFilm />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night/85 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-gutter pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Mobilde iki düzenli satır (menü · dil / telif · başa dön), masaüstünde tek satır. */}
        <div className="grid grid-cols-2 items-center gap-y-1 border-t border-paper/20 pt-3 text-small md:flex md:justify-between md:gap-x-8">
          <ul className="flex gap-6">
            <li>
              <TransitionLink href={`/${locale}/shop`} className={link} data-text={dict.footer.shop}>
                {dict.footer.shop}
              </TransitionLink>
            </li>
            <li>
              <TransitionLink href={`/${locale}/bag`} className={link} data-text={dict.footer.bag}>
                {dict.footer.bag}
              </TransitionLink>
            </li>
          </ul>
          <LocaleSwitch className="justify-self-end font-semibold" />
          <p className="text-paper/60">© 2026 HAFT.</p>
          <BackToTop label={dict.footer.top} />
        </div>
      </div>
    </footer>
  );
}
