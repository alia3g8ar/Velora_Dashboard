import type { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  // Load the schema from the local SDL file the backend writes on boot
  // (backend/src/schema.gql). Loading from the live URL triggers a codegen
  // parser bug ("Unexpected Name DIRECTIVE_DEFINITION"); the file does not.
  // Boot the backend once before running `npm run codegen`.
  schema: "../backend/src/schema.gql",
  extensions: {
    codegen: {
      hooks: {
        afterOneFileWrite: ["eslint --fix", "prettier --write"],
      },
      generates: {
        "src/graphql/schema.types.ts": {
          plugins: ["typescript"],
          config: {
            skipTypename: true,
            enumsAsTypes: true,
            scalars: {
              DateTime: {
                input: "string",
                output: "string",
                format: "date-time",
              },
            },
          },
        },
        "src/graphql/types.ts": {
          preset: "import-types",
          documents: ["src/**/*.{ts,tsx}"],
          plugins: ["typescript-operations"],
          config: {
            skipTypename: true,
            enumsAsTypes: true,
            preResolveTypes: false,
            useTypeImports: true,
          },
          presetConfig: {
            typesPath: "./schema.types",
          },
        },
      },
    },
  },
};

export default config;
