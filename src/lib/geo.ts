// Shop origin (Alagappa Nagar, Pallavaram, Chennai 600117).
// Coordinates are an approximation of the Pallavaram delivery hub.
export const SHOP_LAT = 12.9700;
export const SHOP_LNG = 80.1493;
export const DELIVERY_RADIUS_KM = 5;

/** Great-circle distance in km between two lat/lng points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function distanceFromShopKm(lat: number, lng: number): number {
  return haversineKm(SHOP_LAT, SHOP_LNG, lat, lng);
}

export function isWithinDeliveryRadius(lat: number, lng: number): boolean {
  return distanceFromShopKm(lat, lng) <= DELIVERY_RADIUS_KM;
}
