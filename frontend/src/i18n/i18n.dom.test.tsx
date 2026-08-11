// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useTranslation } from "react-i18next";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  applyLocaleToDocument,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  resolveInitialLocale,
  setVeloraLocale,
} from "./index";

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const TestConsumer = () => {
  const { t } = useTranslation();

  return (
    <div>
      <span data-testid="dashboard">{t("dashboard.dashboard")}</span>
      <span data-testid="companies">{t("companies.companies")}</span>
    </div>
  );
};

describe("i18n DOM integration", () => {
  let container: HTMLElement;
  let root: Root;

  beforeEach(async () => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await setVeloraLocale("en");
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    window.localStorage.clear();
  });

  it("applies html lang and dir for English (ltr)", async () => {
    await setVeloraLocale("en");

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("applies html lang=fa and dir=rtl for Persian", async () => {
    await setVeloraLocale("fa");

    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("restores html lang=en and dir=ltr when switching back to English", async () => {
    await setVeloraLocale("fa");
    expect(document.documentElement.dir).toBe("rtl");

    await setVeloraLocale("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("persists the selected locale in localStorage", async () => {
    await setVeloraLocale("fa");

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("fa");
    expect(readStoredLocale()).toBe("fa");
  });

  it("reads a saved locale on load", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "fa");
    expect(readStoredLocale()).toBe("fa");
  });

  it("safely falls back to English for an invalid persisted locale", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "fr");
    expect(resolveInitialLocale(readStoredLocale())).toBe("en");
  });

  it("updates translated text on the page immediately, without a reload", async () => {
    await act(async () => {
      root.render(<TestConsumer />);
    });

    expect(container.textContent).toContain("Dashboard");
    expect(container.textContent).toContain("Companies");

    await act(async () => {
      await setVeloraLocale("fa");
    });

    expect(container.textContent).toContain("داشبورد");
    expect(container.textContent).toContain("شرکت‌ها");
  });

  it("keeps business data untouched while UI labels change", async () => {
    const BusinessData = () => (
      <div>
        <span data-testid="company-name">Dunder Mifflin</span>
        <TestConsumer />
      </div>
    );

    await act(async () => {
      root.render(<BusinessData />);
    });

    await act(async () => {
      await setVeloraLocale("fa");
    });

    expect(container.querySelector('[data-testid="company-name"]')?.textContent).toBe(
      "Dunder Mifflin",
    );
    expect(container.textContent).toContain("داشبورد");
  });

  it("applyLocaleToDocument is safe and idempotent", () => {
    applyLocaleToDocument("fa");
    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");

    applyLocaleToDocument("fa");
    expect(document.documentElement.lang).toBe("fa");
  });
});
