import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AuthPage } from "@refinedev/antd";
import { useRegister } from "@refinedev/core";

import { Button, Card, Form, Input, Typography } from "antd";

import { LanguageSwitcher, VeloraLogo } from "@/components";
import { authCredentials } from "@/providers";

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

export const LoginPage = () => {
  const { t } = useTranslation();
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
        <AuthPage
          type="login"
          registerLink={
            <Button type="link" onClick={() => setMode("register")}>
              {t("pages.login.register.noAccount")}
            </Button>
          }
          forgotPasswordLink={false}
          title={<VeloraLogo width={200} height={60} />}
          formProps={{
            initialValues: authCredentials,
          }}
        />
      ) : (
        <RegisterForm onBackToLogin={() => setMode("login")} />
      )}
    </div>
  );
};
