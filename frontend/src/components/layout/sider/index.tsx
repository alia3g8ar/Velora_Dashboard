import { ThemedSiderV2 } from "@refinedev/antd";
import type { TitleProps } from "@refinedev/core";

import { VeloraLogo } from "../../velora-logo";

/**
 * Sider title: the Velora logo instead of Refine's default "Refine Project"
 * text. The width adapts to the collapsed rail (desktop) vs the expanded
 * drawer (mobile).
 */
const SiderTitle = ({ collapsed }: TitleProps) => (
  <VeloraLogo
    width={collapsed ? 72 : 140}
    height={collapsed ? 23 : 45}
  />
);

/**
 * ThemedSiderV2 wrapper. The admin panel has its own standalone entry at
 * /admin (with its own login), so it is never listed in the sidebar menu —
 * admins and regular users alike reach it only by visiting the URL directly.
 */
export const Sider = () => {
  return (
    <ThemedSiderV2
      Title={SiderTitle}
      render={({ items, logout, dashboard }) => (
        <>
          {dashboard}
          {items.filter(
            (item) =>
              item.key && item.key !== "/admin" && item.key !== "admin",
          )}
          {logout}
        </>
      )}
    />
  );
};
