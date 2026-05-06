import { defineConfig } from "@evjs/ev";

export default defineConfig({
  server: {
    entry: "./src/server.ts",
  },
  dev: {
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    ],
  },
});
