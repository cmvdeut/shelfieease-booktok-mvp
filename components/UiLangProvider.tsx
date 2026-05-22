"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type UiLang,
  detectUiLang,
  setUiLang as persistUiLang,
  applyDocumentUiLang,
  getStoredUiLang,
} from "@/lib/i18n";

type UiLangContextValue = {
  lang: UiLang;
  setLang: (lang: UiLang) => void;
};

const UiLangContext = createContext<UiLangContextValue | null>(null);

export function UiLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>("nl");

  useEffect(() => {
    const initial = getStoredUiLang() ?? detectUiLang();
    setLangState(initial);
    applyDocumentUiLang(initial);

    function onLangChange(e: Event) {
      const next = (e as CustomEvent<{ lang?: UiLang }>).detail?.lang;
      if (next === "nl" || next === "en") {
        setLangState(next);
        applyDocumentUiLang(next);
      }
    }

    function onStorage(e: StorageEvent) {
      if (e.key === "se:uiLang") {
        const stored = getStoredUiLang();
        if (stored) {
          setLangState(stored);
          applyDocumentUiLang(stored);
        }
      }
    }

    window.addEventListener("uilangchange", onLangChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("uilangchange", onLangChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLang = useCallback((next: UiLang) => {
    setLangState(next);
    persistUiLang(next);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <UiLangContext.Provider value={value}>{children}</UiLangContext.Provider>;
}

export function useUiLang(): UiLangContextValue {
  const ctx = useContext(UiLangContext);
  if (!ctx) {
    return {
      lang: detectUiLang(),
      setLang: persistUiLang,
    };
  }
  return ctx;
}
