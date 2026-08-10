import { AuthPage } from "@refinedev/antd";

import { VeloraLogo } from "@/components";
import { authCredentials } from "@/providers";

export const LoginPage = () => {
  return (
    <AuthPage
      type="login"
      registerLink={false}
      forgotPasswordLink={false}
      title={<VeloraLogo width={200} height={60} />}
      formProps={{
        initialValues: authCredentials,
      }}
    />
  );
};
