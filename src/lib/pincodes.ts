// Serviceable pincodes within ~5km of Pallavaram, Chennai.
// Update this list as the delivery footprint expands.
export const SERVICEABLE_PINCODES = new Set<string>([
  "600043", // Pallavaram
  "600044", // Chromepet
  "600045", // Tirusulam
  "600064", // Chitlapakkam
  "600114", // MEPZ / Tambaram Sanatorium (partial)
  "600016", // Meenambakkam
  "600117", // Zamin Pallavaram / Anakaputhur border
  "600063", // Anakaputhur
  "600073", // Rajakilpakkam / Sembakkam (partial)
]);

export function isValidPincodeFormat(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

export function isServiceablePincode(pin: string): boolean {
  return isValidPincodeFormat(pin) && SERVICEABLE_PINCODES.has(pin);
}
