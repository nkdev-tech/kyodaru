import { defineConfig } from "orval";

export default defineConfig({
  kyodaru: {
    output: {
      mode: "single",
      target: "./src/external/api.ts",
      client: "react-query",
      baseUrl: 'http://localhost:8787',
    },
    input: {
      target: 'http://localhost:8787/doc',
    },
  },
});
