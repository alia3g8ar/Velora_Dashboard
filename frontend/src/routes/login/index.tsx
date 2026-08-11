import { AuthPage } from "@refinedev/antd";

import { LanguageSwitcher, VeloraLogo } from "@/components";
import { authCredentials } from "@/providers";

export const LoginPage = () => {
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
      <AuthPage
        type="login"
        registerLink={false}
        forgotPasswordLink={false}
        title={<VeloraLogo width={200} height={60} />}
        formProps={{
          initialValues: authCredentials,
        }}
      />
    </div>
  );
};
