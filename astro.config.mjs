import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://workflowvault.dev",
  output: "static",
  server: {
    port: 3000,
    host: true
  },
  vite: {
    server: {
      hmr: false
    }
  },
  adapter: cloudflare(),
  integrations: [
    sitemap()
  ]
});
