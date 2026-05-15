import { defineConfig } from "@evjs/ev";

export default defineConfig({
  server: false,
  html: "./index.html",
  pages: {
    home: "./src/home/main.tsx",
    about: "./src/about/main.tsx",
  },
});
