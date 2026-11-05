import { bagReducer, emptyBag, sanitize, type BagAction, type BagState } from "./bag-reducer";

const STORAGE_KEY = "haft-bag-v1";

let state: BagState = emptyBag;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = sanitize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    // Gizli sekme ya da bozuk veri: boş sepetle devam.
  }
}

const emit = () => listeners.forEach((listener) => listener());

/** Başka sekmede sepet değişirse bu sekme de güncellenir. */
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  try {
    state = sanitize(JSON.parse(event.newValue ?? "null"));
  } catch {
    state = emptyBag;
  }
  emit();
}

/**
 * Sepet, React dışında yaşayan küçük bir store. `useSyncExternalStore` ile okunur:
 * sunucu ve hydration boş sepetle çizilir, ardından istemci gerçek sepete geçer; uyuşmazlık olmaz.
 */
export const bagStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot() {
    load();
    return state;
  },
  getServerSnapshot() {
    return emptyBag;
  },
  dispatch(action: BagAction) {
    load();
    const next = bagReducer(state, action);
    if (next === state) return;
    state = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Depolama kapalıysa sepet yalnızca bu oturumda yaşar.
    }
    emit();
  },
};
