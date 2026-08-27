import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  output: "static",
  server: {
    port: 3000,
    host: true
  },
  adapter: cloudflare(),
  integrations: [
    sitemap()
  ]
});
