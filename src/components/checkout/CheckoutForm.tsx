"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { summarize } from "@/bag/bag-reducer";
import { useBag } from "@/bag/bag-context";
import { useTransitionNavigate } from "@/components/layout/PageTransition";
import { useLenis } from "@/components/layout/SmoothScroll";
import { Price, Weight } from "@/components/ui/Figures";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SHIPPING_COST, type ShippingMethod } from "@/content/products";
import { intlTag } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { newOrderId, saveOrder } from "@/lib/order";

const COUNTRIES = ["TR", "DE", "NL", "FR", "GB", "IT", "ES", "SE"];

/** Form alanlarının ortak kutusu: input ve select aynı görünür. */
const FIELD = "min-h-13 border bg-paper px-4 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink";

type Field = "email" | "firstName" | "lastName" | "address" | "city" | "postcode" | "country";
type Errors = Partial<Record<Field, string>>;

export function CheckoutForm() {
  const bag = useBag();
  const { locale, dict } = useI18n();
  const t = dict.checkout;
  const navigate = useTransitionNavigate();
  const lenis = useLenis();
  const [method, setMethod] = useState<ShippingMethod>("standard");
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const summaryId = useId();
  const form = useRef<HTMLFormElement>(null);

  const totals = useMemo(() => summarize({ lines: bag.lines }, method), [bag.lines, method]);
  const countryName = useMemo(() => new Intl.DisplayNames([intlTag[locale]], { type: "region" }), [locale]);

  if (!bag.hydrated) return <div className="min-h-[40svh]" aria-busy="true" />;

  if (bag.lines.length === 0 && !placing) {
    return (
      <div className="flex min-h-[40svh] flex-col items-start justify-center gap-6">
        <p className="text-h2 font-bold">{t.emptyBag}</p>
        <TransitionLink href={`/${locale}/shop`} className="border-b-2 border-ink pb-1 font-semibold uppercase">
          {dict.bag.emptyCta} →
        </TransitionLink>
      </div>
    );
  }

  const validate = (data: FormData): Errors => {
    const next: Errors = {};
    const value = (f: Field) => String(data.get(f) ?? "").trim();
    (["email", "firstName", "lastName", "address", "city", "postcode", "country"] as Field[]).forEach((f) => {
      if (!value(f)) next[f] = t.required;
    });
    if (value("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value("email"))) next.email = t.invalidEmail;
    if (value("postcode") && !/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(value("postcode"))) next.postcode = t.invalidPostcode;
    return next;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const found = validate(data);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      // focus()'un kendi kaydırmasını Lenis eziyor, ekran basılan yerde kalıyordu. İlk hatalı alana açıkça
      // kaydırılır (etiketi header'ın altında görünecek kadar payla), odak kaydırma bitince verilir.
      // Hedef, hata mesajları çizildikten sonra (bir kare sonra) ölçülür; yoksa yerleşim kayar.
      requestAnimationFrame(() => {
        const field = form.current?.querySelector<HTMLElement>(`[name="${first}"]`);
        if (!field) return;
        const target = field.closest("label") ?? field;
        const pad = parseFloat(getComputedStyle(document.documentElement).fontSize) * 7;
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - pad);
        const focus = () => field.focus({ preventScroll: true });
        if (lenis.current) lenis.current.scrollTo(top, { duration: 1, onComplete: focus });
        else {
          window.scrollTo({ top, behavior: "smooth" });
          focus();
        }
      });
      return;
    }
    setPlacing(true);
    const order = {
      id: newOrderId(),
      lines: bag.lines.map(({ slug, size, qty }) => ({ slug, size, qty })),
      method,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      weight: totals.weight,
      name: String(data.get("firstName")),
    };
    // Gerçek bir ödeme yok; kısa "tartılıyor" anı akışı hissettirsin diye.
    setTimeout(() => {
      saveOrder(order);
      bag.dispatch({ type: "clear" });
      // replace: sipariş verildikten sonra geri tuşu boş checkout'a değil, ondan önceki sayfaya döner.
      navigate(`/${locale}/order/${order.id}`, { replace: true });
    }, 1100);
  };

  return (
    <form ref={form} noValidate onSubmit={submit} aria-describedby={Object.keys(errors).length ? summaryId : undefined} className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div className="space-y-12 lg:col-span-7">
        {Object.keys(errors).length > 0 && (
          <p id={summaryId} role="alert" className="border-l-4 border-ink pl-4 font-semibold">
            {t.errors}
          </p>
        )}

        <Section title={t.contact}>
          <Input name="email" type="email" autoComplete="email" label={t.email} error={errors.email} className="sm:col-span-2" />
        </Section>

        <Section title={t.delivery}>
          <Input name="firstName" autoComplete="given-name" label={t.firstName} error={errors.firstName} />
          <Input name="lastName" autoComplete="family-name" label={t.lastName} error={errors.lastName} />
          <Input name="address" autoComplete="street-address" label={t.address} error={errors.address} className="sm:col-span-2" />
          <Input name="city" autoComplete="address-level2" label={t.city} error={errors.city} />
          <Input name="postcode" autoComplete="postal-code" label={t.postcode} error={errors.postcode} />
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-small font-semibold uppercase">{t.country}</span>
            {/* Tarayıcının yuvarlak köşeli, gölgeli select'i yerine diğer alanlarla aynı kutu; ok işareti bizim. */}
            <span className="relative flex">
              <select
                name="country"
                autoComplete="country"
                defaultValue={locale === "tr" ? "TR" : "DE"}
                className={cn(FIELD, "w-full appearance-none rounded-none border-ink/30 pr-12")}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{countryName.of(c)}</option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-small">
                ↓
              </span>
            </span>
          </label>
        </Section>

        <Section title={t.method}>
          <div role="radiogroup" aria-label={t.method} className="grid gap-2 sm:col-span-2">
            {(Object.keys(SHIPPING_COST) as ShippingMethod[]).map((m) => {
              const cost = summarize({ lines: bag.lines }, m).shipping;
              return (
                <label key={m} className={cn("flex min-h-13 cursor-pointer items-center justify-between gap-4 border px-4 py-3", method === m ? "border-ink bg-tile" : "border-line")}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="size-4 accent-ink" />
                    {m === "standard" ? t.standard : t.express}
                  </span>
                  <span className="font-semibold">{cost === 0 ? dict.bag.free : <Price cents={cost} />}</span>
                </label>
              );
            })}
          </div>
        </Section>

        <Section title={t.payment}>
          <p className="border border-dashed border-ink p-4 text-mute sm:col-span-2">{t.notice}</p>
        </Section>

        <button
          type="submit"
          disabled={placing}
          aria-busy={placing}
          className="relative flex min-h-16 w-full items-center justify-between overflow-hidden bg-ink px-6 text-lead font-bold text-paper uppercase disabled:cursor-wait"
        >
          <span>{placing ? t.placing : t.place}</span>
          <Price cents={totals.total} />
          {placing && <span aria-hidden className="absolute bottom-0 left-0 h-1 w-full origin-left animate-[weigh_1.1s_var(--ease-heavy)_forwards] bg-paper" />}
        </button>
      </div>

      <aside className="lg:col-span-5" aria-label={t.summary}>
        <div className="space-y-5 border border-ink p-5 lg:sticky lg:top-28">
          <h2 className="font-bold uppercase">{t.summary}</h2>
          <ul className="space-y-4">
            {totals.lines.map((line) => (
              <li key={`${line.slug}-${line.size}`} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-tile">
                  <Image src={line.product.images[0].src} alt="" fill sizes="64px" className="object-cover" />
                  <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-ink text-[0.65rem] font-bold text-paper">{line.qty}</span>
                </div>
                <div className="min-w-0 flex-1 text-small">
                  <p className="font-semibold">{line.product.name[locale]}</p>
                  <p className="text-mute">
                    {line.size === "OS" ? dict.product.oneSize : `${dict.bag.size} ${line.size}`} · <Weight grams={line.weight} className="text-[1em]" />
                  </p>
                </div>
                <Price cents={line.total} className="text-small font-semibold" />
              </li>
            ))}
          </ul>
          <BagTotalsInline shipping={totals.shipping} subtotal={totals.subtotal} total={totals.total} weight={totals.weight} />
        </div>
      </aside>
    </form>
  );
}

function BagTotalsInline({ subtotal, shipping, total, weight }: { subtotal: number; shipping: number; total: number; weight: number }) {
  const { dict } = useI18n();
  return (
    <dl className="space-y-1.5 border-t border-line pt-4 text-small">
      <div className="flex justify-between"><dt className="text-mute">{dict.bag.subtotal}</dt><dd><Price cents={subtotal} /></dd></div>
      <div className="flex justify-between"><dt className="text-mute">{dict.bag.shipping}</dt><dd>{shipping === 0 ? dict.bag.free : <Price cents={shipping} />}</dd></div>
      <div className="flex justify-between"><dt className="text-mute">{dict.bag.weighs}</dt><dd><Weight grams={weight} className="text-[1em]" /></dd></div>
      <div className="flex justify-between border-t border-ink pt-3 text-body font-semibold"><dt>{dict.bag.total}</dt><dd><Price cents={total} /></dd></div>
    </dl>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="font-display mb-4 text-h2 leading-none font-black tracking-tight uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

type InputProps = { name: Field; label: string; error?: string; type?: string; autoComplete?: string; className?: string };

function Input({ name, label, error, type = "text", autoComplete, className }: InputProps) {
  const errorId = useId();
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-small font-semibold uppercase">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(FIELD, error ? "border-ink border-2" : "border-ink/30")}
      />
      {error && (
        <span id={errorId} className="text-small font-semibold">
          ↳ {error}
        </span>
      )}
    </label>
  );
}
