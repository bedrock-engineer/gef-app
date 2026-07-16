import type { IControl, Map as MlMap } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState, type Key, type RefObject } from "react";
import {
  ComboBox,
  Group,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import {
  lookupAddress,
  suggestAddresses,
  type PdokSuggestion,
} from "~/util/pdok";

const searchMarkerColor = "#0d9488"; // teal, distinct from point colors

function swallowEvent(event: Event) {
  event.stopPropagation();
}

/**
 * Generic MapLibre IControl that hands back a stable DOM element so a
 * React subtree can render into it via `createPortal`. All behaviour
 * lives in the React tree; this exists purely because MapLibre's
 * IControl contract demands an HTMLElement.
 *
 * MapLibre's pointer interactions (pan, zoom, double-click-to-zoom,
 * scroll-wheel) fire on the map canvas; stop-propagation listeners keep
 * gestures on the hosted widgets from leaking through to the map.
 */
export class PortalControl implements IControl {
  readonly element: HTMLDivElement;

  constructor() {
    const element = document.createElement("div");
    element.className = "maplibregl-ctrl";
    element.addEventListener("mousedown", swallowEvent);
    element.addEventListener("pointerdown", swallowEvent);
    element.addEventListener("dblclick", swallowEvent);
    element.addEventListener("wheel", swallowEvent);
    this.element = element;
  }

  onAdd(): HTMLElement {
    return this.element;
  }

  onRemove(): void {
    this.element.remove();
  }
}

const debounceMs = 220;
const minQueryLength = 2;

interface AddressSuggestState {
  suggestions: Array<PdokSuggestion>;
  loading: boolean;
}

/**
 * Debounced, abortable PDOK address suggestions. Queries below
 * `minQueryLength` skip both the fetch and the state altogether;
 * cleanup aborts any in-flight fetch.
 */
function useAddressSuggest(query: string): AddressSuggestState {
  const trimmed = query.trim();
  const shouldSearch = trimmed.length >= minQueryLength;
  const [state, setState] = useState<AddressSuggestState>({
    suggestions: [],
    loading: false,
  });

  useEffect(() => {
    if (!shouldSearch) {
      return;
    }
    const abort = new AbortController();
    const timer = globalThis.setTimeout(() => {
      setState((s) => ({ ...s, loading: true }));
      suggestAddresses(trimmed, abort.signal)
        .then((suggestions) => {
          if (!abort.signal.aborted) {
            setState({ suggestions, loading: false });
          }
        })
        .catch(() => {
          if (!abort.signal.aborted) {
            setState({ suggestions: [], loading: false });
          }
        });
    }, debounceMs);

    return () => {
      globalThis.clearTimeout(timer);
      abort.abort();
    };
  }, [trimmed, shouldSearch]);

  if (!shouldSearch) {
    return { suggestions: [], loading: false };
  }
  return state;
}

interface SearchBoxProps {
  mapRef: RefObject<MlMap | null>;
}

/**
 * Address / place search rendered into the map via `PortalControl`,
 * backed by the PDOK Locatieserver. The selected place gets a marker
 * and the camera flies to it.
 */
export function SearchBox({ mapRef }: SearchBoxProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const { suggestions, loading } = useAddressSuggest(query);
  const lookupAbortRef = useRef<AbortController | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  function emptyStateMessage(): string {
    if (query.trim().length < minQueryLength) {
      return t("mapSearchTypeToSearch");
    }
    return loading ? t("mapSearchSearching") : t("mapSearchNoResults");
  }

  async function handleSelect(key: Key | null) {
    if (key === null) {
      return;
    }
    const id = String(key);
    const picked = suggestions.find((s) => s.id === id);
    if (picked) {
      setQuery(picked.label);
    }

    lookupAbortRef.current?.abort();
    const abort = new AbortController();
    lookupAbortRef.current = abort;

    let place;
    try {
      place = await lookupAddress(id, abort.signal);
    } catch {
      return;
    }
    const map = mapRef.current;
    if (!place || !map || abort.signal.aborted) {
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([place.longitude, place.latitude]);
    } else {
      markerRef.current = new maplibregl.Marker({ color: searchMarkerColor })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);
    }

    map.flyTo({
      center: [place.longitude, place.latitude],
      zoom: Math.max(map.getZoom(), 15),
      // Cap duration — flyTo otherwise scales with zoom delta, which
      // makes jumps from country-level to street-level drag on.
      duration: 400,
      curve: 1.2,
    });
  }

  return (
    <div className="min-w-64 rounded-sm border border-gray-300 bg-white/90 p-1">
      <ComboBox
        items={suggestions}
        inputValue={query}
        onInputChange={setQuery}
        onChange={(key) => {
          void handleSelect(key);
        }}
        allowsCustomValue
        menuTrigger="input"
        aria-label={t("mapSearchPlaceholder")}
      >
        <Group className="relative flex items-center rounded-sm border border-gray-300 bg-white focus-within:border-gray-500">
          <Input
            type="search"
            placeholder={t("mapSearchPlaceholder")}
            autoComplete="off"
            spellCheck={false}
            className="w-full min-w-0 rounded-sm bg-transparent py-1 pr-2 pl-2 text-xs text-gray-900 outline-none"
          />
          {loading && (
            <span className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-[10px] text-gray-400">
              …
            </span>
          )}
        </Group>
        <Popover className="w-(--trigger-width) rounded-sm bg-white shadow-lg">
          <ListBox<PdokSuggestion>
            className="max-h-64 overflow-auto text-xs text-gray-900 outline-none"
            renderEmptyState={() => (
              <div className="px-2.5 py-1.5 text-gray-400">
                {emptyStateMessage()}
              </div>
            )}
          >
            {(item) => (
              <ListBoxItem
                id={item.id}
                textValue={item.label}
                className="cursor-pointer border-b border-gray-100 px-2.5 py-1.5 outline-none data-focused:bg-blue-50 data-selected:bg-blue-50"
              >
                {item.label}
                <span className="ml-1.5 text-[10px] text-gray-400">
                  {item.type}
                </span>
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}
