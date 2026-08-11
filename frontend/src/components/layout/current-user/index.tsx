import React from "react";
import { useTranslation } from "react-i18next";

import { useGetIdentity } from "@refinedev/core";

import { SettingOutlined } from "@ant-design/icons";
import { Button, Popover, theme } from "antd";

import type { User } from "@/graphql/schema.types";

import { CustomAvatar } from "../../custom-avatar";
import { Text } from "../../text";
import { AccountSettings } from "../account-settings";

export const CurrentUser = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [opened, setOpened] = React.useState(false);
  const { data: user } = useGetIdentity<User>();

  const content = (
    <div style={{ width: 240, padding: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 12px",
        }}
      >
        <CustomAvatar
          name={user?.name}
          src={user?.avatarUrl}
          size={36}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            strong
            ellipsis={{ tooltip: user?.name }}
            style={{ display: "block" }}
          >
            {user?.name}
          </Text>
          <Text
            className="secondary"
            size="xs"
            ellipsis={{ tooltip: user?.email }}
            style={{ display: "block" }}
          >
            {user?.email}
          </Text>
        </div>
      </div>
      <div
        style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Button
          style={{ textAlign: "start" }}
          icon={<SettingOutlined />}
          type="text"
          block
          onClick={() => setOpened(true)}
        >
          {t("accountSettings.menuItem")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Popover
        placement="bottomRight"
        content={content}
        trigger="click"
        overlayInnerStyle={{ padding: 0 }}
        overlayStyle={{ zIndex: 999 }}
      >
        <CustomAvatar
          name={user?.name}
          src={user?.avatarUrl}
          size="default"
          style={{ cursor: "pointer" }}
        />
      </Popover>
      {user && (
        <AccountSettings
          opened={opened}
          setOpened={setOpened}
          userId={user.id}
        />
      )}
    </>
  );
};
