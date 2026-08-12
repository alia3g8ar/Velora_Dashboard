import dayjs from "dayjs";
import calendarPlugin from "dayjs/plugin/calendar";
import { describe, expect, it } from "vitest";

import { formatJalali } from "../../utilities/date/format-date";
import { fromJalaliPickerValue, toJalaliPickerValue } from "./jalali-utils";

describe("toJalaliPickerValue", () => {
  it("converts a Gregorian value to the Jalali calendar for display", () => {
    const gregorian = dayjs("2026-08-14T00:00:00");
    const jalali = toJalaliPickerValue(gregorian);

    expect(jalali?.year()).toBe(1405);
    expect(jalali?.format("YYYY/MM/DD")).toBe("1405/05/23");
  });

  it("passes undefined/null values through", () => {
    expect(toJalaliPickerValue(undefined)).toBeUndefined();
    expect(toJalaliPickerValue(null)).toBeUndefined();
  });
});

describe("fromJalaliPickerValue", () => {
  it("converts a Jalali picker value back to Gregorian, preserving the instant", () => {
    const jalali = dayjs("1405-05-23", { jalali: true }).hour(9).minute(30);
    const gregorian = fromJalaliPickerValue(jalali);

    expect(gregorian?.format("YYYY-MM-DD HH:mm")).toBe("2026-08-14 09:30");
    expect(gregorian?.toISOString()).toBe(jalali.toISOString());
  });

  it("passes undefined/null values through", () => {
    expect(fromJalaliPickerValue(undefined)).toBeNull();
    expect(fromJalaliPickerValue(null)).toBeNull();
  });
});

describe("calendar plugin collision (regression)", () => {
  it("keeps converting after dayjs/plugin/calendar shadows prototype.calendar", () => {
    // antd-jalali's locale listener extends dayjs/plugin/calendar, which
    // patches the SAME `Dayjs.prototype.calendar` method jalaliday uses to
    // switch calendars. Our conversions must stay deterministic either way.
    dayjs.extend(calendarPlugin);

    const gregorian = dayjs("2026-08-14T00:00:00");
    const jalali = toJalaliPickerValue(gregorian);

    expect(jalali?.year()).toBe(1405);
    expect(jalali?.format("YYYY/MM/DD")).toBe("1405/05/23");
    expect(fromJalaliPickerValue(jalali)?.toISOString()).toBe(
      gregorian.toISOString(),
    );
    expect(formatJalali(gregorian, "YYYY/MM/DD")).toBe("۱۴۰۵/۰۵/۲۳");
  });
});
