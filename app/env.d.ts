interface ImportMetaEnv {
  /** Sentry DSN (public); inlined at build time into client and worker bundles. */
  readonly VITE_SENTRY_DSN?: string;
  /** PostHog public project token and ingest host. */
  readonly VITE_PUBLIC_POSTHOG_PROJECT_TOKEN?: string;
  readonly VITE_PUBLIC_POSTHOG_HOST?: string;
}
