/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PickedLocation = {
  formattedAddress: string;
  lat: number;
  lng: number;
  landmark?: string;
  label?: string;
  pincode?: string | null;
  city?: string | null;
};

type SavedAddress = {
  id: string;
  label: string;
  address_line: string;
  landmark: string | null;
  city: string | null;
  pincode: string | null;
  lat: number;
  lng: number;
  is_default: boolean;
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
  if (!key) return Promise.reject(new Error("Maps API key not configured"));
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

async function reverseGeocode(lat: number, lng: number): Promise<{ formatted: string; pincode: string | null; city: string | null }> {
  if (!window.google) return { formatted: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, pincode: null, city: null };
  const geocoder = new window.google.maps.Geocoder();
  try {
    const { results } = await geocoder.geocode({ location: { lat, lng } });
    if (!results?.[0]) return { formatted: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, pincode: null, city: null };
    const r = results[0];
    let pincode: string | null = null;
    let city: string | null = null;
    for (const c of r.address_components ?? []) {
      if (c.types.includes("postal_code")) pincode = c.long_name;
      if (c.types.includes("locality")) city = c.long_name;
    }
    return { formatted: r.formatted_address, pincode, city };
  } catch {
    return { formatted: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, pincode: null, city: null };
  }
}

export function LocationPicker({
  onChange,
  userId,
}: {
  onChange: (loc: PickedLocation | null) => void;
  userId: string | null;
}) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const acHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [ready, setReady] = useState(false);
  const [addr, setAddr] = useState("");
  const [landmark, setLandmark] = useState("");
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved addresses
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saved_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false })
      .then(({ data }) => setSaved((data as SavedAddress[]) ?? []));
  }, [userId]);

  // Push changes upward
  useEffect(() => {
    if (!coords || !addr) { onChange(null); return; }
    onChange({
      formattedAddress: addr,
      lat: coords.lat,
      lng: coords.lng,
      landmark: landmark || undefined,
      label,
      pincode,
      city,
    });
  }, [coords, addr, landmark, label, pincode, city, onChange]);

  const setLocation = useCallback(async (lat: number, lng: number, formatted?: string) => {
    setCoords({ lat, lng });
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(17);
    }
    if (markerRef.current) markerRef.current.setPosition({ lat, lng });
    if (formatted) {
      setAddr(formatted);
      // still fetch pincode/city
      const rev = await reverseGeocode(lat, lng);
      setPincode(rev.pincode);
      setCity(rev.city);
    } else {
      const rev = await reverseGeocode(lat, lng);
      setAddr(rev.formatted);
      setPincode(rev.pincode);
      setCity(rev.city);
    }
  }, []);

  // Init map + autocomplete
  useEffect(() => {
    let cancelled = false;
    let acEl: HTMLElement | null = null;

    (async () => {
      try {
        await loadMapsJs();
        if (cancelled || !mapDivRef.current || !window.google) return;

        const defaultCenter = { lat: 12.97, lng: 80.1493 }; // Pallavaram
        const map = new window.google.maps.Map(mapDivRef.current, {
          center: defaultCenter,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        mapRef.current = map;

        const marker = new window.google.maps.Marker({
          position: defaultCenter,
          map,
          draggable: true,
        });
        markerRef.current = marker;

        marker.addListener("dragend", async () => {
          const p = marker.getPosition();
          if (!p) return;
          await setLocation(p.lat(), p.lng());
        });

        map.addListener("click", async (ev: google.maps.MapMouseEvent) => {
          if (!ev.latLng) return;
          await setLocation(ev.latLng.lat(), ev.latLng.lng());
        });

        // Autocomplete element
        if (acHostRef.current) {
          const { PlaceAutocompleteElement } =
            (await window.google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
          acEl = new (PlaceAutocompleteElement as unknown as new (opts: unknown) => HTMLElement)({
            includedRegionCodes: ["in"],
            locationBias: { center: defaultCenter, radius: 25000 },
          });
          acEl.setAttribute("style", "width:100%;");
          acEl.setAttribute("placeholder", "Search for area, street, landmark…");
          acEl.addEventListener("gmp-select", async (ev: Event) => {
            // @ts-expect-error - Maps JS event shape
            const placePrediction = ev.placePrediction;
            if (!placePrediction) return;
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ["formattedAddress", "location"] });
            const loc = place.location;
            if (!loc) return;
            const lat = typeof loc.lat === "function" ? loc.lat() : (loc as { lat: number }).lat;
            const lng = typeof loc.lng === "function" ? loc.lng() : (loc as { lng: number }).lng;
            await setLocation(lat, lng, place.formattedAddress ?? undefined);
          });
          acHostRef.current.innerHTML = "";
          acHostRef.current.appendChild(acEl);
        }

        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Map unavailable");
      }
    })();

    return () => {
      cancelled = true;
      if (acEl?.parentNode) acEl.parentNode.removeChild(acEl);
    };
  }, [setLocation]);

  async function detectMyLocation() {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setLocation(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
      },
      (err) => { setError(err.message); setDetecting(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function saveThisAddress() {
    if (!userId || !coords || !addr) return;
    setSaving(true);
    const { data, error: e } = await supabase.from("saved_addresses").insert({
      user_id: userId,
      label,
      address_line: addr,
      landmark: landmark || null,
      city, pincode,
      lat: coords.lat, lng: coords.lng,
    }).select().single();
    setSaving(false);
    if (e) setError(e.message);
    else if (data) setSaved((s) => [data as SavedAddress, ...s]);
  }

  async function pickSaved(a: SavedAddress) {
    setLabel((a.label as "Home" | "Work" | "Other") ?? "Home");
    setLandmark(a.landmark ?? "");
    await setLocation(a.lat, a.lng, a.address_line);
  }

  async function deleteSaved(id: string) {
    await supabase.from("saved_addresses").delete().eq("id", id);
    setSaved((s) => s.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      {saved.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Saved addresses</p>
          <div className="flex flex-wrap gap-2">
            {saved.map((a) => (
              <div key={a.id} className="flex items-center gap-1 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs">
                <button type="button" onClick={() => pickSaved(a)} className="text-cream hover:text-primary">
                  <span className="font-semibold">{a.label}</span> · {a.address_line.slice(0, 40)}
                </button>
                <button type="button" onClick={() => deleteSaved(a.id)} aria-label="Delete" className="text-muted-foreground hover:text-destructive">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div ref={acHostRef} className="flex-1 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-cream [&_*]:!font-[inherit]" />
        <button
          type="button"
          onClick={detectMyLocation}
          disabled={detecting || !ready}
          className="whitespace-nowrap rounded-lg border border-primary/60 bg-primary/10 px-3 py-2 text-xs font-semibold text-cream hover:bg-primary/20 disabled:opacity-50"
        >
          {detecting ? "…" : "📍 Use my location"}
        </button>
      </div>

      <div ref={mapDivRef} className="h-64 w-full rounded-lg border border-border/70 bg-card/40" />
      {ready && <p className="text-[11px] text-muted-foreground">Drag the pin or tap the map to fine-tune your exact drop-off.</p>}

      {coords && (
        <div className="space-y-2 rounded-lg border border-border/70 bg-background p-3">
          <p className="text-xs text-emerald-400">✓ {addr}</p>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="Flat / floor / landmark (e.g. Block B, near park)"
            className="w-full rounded-md border border-border/70 bg-card/40 px-3 py-2 text-sm text-cream"
          />
          <div className="flex flex-wrap items-center gap-2">
            {(["Home", "Work", "Other"] as const).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLabel(l)}
                className={`rounded-full border px-3 py-1 text-xs ${label === l ? "border-primary text-primary" : "border-border/60 text-muted-foreground"}`}
              >
                {l}
              </button>
            ))}
            {userId && (
              <button
                type="button"
                onClick={saveThisAddress}
                disabled={saving}
                className="ml-auto rounded-full border border-primary/60 px-3 py-1 text-xs font-semibold text-cream hover:bg-primary/10 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save this address"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
