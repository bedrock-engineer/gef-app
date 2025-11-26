import { useEffect } from "react";
import { I18nProvider } from "react-aria-components";
import { useTranslation } from "react-i18next";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import {
  getLocale,
  i18nextMiddleware,
  localeCookie,
} from "~/middleware/i18next";
import type { Route } from "./+types/root";
import "./app.css";

export const middleware = [i18nextMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const locale = getLocale(context);
  return data(
    { locale },
    { headers: { "Set-Cookie": await localeCookie.serialize(locale) } }
  );
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100..700;1,100..700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap",
    rel: "stylesheet",
  },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/favicon-180x180.png" },
  { rel: "manifest", href: `${import.meta.env.BASE_URL}manifest.json` },
  { rel: "canonical", href: "https://gef.bedrock.engineer/" },
];

interface LayoutProps {
  children: React.ReactNode;
  loaderData?: Route.ComponentProps["loaderData"];
}

export function Layout({
  children,
  loaderData,
}: LayoutProps) {
  const { i18n } = useTranslation();
  const locale = loaderData?.locale ?? i18n.language ?? "nl";

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="author" content="Jules Blom @ Bedrock" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="View and visualize GEF (Geotechnical Exchange Format) files in your browser. Analyze CPT data and Bore charts instantly."
        />
        <meta
          name="keywords"
          content="GEF, geotechnical, CPT, bore, soil data, viewer, sondeergegevens, sondeerdata, Geotechnical Exchange Format"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="hsl(111, 15%, 43%)" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Bedrock GEF File Viewer",
              url: "https://gef.bedrock.engineer",
              description:
                "View and visualize GEF files easily in your browser. View CPT data and Bore charts instantly.",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData: { locale } }: Route.ComponentProps) {
  const { i18n } = useTranslation();

  useEffect(
    function syncLanguage() {
      if (i18n.language !== locale) {
        void i18n.changeLanguage(locale);
      }
    },
    [locale, i18n]
  );

  return (
    <I18nProvider locale={i18n.language}>
      <Outlet />
    </I18nProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Error";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
