import type { Dayjs } from "dayjs";

import { toGregorian, toJalali } from "../../utilities/date/jalali-calendar";

/**
 * Converts a Gregorian dayjs instance to the Jalali calendar for display.
 * `undefined`/`null` values pass through untouched.
 */
export const toJalaliPickerValue = (
  value: Dayjs | null | undefined,
): Dayjs | undefined => {
  if (!value) return undefined;
  return toJalali(value);
};

/**
 * Converts a Jalali-calendar dayjs instance (as produced by the Jalali
 * picker) back to the Gregorian calendar. Business values are always stored
 * as Gregorian ISO strings, so only presentation switches calendars.
 */
export const fromJalaliPickerValue = (
  value: Dayjs | null | undefined,
): Dayjs | null => {
  if (!value) return null;
  return toGregorian(value);
};
