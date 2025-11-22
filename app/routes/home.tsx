import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { App } from "../components/app";
import { localeCookie } from "~/middleware/i18next";

const title = "Bedrock GEF file Viewer";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const newLang = formData.get("lang") as string;

  return redirect("/", {
    headers: {
      "Set-Cookie": await localeCookie.serialize(newLang),
    },
  });
}
const description =
  "View and visualize GEF Files easily in your browser. View CPT data and Bore charts instantly";
  
export function meta({}: Route.MetaArgs) {
  return [
    { title },
    { name: "description", content: "Bedrock GEF file viewer. View " },
    { name: "View GEF files in the browser" },
    // <!-- Facebook Meta Tags -->
    { property: "og:url", content: "https://bedrock.engineer/geotop-voxels/" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    {
      property: "og:image",
      content: "https://bedrock.engineer/geotop-voxels/og-voxel.png",
    },

    // <!-- Twitter Meta Tags -->
    { name: "twitter:card", content: "summary_large_image" },
    { property: "twitter:domain", content: "gef.bedrock.engineer" },
    {
      property: "twitter:url",
      content: "https://gef.bedrock.engineer",
    },
    { name: "twitter:title", content: "Bedrock GEF File Viewer" },
    {
      name: "twitter:description",
      content: description,
    },
    {
      name: "twitter:image",
      content: "https://bedrock.engineer/geotop-voxels/og-voxel.png",
    },
  ];
}

export default function Home() {
  return <App />;
}
