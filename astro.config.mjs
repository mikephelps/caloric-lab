import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://caloriclab.com",
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom", "react-dom/client"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
      esbuildOptions: {
        define: {
          "process.env.NODE_ENV": JSON.stringify("development"),
        },
      },
    },
  },
});
