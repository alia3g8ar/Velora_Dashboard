import { describe, expect, it } from "vitest";

import { formatDate, formatJalali } from "./format-date";

describe("formatJalali", () => {
  it("converts a Gregorian date to the Jalali calendar", () => {
    // 2026-08-14 -> 1405-05-23 (23 مرداد ۱۴۰۵)
    expect(formatJalali("2026-08-14T12:30:00", "YYYY/MM/DD")).toBe(
      "۱۴۰۵/۰۵/۲۳",
    );
  });

  it("renders Persian month names", () => {
    expect(formatJalali("2026-08-14T12:30:00", "MMM D")).toBe("مرداد ۲۳");
    expect(formatJalali("2026-03-21T12:30:00", "MMMM")).toBe("فروردین");
  });

  it("handles 12-hour clock with Persian AM/PM", () => {
    expect(
      formatJalali("2026-08-14T00:05:00", "MMMM D, YYYY - h:mm A"),
    ).toBe("مرداد ۲۳، ۱۴۰۵ - ۱۲:۰۵ ق.ظ");
    expect(
      formatJalali("2026-08-14T15:30:00", "MMMM D, YYYY - h:mm A"),
    ).toBe("مرداد ۲۳، ۱۴۰۵ - ۳:۳۰ ب.ظ");
  });

  it("formats 24-hour clock with Persian digits", () => {
    expect(formatJalali("2026-08-14T09:05:00", "YYYY/MM/DD HH:mm")).toBe(
      "۱۴۰۵/۰۵/۲۳ ۰۹:۰۵",
    );
  });
});

describe("formatDate", () => {
  it("uses dayjs formatting for English", () => {
    expect(formatDate("2026-08-14T12:30:00", "MMM D", "en")).toBe("Aug 14");
  });

  it("uses Jalali formatting for Persian", () => {
    expect(formatDate("2026-08-14T12:30:00", "MMM D", "fa")).toBe("مرداد ۲۳");
  });

  it("defaults to English formatting without a locale", () => {
    expect(formatDate("2026-08-14T12:30:00", "MMM D")).toBe("Aug 14");
  });
});
