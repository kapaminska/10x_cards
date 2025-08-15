// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    port: 4321,
  },
  integrations: [react(), sitemap(), tailwind()],
  adapter: node({
    mode: "standalone",
  }),
  experimental: { session: true },
});
