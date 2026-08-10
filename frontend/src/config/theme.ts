import { ThemeConfig } from "antd";

export const veloraTheme: ThemeConfig = {
  token: {
    // Primary colors - روشن‌تر و شادتر
    colorPrimary: "#8B5CF6", // Bright Purple
    colorPrimaryHover: "#A78BFA",
    colorPrimaryActive: "#7C3AED",

    // Background colors - روشن
    colorBgContainer: "#FFFFFF", // White
    colorBgElevated: "#F9FAFB",
    colorBgLayout: "#F3F4F6",
    colorBgBase: "#FFFFFF",

    // Text colors - تیره‌تر روی پس‌زمینه روشن
    colorText: "#111827", // Gray-900
    colorTextSecondary: "#374151",
    colorTextTertiary: "#6B7280",
    colorTextQuaternary: "#9CA3AF",

    // Border colors - نرم‌تر
    colorBorder: "#E5E7EB",
    colorBorderSecondary: "#D1D5DB",

    // Success, warning, error
    colorSuccess: "#10B981", // Green
    colorWarning: "#F59E0B",
    colorError: "#EF4444",

    // Component specific
    colorFillAlter: "#F9FAFB",
    colorFillSecondary: "#E5E7EB",
    colorFillTertiary: "#D1D5DB",

    // Radius (نرم‌تر و گردتر)
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,

    // Font
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // Shadows - خیلی نرم و لطیف
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    boxShadowSecondary: "0 2px 6px rgba(0, 0, 0, 0.04)",
  },
  components: {
    Layout: {
      headerBg: "#FFFFFF",
      siderBg: "#F9FAFB",
      bodyBg: "#FFFFFF",
    },
    Menu: {
      darkItemBg: "#FFFFFF",
      darkItemSelectedBg: "#F3F4F6",
      darkItemHoverBg: "#F9FAFB",
      darkItemColor: "#111827",
      darkItemSelectedColor: "#8B5CF6",
    },
    Card: {
      colorBgContainer: "#FFFFFF",
      colorBorderSecondary: "#E5E7EB",
    },
    Button: {
      primaryShadow: "0 2px 6px rgba(139, 92, 246, 0.25)",
    },
    Table: {
      headerBg: "#F9FAFB",
      rowHoverBg: "#F3F4F6",
    },
    Input: {
      colorBgContainer: "#FFFFFF",
      colorBorder: "#D1D5DB",
      colorText: "#111827",
    },
    Select: {
      colorBgContainer: "#FFFFFF",
      colorBorder: "#D1D5DB",
      colorText: "#111827",
    },
    Modal: {
      contentBg: "#FFFFFF",
      headerBg: "#F9FAFB",
    },
    Drawer: {
      colorBgElevated: "#FFFFFF",
    },
  },
  algorithm: undefined,
};

// Gradient utilities
export const gradientStyles = {
  primaryGradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
  cardGradient: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
  textGradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
};
