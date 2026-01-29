import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    outDir: "build/client",
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      outDir: "build/client",
      workbox: {
        globDirectory: "build/client",
        globPatterns: [
          "**/*.{js,css,wasm}",
          "*.{ico,png,svg,gef}",
          "manifest.*.json",
        ],
        navigateFallback: null,
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // Cache Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Network-first for navigation requests (SSR pages)
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      // Don't generate manifest - we already have language-specific ones
      manifest: false,
    }),
  ],
  assetsInclude: ["**/*.wasm"],
  optimizeDeps: {
    exclude: ["@bedrock-engineer/gef-parser"],
    esbuildOptions: {
      supported: {
        "top-level-await": true,
      },
    },
  },
});
