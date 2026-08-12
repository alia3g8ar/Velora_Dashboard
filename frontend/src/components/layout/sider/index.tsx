import React from "react";

import { ThemedSiderV2 } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";

import type { User } from "@/graphql/schema.types";

/**
 * ThemedSiderV2 wrapper that hides the "admin" menu item from everyone except
 * ADMIN users. The backend enforces the actual access rule; this is purely a
 * UI convenience so regular users never see the admin panel entry.
 */
export const Sider = () => {
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === "ADMIN";

  return (
    <ThemedSiderV2
      render={({ items, logout, dashboard }) => (
        <>
          {dashboard}
          {items.filter(
            (item) =>
              isAdmin ||
              (item.key &&
                item.key !== "/admin" &&
                item.key !== "admin"),
          )}
          {logout}
        </>
      )}
    />
  );
};
