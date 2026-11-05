"use client";

const EVENT = "haft:intro-done";

export const introDone = () =>
  typeof document !== "undefined" && document.documentElement.dataset.intro === "done";

export function markIntroDone() {
  document.documentElement.dataset.intro = "done";
  try {
    sessionStorage.setItem("haft-intro", "1");
  } catch {
    // Depolama kapalıysa preloader her yüklemede oynar; zararsız.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Preloader bittiğinde (ya da zaten bitmişse hemen) çalışır. Temizleme fonksiyonu döner. */
export function onIntroDone(callback: () => void) {
  if (introDone()) {
    callback();
    return () => {};
  }
  window.addEventListener(EVENT, callback, { once: true });
  return () => window.removeEventListener(EVENT, callback);
}
