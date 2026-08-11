import { useTranslation } from "react-i18next";

import { Space, Typography } from "antd";

import { UserTag } from "@/components";
import type { Task } from "@/graphql/schema.types";

type Props = {
  users?: Task["users"];
};

export const UsersHeader = ({ users = [] }: Props) => {
  const { t } = useTranslation();

  if (users.length > 0) {
    return (
      <Space size={[0, 8]} wrap>
        {users.map((user) => (
          <UserTag key={user.id} user={user} />
        ))}
      </Space>
    );
  }

  return <Typography.Link>{t("tasks.assignToUsers")}</Typography.Link>;
};
