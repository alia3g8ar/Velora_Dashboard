import { useTranslation } from "react-i18next";

import { Space, Tag, Typography } from "antd";

import { Text } from "@/components";
import type { Task } from "@/graphql/schema.types";
import { formatDate, getDateColor } from "@/utilities";

type Props = {
  dueData?: Task["dueDate"];
};

export const DueDateHeader = ({ dueData }: Props) => {
  const { t, i18n } = useTranslation();

  if (dueData) {
    const color = getDateColor({
      date: dueData,
      defaultColor: "processing",
    });
    const getTagText = () => {
      switch (color) {
        case "error":
          return t("tasks.overdue");
        case "warning":
          return t("tasks.dueSoon");
        default:
          return t("tasks.processing");
      }
    };

    return (
      <Space size={[0, 8]}>
        <Tag color={color}>{getTagText()}</Tag>
        <Text>{formatDate(dueData, "MMMM D, YYYY - h:mm A", i18n.language)}</Text>
      </Space>
    );
  }

  return <Typography.Link>{t("tasks.addDueDate")}</Typography.Link>;
};
