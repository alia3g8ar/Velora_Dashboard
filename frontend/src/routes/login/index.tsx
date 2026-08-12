import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useLogin, useRegister } from "@refinedev/core";

import { Button, Card, Checkbox, Form, Input, Typography } from "antd";

import { LanguageSwitcher, VeloraLogo } from "@/components";
import { authCredentials } from "@/providers";

type LoginFormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterForm = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const { t } = useTranslation();

  // Refine's useRegister resolves even on failure (authProvider returns
  // `success: false` instead of throwing), so its built-in handling is used:
  // success redirects into the app, failure shows a translated error
  // notification — no custom onError needed here.
  const { mutate: register, isLoading } = useRegister();

  const handleFinish = (values: RegisterFormValues) => {
    register({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div style={{ width: 400, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <VeloraLogo width={200} height={60} />
        </div>
        <Card
          styles={{
            body: { padding: "28px 24px 20px" },
          }}
        >
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            {t("pages.login.register.title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t("pages.login.register.subtitle")}
          </Typography.Text>

          <Form<RegisterFormValues>
            layout="vertical"
            onFinish={handleFinish}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              label={t("pages.login.register.name")}
              name="name"
              rules={[
                {
                  required: true,
                  message: t("pages.login.register.errors.requiredName"),
                },
              ]}
            >
              <Input
                size="large"
                placeholder={t("pages.login.register.name")}
              />
            </Form.Item>
            <Form.Item
              label={t("pages.login.register.email")}
              name="email"
              rules={[
                {
                  required: true,
                  message: t("pages.login.register.errors.requiredEmail"),
                },
                {
                  type: "email",
                  message: t("pages.login.register.errors.validEmail"),
                },
              ]}
            >
              <Input size="large" placeholder="you@example.com" />
            </Form.Item>
            <Form.Item
              label={t("pages.login.register.password")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("pages.login.register.errors.requiredPassword"),
                },
                {
                  min: 6,
                  message: t("pages.login.register.errors.passwordTooShort"),
                },
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item
              label={t("pages.login.register.confirmPassword")}
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: t("pages.login.register.errors.requiredConfirm"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        t("pages.login.register.errors.passwordMismatch"),
                      ),
                    );
                  },
                }),
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              {t("pages.login.register.signup")}
            </Button>
          </Form>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Typography.Text type="secondary">
              {t("pages.login.register.haveAccount")}
            </Typography.Text>
            <Button type="link" onClick={onBackToLogin}>
              {t("pages.login.signin")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const LoginForm = ({ onGoToRegister }: { onGoToRegister: () => void }) => {
  const { t } = useTranslation();

  // Refine's useLogin resolves even on failure (authProvider returns
  // `success: false` instead of throwing), so its built-in handling is used:
  // success redirects into the app, failure shows a translated error
  // notification — no custom onError needed here.
  const { mutate: login, isLoading } = useLogin();

  const handleFinish = (values: LoginFormValues) => {
    login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div style={{ width: 400, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <VeloraLogo width={200} height={60} />
        </div>
        <Card
          styles={{
            body: { padding: "28px 24px 20px" },
          }}
        >
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            {t("pages.login.title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t("pages.login.subtitle")}
          </Typography.Text>

          <Form<LoginFormValues>
            layout="vertical"
            onFinish={handleFinish}
            initialValues={authCredentials}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              label={t("pages.login.fields.email")}
              name="email"
              rules={[
                {
                  required: true,
                  message: t("pages.login.errors.requiredEmail"),
                },
                {
                  type: "email",
                  message: t("pages.login.errors.validEmail"),
                },
              ]}
            >
              <Input
                size="large"
                placeholder={t("pages.login.fields.email")}
              />
            </Form.Item>
            <Form.Item
              label={t("pages.login.fields.password")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("pages.login.errors.requiredPassword"),
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder={t("pages.login.fields.password")}
              />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ fontSize: 12 }}>
                {t("pages.login.buttons.rememberMe")}
              </Checkbox>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
              style={{ marginTop: 12 }}
            >
              {t("pages.login.signin")}
            </Button>
          </Form>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Typography.Text type="secondary">
              {t("pages.login.register.noAccount")}
            </Typography.Text>
            <Button type="link" onClick={onGoToRegister}>
              {t("pages.login.register.signup")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const LoginPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        style={{
          position: "fixed",
          insetInlineEnd: 24,
          insetBlockStart: 24,
          zIndex: 100,
        }}
      >
        <LanguageSwitcher />
      </div>
      {mode === "login" ? (
        <LoginForm onGoToRegister={() => setMode("register")} />
      ) : (
        <RegisterForm onBackToLogin={() => setMode("login")} />
      )}
    </div>
  );
};
