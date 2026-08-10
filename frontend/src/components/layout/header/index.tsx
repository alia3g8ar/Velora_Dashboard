import React from "react";

import { Layout, Space, theme } from "antd";

import { CurrentUser } from "../current-user";

const { useToken } = theme;

export const Header = () => {
  const { token } = useToken();

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
    position: "sticky",
    top: 0,
    zIndex: 999,
  };

  return (
    <Layout.Header style={headerStyles}>
      <div></div>
      <Space align="center" size="middle">
        <CurrentUser />
      </Space>
    </Layout.Header>
  );
};
