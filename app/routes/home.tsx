import type { Route } from "./+types/home";
import { App } from "../components/app";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bedrock GEF CPT viewer" },
    { name: "description", content: "Bedrock GEF-CPT viewer" },
  ];
}

export default function Home() {
  return <App />;
}
