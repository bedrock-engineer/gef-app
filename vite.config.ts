import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    outDir: "build/client",
    // maplibre-gl is a single indivisible library (~1 MB minified, ~270 kB
    // gzipped) that is already lazy-loaded behind a dynamic import.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "maplibre", test: /node_modules\/maplibre-gl\// },
            {
              name: "plot",
              test: /node_modules\/(@observablehq\/plot|d3-|delaunator|robust-predicates|internmap|isoformat)/,
            },
            {
              name: "react-aria",
              test: /node_modules\/(react-aria|react-stately|@react-aria|@react-stately|@internationalized)/,
            },
            {
              name: "gef-parser",
              test: /node_modules\/@bedrock-engineer\/gef-parser\//,
            },
            {
              name: "i18n",
              test: /node_modules\/(i18next|react-i18next|i18next-browser-languagedetector|remix-i18next)/,
            },
          ],
        },
      },
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
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
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    fs: {
      // Serve the gef-parser wasm binary when the package is file:-linked to
      // the sibling repo during local development (dev-only setting).
      allow: [searchForWorkspaceRoot(process.cwd()), "../gef-parser-js"],
    },
  },
  optimizeDeps: {
    exclude: ["@bedrock-engineer/gef-parser"],
  },
});
