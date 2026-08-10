import graphqlDataProvider, {
  GraphQLClient,
  liveProvider as graphqlLiveProvider,
} from "@refinedev/nestjs-query";

import { createClient } from "graphql-ws";

import { fetchWrapper } from "./fetch-wrapper";

// The API base comes from the environment. In development it defaults to the
// local backend. In production builds the frontend and API are served from the
// same origin (Vercel), so /graphql is relative and no VITE_API_URL is needed.
// An explicit VITE_API_URL always wins when set.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.PROD ? "" : "http://localhost:3001");
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
