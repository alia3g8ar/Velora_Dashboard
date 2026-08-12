import { describe, expect, it } from "vitest";

import {
  getLocaleDirection,
  isSupportedLocale,
  resolveInitialLocale,
  veloraI18nProvider,
} from "./index";
import en from "./locales/en.json";
import fa from "./locales/fa.json";

type TranslationObject = Record<string, unknown>;

const flattenKeys = (
  obj: TranslationObject,
  prefix = "",
): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return flattenKeys(value as TranslationObject, fullKey);
    }
    return [fullKey];
  });
};

describe("i18n infrastructure", () => {
  it("defaults to English when no locale is stored", () => {
    expect(resolveInitialLocale(undefined)).toBe("en");
    expect(resolveInitialLocale(null)).toBe("en");
  });

  it("only supports en and fa, and rejects anything else", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fa")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("EN")).toBe(false);
  });

  it("safely falls back to English for invalid stored values", () => {
    expect(resolveInitialLocale("fr")).toBe("en");
    expect(resolveInitialLocale("")).toBe("en");
    expect(resolveInitialLocale(42)).toBe("en");
    expect(resolveInitialLocale({})).toBe("en");
  });

  it("maps locales to the correct document direction", () => {
    expect(getLocaleDirection("en")).toBe("ltr");
    expect(getLocaleDirection("fa")).toBe("rtl");
  });

  it("en and fa translation resources have identical key sets", () => {
    const enKeys = flattenKeys(en).sort();
    const faKeys = flattenKeys(fa).sort();

    expect(faKeys).toEqual(enKeys);
  });

  it("translated values are non-empty and the two locales differ", () => {
    expect(flattenKeys(en).length).toBeGreaterThan(50);

    expect(en.dashboard.dashboard).toBe("Dashboard");
    expect(fa.dashboard.dashboard).toBe("داشبورد");
    expect(en.dashboard.dashboard).not.toBe(fa.dashboard.dashboard);
  });

  it("Persian values use proper Persian characters (ی/ک), not Arabic variants", () => {
    const persianText = JSON.stringify(fa);
    // Arabic yeh/kaf must not appear in Persian translations
    expect(persianText.includes("ي")).toBe(false);
    expect(persianText.includes("ك")).toBe(false);
  });

  it("admin panel keys exist in both locales with role labels", () => {
    expect(en.admin.admin).toBe("Admin panel");
    expect(fa.admin.admin).toBe("پنل مدیریت");
    expect(en.enums.role.ADMIN).toBe("Admin");
    expect(fa.enums.role.ADMIN).toBe("مدیر");
    expect(en.admin.notifications.lastAdmin).toBeTruthy();
    expect(fa.admin.notifications.lastAdmin).toBeTruthy();
  });

  it("admin login keys exist in both locales", () => {
    expect(en.admin.login.title).toBe("Admin Panel");
    expect(fa.admin.login.title).toBe("پنل مدیریت");
    expect(en.admin.login.submit).toContain("Admin");
    expect(fa.admin.login.submit).toContain("پنل مدیریت");
    expect(en.admin.login.notAdmin).toBeTruthy();
    expect(fa.admin.login.notAdmin).toBeTruthy();
  });

  describe("veloraI18nProvider.translate", () => {
    it("resolves a key to the active language", () => {
      expect(veloraI18nProvider.translate("dashboard.dashboard")).toBe(
        "Dashboard",
      );
    });

    it("falls back to the default message for unknown keys", () => {
      expect(
        veloraI18nProvider.translate("does.not.exist", "Fallback text"),
      ).toBe("Fallback text");
    });

    it("supports the (key, params, defaultMessage) calling convention", () => {
      expect(
        veloraI18nProvider.translate("common.paginationTotal", {
          count: 12,
          entity: "Companies",
        }),
      ).toBe("12 Companies in total");
    });
  });

  it("changeLocale resolves to a supported locale and getLocale reflects it", async () => {
    const resolved = await veloraI18nProvider.changeLocale("fa");
    expect(resolved).toBe("fa");
    expect(veloraI18nProvider.getLocale()).toBe("fa");

    // Invalid locales are coerced back to English instead of breaking
    const coerced = await veloraI18nProvider.changeLocale("de");
    expect(coerced).toBe("en");

    // Restore English for other tests
    await veloraI18nProvider.changeLocale("en");
  });
});
