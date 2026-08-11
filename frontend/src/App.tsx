import React from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router";

import { useNotificationProvider } from "@refinedev/antd";
import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { App as AntdApp, ConfigProvider, type ThemeConfig } from "antd";
import enUS from "antd/locale/en_US";
import faIR from "antd/locale/fa_IR";

import { Layout } from "@/components";
import { resources } from "@/config/resources";
import { veloraTheme } from "@/config/theme";
import { getLocaleDirection, resolveInitialLocale, veloraI18nProvider } from "@/i18n";
import { authProvider, dataProvider, liveProvider } from "@/providers";
import {
  CompanyCreatePage,
  CompanyEditPage,
  CompanyListPage,
  DashboardPage,
  LoginPage,
  TasksCreatePage,
  TasksEditPage,
  TasksListPage,
} from "@/routes";

import "@refinedev/antd/dist/reset.css";
import "@/styles/global.css";

const PERSIAN_FONT_STACK =
  '"Dana", "Vazirmatn", "Segoe UI", Tahoma, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';

const getDocumentTitleForPath = (pathname: string, t: (key: string) => string) => {
  if (pathname === "/login") return t("documentTitle.default");
  if (pathname === "/") return t("documentTitle.dashboard.list");
  if (pathname.startsWith("/companies/new"))
    return t("documentTitle.companies.create");
  if (pathname.startsWith("/companies/edit/"))
    return t("documentTitle.companies.edit");
  if (pathname.startsWith("/companies"))
    return t("documentTitle.companies.list");
  if (pathname.startsWith("/tasks/new"))
    return t("documentTitle.tasks.create");
  if (pathname.startsWith("/tasks/edit/")) return t("documentTitle.tasks.edit");
  if (pathname.startsWith("/tasks")) return t("documentTitle.tasks.list");
  return t("documentTitle.default");
};

/**
 * Applies the active locale to Ant Design (locale + direction), the theme
 * font stack, and the document title. Subscribing to language changes here
 * re-renders the whole tree on switch, which is what lets Refine's
 * memoized `useTranslate` consumers pick up the new language without a
 * page reload.
 */
const LocaleProvider = ({ children }: React.PropsWithChildren) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const locale = resolveInitialLocale(i18n.language);
  const direction = getLocaleDirection(locale);

  const theme: ThemeConfig = React.useMemo(() => {
    return {
      ...veloraTheme,
      token: {
        ...veloraTheme.token,
        fontFamily:
          locale === "fa"
            ? PERSIAN_FONT_STACK
            : veloraTheme.token?.fontFamily,
      },
    };
  }, [locale]);

  React.useEffect(() => {
    document.title = getDocumentTitleForPath(
      location.pathname,
      i18n.t.bind(i18n),
    );
  }, [locale, location.pathname]);

  return (
    <ConfigProvider
      locale={locale === "fa" ? faIR : enUS}
      direction={direction}
      theme={theme}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <DevtoolsProvider>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider}
            liveProvider={liveProvider}
            notificationProvider={useNotificationProvider}
            authProvider={authProvider}
            i18nProvider={veloraI18nProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              liveMode: "auto",
              useNewQueryKeys: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-layout"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <Layout>
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                <Route index element={<DashboardPage />} />

                <Route
                  path="/tasks"
                  element={
                    <TasksListPage>
                      <Outlet />
                    </TasksListPage>
                  }
                >
                  <Route path="new" element={<TasksCreatePage />} />
                  <Route path="edit/:id" element={<TasksEditPage />} />
                </Route>

                <Route path="/companies">
                  <Route index element={<CompanyListPage />} />
                  <Route path="new" element={<CompanyCreatePage />} />
                  <Route path="edit/:id" element={<CompanyEditPage />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Route>

              <Route
                element={
                  <Authenticated
                    key="authenticated-auth"
                    fallback={<Outlet />}
                  >
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
          </Refine>
          <DevtoolsPanel />
        </DevtoolsProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
};

export default App;
