import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { App } from "../components/app";
import { localeCookie } from "~/middleware/i18next";
import { documentHeaders } from "~/util/cache";

const siteUrl = "https://gef.bedrock.engineer";

const metaDataTranslations = {
  en: {
    title: "Bedrock GEF File Viewer",
    description:
      "Free online GEF file viewer. View and visualize GEF files easily in your browser. View CPT data and Bore charts instantly.",
  },
  nl: {
    title: "Bedrock GEF Bestandsviewer",
    description:
      "Gratis online GEF bestandsviewer. Visualisatie van sondeergegevens eenvoudig in uw browser. Bekijk CPT-gegevens en boorgrafieken direct.",
  },
};

export function headers() {
  return documentHeaders();
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const newLang = formData.get("lang") as string;

  return redirect("/", {
    headers: {
      "Set-Cookie": await localeCookie.serialize(newLang),
    },
  });
}

export function meta({ matches }: Route.MetaArgs) {
  const rootMatch = matches.find((m) => m?.id === "root");
  const locale =
    (rootMatch?.loaderData as { locale?: string } | undefined)?.locale || "nl";
  const metadata =
    metaDataTranslations[locale as "nl" | "en"] || metaDataTranslations.en;
  const ogLocale = locale === "nl" ? "nl_NL" : "en_US";
  const altLocale = locale === "nl" ? "en_US" : "nl_NL";

  return [
    { title: metadata.title },
    { name: "description", content: metadata.description },
    // Open Graph
    { property: "og:url", content: siteUrl },
    { property: "og:type", content: "website" },
    { property: "og:title", content: metadata.title },
    { property: "og:description", content: metadata.description },
    { property: "og:locale", content: ogLocale },
    { property: "og:locale:alternate", content: altLocale },
    {
      property: "og:image",
      content: `${siteUrl}/og-image.png`,
    },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { property: "twitter:domain", content: "gef.bedrock.engineer" },
    { property: "twitter:url", content: siteUrl },
    { name: "twitter:title", content: metadata.title },
    { name: "twitter:description", content: metadata.description },
    {
      name: "twitter:image",
      content: `${siteUrl}/og-image.png`,
    },
  ];
}

export default function Home() {
  return <App />;
}
