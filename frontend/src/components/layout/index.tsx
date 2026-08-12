import React from "react";

import { ThemedLayoutV2 } from "@refinedev/antd";

import { VeloraLogo } from "../velora-logo";
import { Header } from "./header";
import { Sider } from "./sider";

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <ThemedLayoutV2
        Header={Header}
        Sider={Sider}
        Title={() => <VeloraLogo width={140} height={45} />}
      >
        {children}
      </ThemedLayoutV2>
    </>
  );
};
