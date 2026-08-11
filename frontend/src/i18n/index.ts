import { initReactI18next } from "react-i18next";

import dayjs from "dayjs";
import i18n from "i18next";

import en from "./locales/en.json";
import fa from "./locales/fa.json";

import "dayjs/locale/fa";

export const SUPPORTED_LOCALES = ["en", "fa"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = "velora.locale";

export const isSupportedLocale = (value: unknown): value is Locale => {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
};

/**
 * Resolves a stored/incoming locale value to a supported locale.
 * Unknown values safely fall back to English.
 */
export const resolveInitialLocale = (value: unknown): Locale => {
  return isSupportedLocale(value) ? value : "en";
};

export const getLocaleDirection = (locale: Locale): "ltr" | "rtl" => {
  return locale === "fa" ? "rtl" : "ltr";
};

/**
 * Applies the locale to the document: <html lang> and <html dir>.
 * Safe to call in non-browser environments.
 */
export const applyLocaleToDocument = (locale: Locale): void => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = getLocaleDirection(locale);
};

const storage = (): Storage | undefined => {
  try {
    return typeof window !== "undefined" ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
};

export const readStoredLocale = (): Locale => {
  const stored = storage()?.getItem(LOCALE_STORAGE_KEY);
  return resolveInitialLocale(stored);
};

export const persistLocale = (locale: Locale): void => {
  try {
    storage()?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage may be unavailable (e.g. private mode); the locale still applies.
  }
};

const getInitialLocale = (): Locale => {
  return readStoredLocale();
};

/**
 * Changes the active locale, persists it and keeps document attrs in sync.
 */
export const setVeloraLocale = async (locale: string): Promise<Locale> => {
  const resolved = resolveInitialLocale(locale);
  await i18n.changeLanguage(resolved);
  persistLocale(resolved);
  applyLocaleToDocument(resolved);
  return resolved;
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: getInitialLocale(),
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LOCALES as unknown as string[],
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

// Keep the document attrs + dayjs locale in sync whenever the language changes.
i18n.on("languageChanged", (lng) => {
  const locale = resolveInitialLocale(lng);
  applyLocaleToDocument(locale);
  dayjs.locale(locale);
});

// Apply on first load so the initial paint already has the right direction.
applyLocaleToDocument(resolveInitialLocale(i18n.language));
dayjs.locale(resolveInitialLocale(i18n.language));

/**
 * Refine i18nProvider. `translate` follows Refine's calling convention:
 * - translate(key, defaultMessage)
 * - translate(key, params, defaultMessage)
 */
export const veloraI18nProvider = {
  translate: (key: string, options?: unknown, defaultMessage?: string) => {
    if (typeof options === "string") {
      return i18n.t(key, { defaultValue: options });
    }
    const tOptions = (options ?? {}) as Record<string, string>;
    if (defaultMessage !== undefined) {
      return i18n.t(key, { ...tOptions, defaultValue: defaultMessage });
    }
    return i18n.t(key, tOptions);
  },
  changeLocale: async (locale: string) => {
    return setVeloraLocale(locale);
  },
  getLocale: () => i18n.language,
};

export default i18n;
