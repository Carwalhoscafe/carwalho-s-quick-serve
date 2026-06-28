import { useEffect, useRef, useState } from "react";

export type SelectedAddress = {
  formattedAddress: string;
  lat: number;
  lng: number;
};

declare global {
  interface Window {
    google?: typeof google;
    __gmapsLoading?: Promise<void>;
    __initGmaps?: () => void;
  }
}

function loadMapsJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) {
    return Promise.reject(new Error("Maps API key not configured"));
  }

  window.__gmapsLoading = new Promise<void>((resolve, reject) => {
    window.__initGmaps = () => resolve();
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=places&callback=__initGmaps${channel ? `&channel=${channel}` : ""}`;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
}

export function AddressAutocomplete({
  onSelect,
  onClear,
  placeholder = "Search your delivery address",
}: {
  onSelect: (a: SelectedAddress) => void;
  onClear?: () => void;
  placeholder?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let element: HTMLElement | null = null;

    (async () => {
      try {
        await loadMapsJs();
        if (cancelled || !hostRef.current || !window.google) return;

        const { PlaceAutocompleteElement } =
          (await window.google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

        // @ts-expect-error - PlaceAutocompleteElement options are partial
        element = new PlaceAutocompleteElement({
          includedRegionCodes: ["in"],
          // Bias to Chennai
          locationBias: {
            center: { lat: 12.97, lng: 80.1493 },
            radius: 25000,
          },
        });
        element!.setAttribute(
          "style",
          "width:100%;",
        );
        // Style the inner input via attribute
        element!.setAttribute("placeholder", placeholder);

        element!.addEventListener("gmp-select", async (ev: Event) => {
          // @ts-expect-error - event shape from Maps JS
          const placePrediction = ev.placePrediction;
          if (!placePrediction) return;
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location"],
          });
          const loc = place.location;
          if (!loc) return;
          onSelect({
            formattedAddress: place.formattedAddress ?? "",
            lat: typeof loc.lat === "function" ? loc.lat() : (loc as { lat: number }).lat,
            lng: typeof loc.lng === "function" ? loc.lng() : (loc as { lng: number }).lng,
          });
        });

        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(element!);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Address search unavailable");
      }
    })();

    return () => {
      cancelled = true;
      if (element && element.parentNode) element.parentNode.removeChild(element);
      onClear?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-1">
      <div
        ref={hostRef}
        className="address-autocomplete rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-cream [&_*]:!font-[inherit]"
      />
      {error && (
        <p className="text-xs text-destructive">
          {error}. Refresh the page or type your address into the notes field.
        </p>
      )}
    </div>
  );
}
