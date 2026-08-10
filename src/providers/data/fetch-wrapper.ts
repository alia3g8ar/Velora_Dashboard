import type { GraphQLFormattedError } from "graphql";

type GraphQLError = Error & {
  statusCode: string;
};

const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem("access_token");
  const headers = options.headers as Record<string, string>;

  // Check if we have an access token for protected routes
  if (!accessToken && url.includes("/graphql")) {
    console.warn("No access token found. User may need to log in again.");
  }

  return await fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
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
      throw new Error(`HTTP error! status: ${response.status}`);
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
      throw new Error(
        "Network error: Unable to connect to the server. Please check your internet connection and try again.",
      );
    }

    // Handle authentication errors. The authProvider's `onError` is responsible
    // for logging the user out when it receives a UNAUTHENTICATED error.
    if (
      error instanceof Error &&
      (error as GraphQLError).statusCode === "UNAUTHENTICATED"
    ) {
      localStorage.removeItem("access_token");
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
      messages || JSON.stringify(errors),
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
