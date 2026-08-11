import { useTranslation } from "react-i18next";

type PaginationTotalProps = {
  total: number;
  entityName: string;
};

export const PaginationTotal = ({
  total,
  entityName,
}: PaginationTotalProps) => {
  const { t } = useTranslation();

  return (
    <span
      style={{
        marginInlineStart: "16px",
      }}
    >
      <span className="ant-text secondary">
        {t("common.paginationTotal", {
          count: total,
          entity: t(`${entityName}.singular`),
        })}
      </span>
    </span>
  );
};
