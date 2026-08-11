import { useTranslation } from "react-i18next";

import { MarkdownField } from "@refinedev/antd";

import { Typography } from "antd";

import type { Task } from "@/graphql/schema.types";

type Props = {
  description?: Task["description"];
};

export const DescriptionHeader = ({ description }: Props) => {
  const { t } = useTranslation();

  if (description) {
    return (
      <Typography.Paragraph ellipsis={{ rows: 8 }}>
        <MarkdownField value={description} />
      </Typography.Paragraph>
    );
  }

  return <Typography.Link>{t("tasks.addTaskDescription")}</Typography.Link>;
};
