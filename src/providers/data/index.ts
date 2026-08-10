import graphqlDataProvider, {
  GraphQLClient,
  liveProvider as graphqlLiveProvider,
} from "@refinedev/nestjs-query";

import { createClient } from "graphql-ws";

import { fetchWrapper } from "./fetch-wrapper";

// The API base comes from the environment. Defaults to the local dev server
// so the app works out of the box without configuration.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3001";
export const API_URL = `${API_BASE_URL}/graphql`;

// Realtime is opt-in. Without VITE_WS_URL the live provider stays disabled and
// the app relies on plain refetch after mutations (see README).
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

export const client = new GraphQLClient(API_URL, {
  fetch: (url: string, options: RequestInit) => {
    try {
      return fetchWrapper(url, options);
    } catch (error) {
      return Promise.reject(error as Error);
    }
  },
});

export const wsClient =
  typeof window !== "undefined" && WS_URL
    ? createClient({
        url: WS_URL,
        connectionParams: () => {
          const accessToken = localStorage.getItem("access_token");

          return {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };
        },
      })
    : undefined;

export const dataProvider = graphqlDataProvider(client);

export const liveProvider = wsClient
  ? graphqlLiveProvider(wsClient)
  : undefined;
