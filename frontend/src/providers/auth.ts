import type { AuthProvider } from "@refinedev/core";

import type { User } from "@/graphql/schema.types";
import i18n from "@/i18n";

import { API_URL, dataProvider } from "./data";

/**
 * Maps known backend auth failures to localized, user-friendly messages so
 * raw implementation details never leak into the UI.
 */
const mapAuthError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  // The fetch wrapper already maps known backend messages to the active
  // language, so match both the raw backend text and its translated form.
  const invalidCredentials = i18n.t("pages.login.errors.invalidCredentials");
  const emailInUse = i18n.t("errors.emailInUse");
  const unauthorized = i18n.t("errors.unauthorized");

  if (
    message === invalidCredentials ||
    message.includes("Invalid email or password")
  ) {
    return invalidCredentials;
  }
  if (message === emailInUse || message.includes("Email already registered")) {
    return emailInUse;
  }
  if (
    message === unauthorized ||
    message.includes("Not authenticated") ||
    message.includes("Invalid or expired access token")
  ) {
    return unauthorized;
  }

  return i18n.t("pages.login.errors.loginFailed");
};

/**
 * For demo purposes and to make it easier to test Velora CRM, you can use the following credentials:
 */
export const authCredentials = {
  email: "aliasghararyayimehr@gmail.com",
  password: "demodemo",
};

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email, password },
          rawQuery: `
                mutation Login($email: String!, $password: String!) {
                    login(loginInput: {
                      email: $email
                      password: $password
                    }) {
                      accessToken,
                    }
                  }
                `,
        },
      });

      localStorage.setItem("access_token", data.login.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (e) {
      const translated = mapAuthError(e);

      return {
        success: false,
        error: {
          message: translated,
          name: translated,
        },
      };
    }
  },
  register: async ({ email, password, ...params }) => {
    try {
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email, password, name: params.name },
          rawQuery: `
                mutation Register($name: String!, $email: String!, $password: String!) {
                    register(registerInput: {
                      name: $name
                      email: $email
                      password: $password
                    }) {
                      accessToken,
                    }
                  }
                `,
        },
      });

      localStorage.setItem("access_token", data.register.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (e) {
      const translated = mapAuthError(e);

      return {
        success: false,
        error: {
          message: translated,
          name: i18n.t("pages.login.register.errors.registrationFailed"),
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    try {
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          rawQuery: `
                    query Me {
                        me {
                          name
                        }
                      }
                `,
        },
      });

      return {
        authenticated: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const { data } = await dataProvider.custom<{ me: User }>({
        url: API_URL,
        method: "post",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        meta: {
          rawQuery: `
                    query Me {
                        me {
                            id,
                            name,
                            email,
                            phone,
                            jobTitle,
                            timezone
                            avatarUrl
                        }
                      }
                `,
        },
      });

      return data.me;
    } catch (error) {
      return undefined;
    }
  },
};
