"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { summarize, type BagAction, type BagSummary } from "./bag-reducer";
import { bagStore } from "./bag-store";

type BagContextValue = BagSummary & {
  dispatch: (action: BagAction) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Ekran okuyucuya duyurulacak son mesaj (aria-live). */
  announce: (message: string) => void;
  /** İstemcide gerçek sepet okundu mu; o ana kadar "boş sepet" yazısı gösterilmez. */
  hydrated: boolean;
};

const BagContext = createContext<BagContextValue | null>(null);
const noopSubscribe = () => () => {};

export function BagProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(bagStore.subscribe, bagStore.getSnapshot, bagStore.getServerSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const liveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const announce = useCallback((text: string) => {
    // Aynı mesaj art arda gelirse de okunması için önce boşaltılır.
    setMessage("");
    clearTimeout(liveTimer.current);
    liveTimer.current = setTimeout(() => setMessage(text), 60);
  }, []);

  const value = useMemo<BagContextValue>(
    () => ({ ...summarize(state), dispatch: bagStore.dispatch, open, setOpen, announce, hydrated }),
    [state, open, announce, hydrated],
  );

  return (
    <BagContext value={value}>
      {children}
      <p aria-live="polite" role="status" className="sr-only">
        {message}
      </p>
    </BagContext>
  );
}

export function useBag() {
  const value = use(BagContext);
  if (!value) throw new Error("useBag, BagProvider dışında kullanıldı");
  return value;
}
