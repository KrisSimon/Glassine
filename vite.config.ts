import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // `dist/` belongs to the packaged library (`npm run build:lib`); the demo
  // app gets its own directory so the two builds cannot overwrite each other.
  build: {
    outDir: "dist-demo",
  },
  resolve: {
    alias: {
      // Storybook übernimmt diese Config mit — ein Alias für beide Welten.
      $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
});
