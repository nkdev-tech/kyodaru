import { defineConfig } from "orval";

export default defineConfig({
  kyodaru: {
    output: {
      mode: "single",
      target: "./src/external/api.ts",
      client: "react-query",
      baseUrl: 'http://localhost:8787',
      override: {
        mutator: {
          path: './src/lib/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
    input: {
      target: 'http://localhost:8787/doc',
    },
  },
});
