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
    { headers: { "Set-Cookie": await localeCookie.serialize(locale) } },
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
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  // TODO favicons - uncomment when created
  // {
  //   rel: "icon",
  //   type: "image/png",
  //   sizes: "32x32",
  //   href: `${import.meta.env.BASE_URL}favicons/favicon-32.png`,
  // },
  // {
  //   rel: "apple-touch-icon",
  //   type: "image/png",
  //   sizes: "180x180",
  //   href: `${import.meta.env.BASE_URL}favicons/favicon-180.png`,
  // },
  // {
  //   rel: "icon",
  //   type: "image/png",
  //   sizes: "192x192",
  //   href: `${import.meta.env.BASE_URL}favicons/favicon-192.png`,
  // },
  { rel: "manifest", href: `${import.meta.env.BASE_URL}manifest.json` },
  { rel: "canonical", href: "https://gef.bedrock.engineer/" },
];

export function Layout({
  children,
  loaderData,
}: {
  children: React.ReactNode;
  loaderData?: Route.ComponentProps["loaderData"];
}) {
  const { i18n } = useTranslation();
  const locale = loaderData?.locale ?? i18n.language ?? "en";

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
    [locale, i18n],
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
