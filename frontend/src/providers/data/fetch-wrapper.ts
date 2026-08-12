import type { GraphQLFormattedError } from "graphql";

import i18n from "@/i18n";

type GraphQLError = Error & {
  statusCode: string;
};

/**
 * Maps known backend messages to localized, user-friendly UI text so raw
 * implementation details never leak into notifications.
 *
 * Validation errors (BAD_USER_INPUT) carry user-facing messages from the
 * API's class-validator rules and are shown as-is. Anything else is mapped
 * to a friendly message; unknown internal failures fall back to a generic
 * text (the raw detail is logged for debugging).
 */
const mapKnownError = (message: string, code?: string): string => {
  if (code === "BAD_USER_INPUT") {
    return message;
  }
  if (message.includes("Invalid email or password")) {
    return i18n.t("pages.login.errors.invalidCredentials");
  }
  if (message.includes("Email already registered")) {
    return i18n.t("errors.emailInUse");
  }
  if (
    message.includes("Not authenticated") ||
    message.includes("Invalid or expired access token")
  ) {
    return i18n.t("errors.unauthorized");
  }
  if (message.includes("User not found")) {
    return i18n.t("errors.notFound");
  }
  if (message.includes("Admin role is required")) {
    return i18n.t("admin.login.notAdmin");
  }
  if (message.includes("Avatar image is too large")) {
    return i18n.t("errors.avatarTooLarge");
  }
  if (message.includes("Data too long")) {
    return i18n.t("errors.saveFailed");
  }
  // Unknown backend failure: never show raw implementation text.
  console.error("[Velora] backend error:", message);
  return i18n.t("errors.internal");
};

const customFetch = async (url: string, options: RequestInit) => {
  const headers = options.headers as Record<string, string>;

  return await fetch(url, {
    ...options,
    // The auth token travels as an HttpOnly cookie; include it on every
    // request (same-origin on production, cross-origin in local dev).
    credentials: "include",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Apollo-Require-Preflight": "true",
    },
  });
};

export const fetchWrapper = async (
  url: string,
  options: RequestInit,
  retries = 3,
): Promise<Response> => {
  try {
    const response = await customFetch(url, options);

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(i18n.t("errors.internal"));
    }

    const responseClone = response.clone();
    const body = await responseClone.json();
    const error = getGraphQLErrors(body);

    if (error) {
      throw error;
    }

    return response;
  } catch (error) {
    // Handle network errors and other fetch issues
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      if (retries > 0) {
        console.warn(`Network error, retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return fetchWrapper(url, options, retries - 1);
      }
      throw new Error(i18n.t("errors.network"));
    }

    // Handle authentication errors. The authProvider's `onError` is responsible
    // for logging the user out when it receives a UNAUTHENTICATED error.
    if (
      error instanceof Error &&
      (error as GraphQLError).statusCode === "UNAUTHENTICATED"
    ) {
      localStorage.removeItem("access_token");
      // Also clear the HttpOnly session cookie so the server no longer
      // considers a stale token valid.
      try {
        await fetch(`${url}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Apollo-Require-Preflight": "true",
          },
          body: JSON.stringify({ query: "mutation Logout { logout }" }),
        });
      } catch {
        // Best-effort; the local redirect handles the rest.
      }
    }

    // Re-throw other errors
    throw error;
  }
};

const getGraphQLErrors = (
  body: Record<"errors", GraphQLFormattedError[] | undefined>,
): GraphQLError | null => {
  if (!body) {
    return createGraphQLError("Unknown error", "INTERNAL_SERVER_ERROR");
  }

  if ("errors" in body) {
    const errors = body?.errors;
    const messages = errors?.map((error) => error?.message)?.join("");
    const code = errors?.[0]?.extensions?.code;

    return createGraphQLError(
      mapKnownError(messages || JSON.stringify(errors), code as string),
      (code as string) || "INTERNAL_SERVER_ERROR",
    );
  }

  return null;
};

const createGraphQLError = (message: string, code: string) => {
  const error = new Error(message) as GraphQLError;
  error.statusCode = code;

  return error;
};
