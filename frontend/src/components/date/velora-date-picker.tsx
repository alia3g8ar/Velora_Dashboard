import { useTranslation } from "react-i18next";

import type { DatePickerProps } from "antd";
import { DatePicker as AntdDatePicker } from "antd";
import { DatePicker as JalaliDatePicker } from "antd-jalali";
import type { Dayjs } from "dayjs";

import { fromJalaliPickerValue, toJalaliPickerValue } from "./jalali-utils";

type VeloraDatePickerProps = Omit<
  DatePickerProps,
  "value" | "onChange" | "format"
> & {
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  format?: DatePickerProps["format"];
};

/**
 * Date picker that follows the active Velora locale:
 * - Persian (`fa`): a fully Jalali (Shamsi) calendar — Persian months,
 *   weekdays starting Saturday, RTL-safe.
 * - English (`en`): the standard Ant Design Gregorian picker.
 *
 * The form value is always a Gregorian dayjs, regardless of locale, so
 * persisted data and GraphQL payloads stay unchanged.
 */
export const VeloraDatePicker = ({
  value,
  onChange,
  format,
  ...rest
}: VeloraDatePickerProps) => {
  const { i18n } = useTranslation();
  const isFa = i18n.language === "fa";

  if (!isFa) {
    return (
      <AntdDatePicker
        {...rest}
        value={value}
        onChange={onChange}
        format={format}
      />
    );
  }

  return (
    <JalaliDatePicker
      {...rest}
      value={toJalaliPickerValue(value)}
      onChange={(next: Dayjs | null) => {
        onChange?.(fromJalaliPickerValue(next));
      }}
      format={(next: Dayjs) => {
        if (typeof format === "function") {
          // The Jalali picker hands the formatter a Jalali instance; convert
          // it back so the shared formatter converts exactly once.
          const gregorian = fromJalaliPickerValue(next);
          return gregorian ? format(gregorian) : "";
        }
        return (format as string | undefined) ?? "YYYY/MM/DD";
      }}
    />
  );
};
