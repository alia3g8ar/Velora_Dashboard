import type { GraphQLFormattedError } from "graphql";

type Error = {
  message: string;
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

    // Handle authentication errors
    if (error instanceof Error && error.message.includes("UNAUTHENTICATED")) {
      // Clear the token and redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    // Re-throw other errors
    throw error;
  }
};

const getGraphQLErrors = (
  body: Record<"errors", GraphQLFormattedError[] | undefined>,
): Error | null => {
  if (!body) {
    return {
      message: "Unknown error",
      statusCode: "INTERNAL_SERVER_ERROR",
    };
  }

  if ("errors" in body) {
    const errors = body?.errors;
    const messages = errors?.map((error) => error?.message)?.join("");
    const code = errors?.[0]?.extensions?.code;

    return {
      message: messages || JSON.stringify(errors),
      statusCode: code || 500,
    };
  }

  return null;
};
