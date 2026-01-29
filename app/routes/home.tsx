import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { App } from "../components/app";
import { localeCookie } from "~/middleware/i18next";
import { documentHeaders } from "~/util/cache";

const siteUrl = "https://gef.bedrock.engineer";

const metaDataTranslations = {
  en: {
    title:
      "GEF File Viewer - Free CPT & Bore Data Visualization Tool | Bedrock.engineer",
    description:
      "Free online GEF viewer for geotechnical engineers. View, analyze and export CPT sounding data and bore logs from BRO and DOV. Supports GEF-CPT and GEF-BORE formats. Works directly in your browser.",
    siteName: "Bedrock.engineer GEF Viewer",
    imageAlt: "Bedrock.engineer GEF Viewer - Geotechnical data visualization",
  },
  nl: {
    title:
      "GEF Bestand Viewer - Gratis Sondering & Boring Visualisatie | Bedrock.engineer",
    description:
      "Gratis online GEF viewer voor geotechnisch ingenieurs. Bekijk, analyseer, en exporteer CPT sondeergegevens en boorprofielen van BRO en DOV. Ondersteunt GEF-CPT en GEF-BORE formaten. Werkt direct in je browser zonder installatie.",
    siteName: "Bedrock.engineer GEF Viewer",
    imageAlt: "Bedrock.engineer GEF Viewer - Geotechnische data visualisatie",
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
  const locale = matches[0].loaderData.locale as "nl" | "en";
  const metadata = metaDataTranslations[locale];
  const ogLocale = locale === "nl" ? "nl_NL" : "en_US";
  const altLocale = locale === "nl" ? "en_US" : "nl_NL";

  return [
    { title: metadata.title },
    { name: "description", content: metadata.description },
    { name: "robots", content: "index, follow" },
    { name: "application-name", content: "Bedrock.engineer GEF Viewer" },
    // Language alternates
    { tagName: "link", rel: "alternate", hrefLang: "nl", href: siteUrl },
    { tagName: "link", rel: "alternate", hrefLang: "en", href: siteUrl },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: siteUrl },
    // Open Graph
    { property: "og:site_name", content: metadata.siteName },
    { property: "og:url", content: siteUrl },
    { property: "og:type", content: "website" },
    { property: "og:title", content: metadata.title },
    { property: "og:description", content: metadata.description },
    { property: "og:locale", content: ogLocale },
    { property: "og:locale:alternate", content: altLocale },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image", content: `${siteUrl}/og-image.png` },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: metadata.imageAlt },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { property: "twitter:domain", content: "gef.bedrock.engineer" },
    { property: "twitter:url", content: siteUrl },
    { name: "twitter:title", content: metadata.title },
    { name: "twitter:description", content: metadata.description },
    { name: "twitter:creator", content: "@Mega_Jules" },
    { name: "twitter:image", content: `${siteUrl}/og-image.png` },
    { name: "twitter:image:alt", content: metadata.imageAlt },
  ];
}

export default function Home() {
  return <App />;
}
