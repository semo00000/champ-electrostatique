"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale, BilingualText, BilingualArray } from "@/types/curriculum";
import translations from "./translations";

const STORAGE_KEY = "bac_lang";
const LOCALE_ORDER: Locale[] = ["fr", "ar", "en"];

interface I18nContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: (key: string) => string;
  localize: (obj: BilingualText | string | undefined | null) => string;
  localizeArray: (obj: BilingualArray | undefined | null) => string[];
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  // Restore locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && LOCALE_ORDER.includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  // Apply dir + lang attributes to <html> whenever locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  // Cycles FR → AR → EN → FR
  const toggle = useCallback(() => {
    setLocaleState((prev) => {
      const idx = LOCALE_ORDER.indexOf(prev);
      const next = LOCALE_ORDER[(idx + 1) % LOCALE_ORDER.length];
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] || translations.fr?.[key] || key;
    },
    [locale]
  );

  // For content that only exists in FR/AR, EN falls back to FR
  const localize = useCallback(
    (obj: BilingualText | string | undefined | null): string => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      if (locale === "en") return obj.fr || "";
      return obj[locale as "fr" | "ar"] || obj.fr || "";
    },
    [locale]
  );

  const localizeArray = useCallback(
    (obj: BilingualArray | undefined | null): string[] => {
      if (!obj) return [];
      if (locale === "en") return obj.fr || [];
      return obj[locale as "fr" | "ar"] || obj.fr || [];
    },
    [locale]
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider
      value={{ locale, dir, setLocale, toggle, t, localize, localizeArray }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
