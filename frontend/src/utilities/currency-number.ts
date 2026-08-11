export const currencyNumber = (
  value: number,
  options?: Intl.NumberFormatOptions & { locale?: string },
) => {
  const { locale = "en-US", ...formatOptions } = options ?? {};

  if (
    typeof Intl === "object" &&
    Intl &&
    typeof Intl.NumberFormat === "function"
  ) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      ...formatOptions,
    }).format(value);
  }

  return value.toString();
};
