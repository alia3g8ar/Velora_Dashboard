import { useTranslation } from "react-i18next";

import { GlobalOutlined } from "@ant-design/icons";
import { Select } from "antd";

import { setVeloraLocale } from "@/i18n";

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language === "fa" ? "fa" : "en";

  return (
    <Select
      aria-label={t("language.label")}
      value={current}
      onChange={(value) => {
        void setVeloraLocale(value);
      }}
      popupMatchSelectWidth={false}
      style={{ width: 108 }}
      suffixIcon={<GlobalOutlined />}
      options={[
        { value: "en", label: t("language.english") },
        { value: "fa", label: t("language.persian") },
      ]}
    />
  );
};
