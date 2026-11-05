import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  /** Harfleri ayrı span'lere böler; preloader ve geçiş perdesindeki esneme animasyonu için. */
  split?: boolean;
};

export function Logo({ className, split = false }: LogoProps) {
  if (!split) {
    return <span className={cn("font-logo leading-none tracking-[0.04em] uppercase", className)}>HAFT.</span>;
  }
  return (
    // Düz span ad taşıyamaz; role="img" ile tek parça "HAFT." olarak okunur, harfler gizli.
    <span role="img" className={cn("inline-flex gap-[0.04em] font-logo leading-none uppercase", className)} aria-label="HAFT.">
      {"HAFT.".split("").map((char, i) => (
        <span key={i} data-logo-char aria-hidden className="inline-block origin-bottom">
          {char}
        </span>
      ))}
    </span>
  );
}
