import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import jalaliday from "jalaliday";

// Make dayjs aware of the Jalali calendar. Safe to extend multiple times.
dayjs.extend(jalaliday);

// jalaliday exposes calendar switching through `Dayjs.prototype.calendar`.
// Some UI packages (e.g. antd-jalali's locale listener) also load
// dayjs/plugin/calendar, which patches the SAME prototype method with a
// relative-date formatter — silently turning `value.calendar("jalali")`
// into "format relative to the date parsed from 'jalali'". Capturing the
// switcher reference at module load keeps our conversions deterministic
// no matter which plugins get extended later.
const prototype = Object.getPrototypeOf(dayjs()) as Dayjs;
const switchCalendar = prototype.calendar as (
  calendar: "jalali" | "gregory",
) => Dayjs;

/** Converts a dayjs instance to the Jalali calendar (same instant). */
export const toJalali = (value: Dayjs): Dayjs => {
  return switchCalendar.call(value, "jalali");
};

/** Converts a dayjs instance to the Gregorian calendar (same instant). */
export const toGregorian = (value: Dayjs): Dayjs => {
  return switchCalendar.call(value, "gregory");
};

/**
 * Sets the default calendar used by newly created dayjs instances.
 * jalaliday's static setter — unaffected by the prototype collision above.
 */
export const setDefaultCalendar = (calendar: "jalali" | "gregory"): void => {
  dayjs.calendar(calendar);
};
