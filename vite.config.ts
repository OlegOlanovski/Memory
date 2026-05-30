import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        settings: resolve(__dirname, "src/subpages/settings.html"),
        game: resolve(__dirname, "src/subpages/game.html"),
      },
    },
  },
});
