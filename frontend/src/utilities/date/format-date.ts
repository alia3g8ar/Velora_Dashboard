import dayjs from "dayjs";
import { toJalaali } from "jalaali-js";

import { toGregorian } from "./jalali-calendar";

/**
 * Locale-aware date formatting for Velora.
 *
 * In English dates are formatted with dayjs exactly as before. In Persian
 * the date is converted to the Jalali (Iranian) calendar and rendered with
 * Persian month names and Persian digits, e.g. "مرداد ۲۳، ۱۴۰۵".
 *
 * Only presentation changes: the underlying values stay Gregorian ISO
 * strings and are never mutated.
 */

const FA_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

const toFaDigits = (input: string): string => {
  return input.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
};

const toFaNumber = (value: number, pad = 0): string => {
  return toFaDigits(String(value).padStart(pad, "0"));
};

/**
 * Formats a date as Jalali using the tokens used by this app:
 * YYYY (year), MMMM/MMM (full month name), MM/M (month number),
 * DD/D (day), HH (24h), h (12h), mm (minute), A (AM/PM).
 */
export const formatJalali = (
  value: dayjs.ConfigType,
  pattern: string,
): string => {
  const date = dayjs(value);
  // Normalize to the Gregorian calendar first. When the Jalali picker is
  // active, new dayjs instances default to the Jalali calendar, and reading
  // .year()/.month()/.date() directly would double-convert the value.
  const gregorian =
    typeof date.calendar === "function" ? toGregorian(date) : date;
  const { jy, jm, jd } = toJalaali(
    gregorian.year(),
    gregorian.month() + 1,
    gregorian.date(),
  );
  const hour = date.hour();
  const minute = date.minute();
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "ق.ظ" : "ب.ظ";

  // Longest tokens first so e.g. MMMM is not broken apart by M.
  const tokens: Array<[RegExp, string]> = [
    [/YYYY/g, toFaNumber(jy)],
    [/MMMM/g, FA_MONTHS[jm - 1]],
    [/MMM/g, FA_MONTHS[jm - 1]],
    [/MM/g, toFaNumber(jm, 2)],
    [/M/g, toFaNumber(jm)],
    [/DD/g, toFaNumber(jd, 2)],
    [/D/g, toFaNumber(jd)],
    [/HH/g, toFaNumber(hour, 2)],
    [/h/g, toFaNumber(hour12)],
    [/mm/g, toFaNumber(minute, 2)],
    [/A/g, ampm],
  ];

  return tokens
    .reduce(
      (output, [regex, replacement]) => output.replace(regex, replacement),
      pattern,
    )
    .replace(/,/g, "،");
};

/**
 * Formats a date for the active locale. `en` keeps the dayjs behaviour;
 * `fa` renders the Jalali equivalent.
 */
export const formatDate = (
  value: dayjs.ConfigType,
  pattern: string,
  locale?: string,
): string => {
  if (locale === "fa") {
    return formatJalali(value, pattern);
  }
  return dayjs(value).format(pattern);
};
