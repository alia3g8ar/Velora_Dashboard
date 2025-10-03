import React from "react";

import { ThemedLayoutV2 } from "@refinedev/antd";

import { GitHubBanner } from "./gh-banner";
import { Header } from "./header";
import { VeloraLogo } from "../velora-logo";

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <ThemedLayoutV2
        Header={Header}
        Title={(titleProps) => <VeloraLogo width={140} height={45} />}
      >
        {children}
      </ThemedLayoutV2>
    </>
  );
};
