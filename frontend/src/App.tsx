import React from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

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
  DealCreatePage,
  DealEditPage,
  DealListPage,
  LoginPage,
  TasksCreatePage,
  TasksEditPage,
  TasksListPage,
} from "@/routes";
import { setDefaultCalendar } from "@/utilities";

import "@refinedev/antd/dist/reset.css";
import "@/styles/global.css";

// The browser tab always shows just the brand name; page-specific titles
// would add no value at this size and the user asked for a single label.
const DOCUMENT_TITLE = "Velora";

/**
 * Applies the active locale to Ant Design (locale + direction), the theme
 * font stack, and the document title. Subscribing to language changes here
 * re-renders the whole tree on switch, which is what lets Refine's
 * memoized `useTranslate` consumers pick up the new language without a
 * page reload.
 */
const LocaleProvider = ({ children }: React.PropsWithChildren) => {
  const { i18n } = useTranslation();

  const locale = resolveInitialLocale(i18n.language);
  const direction = getLocaleDirection(locale);

  // The theme font stack always leads with Dana so Persian glyphs render
  // correctly in both languages (e.g. user-typed names inside an English UI).
  const theme: ThemeConfig = React.useMemo(() => veloraTheme, []);

  React.useEffect(() => {
    document.title = DOCUMENT_TITLE;
  }, []);

  // Let the Jalali picker default to the active calendar for new dayjs
  // instances (e.g. the panel's "today") without loading dayjs/plugin/
  // calendar, which would shadow jalaliday's `prototype.calendar`.
  React.useEffect(() => {
    setDefaultCalendar(locale === "fa" ? "jalali" : "gregory");
  }, [locale]);

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

                <Route path="/deals">
                  <Route index element={<DealListPage />} />
                  <Route path="new" element={<DealCreatePage />} />
                  <Route path="edit/:id" element={<DealEditPage />} />
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
