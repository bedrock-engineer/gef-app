/**
 * PDOK Locatieserver v3_1 — Dutch geocoding service (addresses, places,
 * postcodes, streets, municipalities). Free, public, CORS-friendly.
 * Docs: https://www.pdok.nl/introductie/-/article/pdok-locatieserver-1
 *
 * Two-step flow:
 *   suggestAddresses(q) -> lightweight ranked matches (id + display name)
 *   lookupAddress(id)   -> full record including centroide_ll (WKT POINT in WGS84)
 */

const suggestUrl = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest";
const lookupUrl = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup";

export interface PdokSuggestion {
  id: string;
  label: string;
  type: string;
}

interface PdokPlace {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
}

interface SuggestResponse {
  response: {
    docs: Array<{ id: string; weergavenaam: string; type: string }>;
  };
}

interface LookupResponse {
  response: {
    docs: Array<{ id: string; weergavenaam: string; centroide_ll: string }>;
  };
}

async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function suggestAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<Array<PdokSuggestion>> {
  const url = new URL(suggestUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("rows", "8");

  const data = await fetchJson<SuggestResponse>(url, signal);
  return data.response.docs.map((record) => ({
    id: record.id,
    label: record.weergavenaam,
    type: record.type,
  }));
}

export async function lookupAddress(
  id: string,
  signal?: AbortSignal,
): Promise<PdokPlace | null> {
  const url = new URL(lookupUrl);
  url.searchParams.set("id", id);
  url.searchParams.set("fl", "id,weergavenaam,centroide_ll");

  const data = await fetchJson<LookupResponse>(url, signal);
  const record = data.response.docs[0];
  if (!record) {
    return null;
  }

  const point = parseWktPoint(record.centroide_ll);
  if (!point) {
    return null;
  }

  return {
    id: record.id,
    name: record.weergavenaam,
    longitude: point.longitude,
    latitude: point.latitude,
  };
}

function parseWktPoint(
  wkt: string,
): { longitude: number; latitude: number } | null {
  const match = /POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/.exec(
    wkt,
  );
  if (!match?.[1] || !match[2]) {
    return null;
  }
  const longitude = Number.parseFloat(match[1]);
  const latitude = Number.parseFloat(match[2]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }
  return { longitude, latitude };
}
