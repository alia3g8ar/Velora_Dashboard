import React from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import { useNotificationProvider } from "@refinedev/antd";
import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { App as AntdApp, ConfigProvider, Spin, type ThemeConfig } from "antd";
import enUS from "antd/locale/en_US";
import faIR from "antd/locale/fa_IR";

import { Layout, ScrollLockWatchdog } from "@/components";
import { resources } from "@/config/resources";
import { veloraTheme } from "@/config/theme";
import { getLocaleDirection, resolveInitialLocale, veloraI18nProvider } from "@/i18n";
import { authProvider, dataProvider, liveProvider } from "@/providers";
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
      <AntdApp>
        {children}
        {/* Clears a stuck body scroll lock if a modal/drawer close was
            interrupted — otherwise the page stops scrolling until refresh. */}
        <ScrollLockWatchdog />
      </AntdApp>
    </ConfigProvider>
  );
};

// Route-level code splitting: the login page loads a small chunk and each
// section (dashboard, companies, tasks, deals, admin) loads its own bundle on
// first visit. The heavy chart library (G2Plot) only loads with the dashboard.
const lazy = (
  loader: () => Promise<{ default: React.ComponentType }>,
) =>
  React.lazy(loader) as unknown as React.ComponentType<React.PropsWithChildren>;

const LoginPage = lazy(() =>
  import("@/routes/login").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("@/routes/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const AdminPage = lazy(() =>
  import("@/routes/admin").then((m) => ({ default: m.AdminPage })),
);
const CompanyListPage = lazy(() =>
  import("@/routes/companies").then((m) => ({ default: m.CompanyListPage })),
);
const CompanyCreatePage = lazy(() =>
  import("@/routes/companies").then((m) => ({ default: m.CompanyCreatePage })),
);
const CompanyEditPage = lazy(() =>
  import("@/routes/companies").then((m) => ({ default: m.CompanyEditPage })),
);
const DealListPage = lazy(() =>
  import("@/routes/deals").then((m) => ({ default: m.DealListPage })),
);
const DealCreatePage = lazy(() =>
  import("@/routes/deals").then((m) => ({ default: m.DealCreatePage })),
);
const DealEditPage = lazy(() =>
  import("@/routes/deals").then((m) => ({ default: m.DealEditPage })),
);
const TasksListPage = lazy(() =>
  import("@/routes/tasks").then((m) => ({ default: m.TasksListPage })),
);
const TasksCreatePage = lazy(() =>
  import("@/routes/tasks").then((m) => ({ default: m.TasksCreatePage })),
);
const TasksEditPage = lazy(() =>
  import("@/routes/tasks").then((m) => ({ default: m.TasksEditPage })),
);

// Devtools are a development aid only — they add runtime weight and a
// floating panel in production, so they are tree-shaken out of the build.
const DevtoolsProvider = ({ children }: React.PropsWithChildren) => {
  return import.meta.env.DEV ? (
    <React.Suspense fallback={<>{children}</>}>
      <DevtoolsProviderInner>{children}</DevtoolsProviderInner>
    </React.Suspense>
  ) : (
    <>{children}</>
  );
};
const DevtoolsPanel = () => {
  return import.meta.env.DEV ? <DevtoolsPanelInner /> : null;
};

const DevtoolsProviderInner = React.lazy(
  () =>
    import("@refinedev/devtools").then((m) => ({
      default: m.DevtoolsProvider,
    })),
) as unknown as React.ComponentType<React.PropsWithChildren>;
const DevtoolsPanelInner = React.lazy(() =>
  import("@refinedev/devtools").then((m) => ({
    default: () => <m.DevtoolsPanel />,
  })),
);

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
              // No anonymous usage data leaves the browser.
              disableTelemetry: true,
            }}
          >
            <React.Suspense
              fallback={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "60vh",
                  }}
                >
                  <Spin size="large" />
                </div>
              }
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

              {/* Standalone admin panel: outside the app layout, with its own
                  login gate. An authenticated ADMIN lands straight on the
                  panel; everyone else sees the dedicated login form. */}
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
            </React.Suspense>
            <UnsavedChangesNotifier />
          </Refine>
          <DevtoolsPanel />
        </DevtoolsProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
};

export default App;
