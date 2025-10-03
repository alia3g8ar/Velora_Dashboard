import { AuthPage } from "@refinedev/antd";

import { authCredentials } from "@/providers";
import { VeloraLogo } from "@/components";

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
