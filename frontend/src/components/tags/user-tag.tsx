import { Space, Tag } from "antd";

import type { User } from "@/graphql/schema.types";

import { CustomAvatar } from "../custom-avatar";

type Props = {
  user: User;
};

export const UserTag = ({ user }: Props) => {
  return (
    <Tag
      key={user.id}
      style={{
        padding: 2,
        paddingInlineEnd: 8,
        borderRadius: 24,
        lineHeight: "unset",
        marginInlineEnd: "unset",
      }}
    >
      <Space size={4}>
        <CustomAvatar
          src={user.avatarUrl}
          name={user.name}
          style={{ display: "inline-flex" }}
        />
        {user.name}
      </Space>
    </Tag>
  );
};
