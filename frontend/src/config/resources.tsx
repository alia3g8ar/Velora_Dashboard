import type { IResourceItem } from "@refinedev/core";

import {
  DashboardOutlined,
  ProjectOutlined,
  ShopOutlined,
} from "@ant-design/icons";

/**
 * Resource labels are intentionally not hardcoded here: Refine resolves the
 * sidebar/menu labels through the i18nProvider using the
 * `${resourceName}.${resourceName}` key convention, so removing `meta.label`
 * lets the labels be translated (see src/i18n/locales/*.json).
 */
export const resources: IResourceItem[] = [
  {
    name: "dashboard",
    list: "/",
    meta: {
      icon: <DashboardOutlined />,
    },
  },
  {
    name: "companies",
    list: "/companies",
    show: "/companies/:id",
    create: "/companies/new",
    edit: "/companies/edit/:id",
    meta: {
      icon: <ShopOutlined />,
    },
  },
  {
    name: "tasks",
    list: "/tasks",
    create: "/tasks/new",
    edit: "/tasks/edit/:id",
    meta: {
      icon: <ProjectOutlined />,
    },
  },
];
