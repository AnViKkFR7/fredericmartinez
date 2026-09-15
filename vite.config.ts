import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_singleFetch: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app")
    }
  }
});
