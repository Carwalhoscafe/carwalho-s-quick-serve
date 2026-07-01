// Shared brand styles for Carwalho's Cafe auth emails.
export const BRAND = {
  primary: '#0f3d2e',
  accent: '#c79a3a',
  cream: '#fbf7ee',
  text: '#1a1a1a',
  muted: '#666666',
  logo: 'https://carwalhoscafe.in/__l5e/assets-v1/8567d0c8-0978-40c8-9b28-111ae00ebff9/carwalhos-email-logo-white.png',
  siteUrl: 'https://www.carwalhoscafe.in',
  shopName: "Carwalho's Cafe",
  tagline: 'Pallavaram, Chennai',
} as const

export const styles = {
  main: { backgroundColor: '#ffffff', fontFamily: '-apple-system, Segoe UI, Helvetica, Arial, sans-serif', margin: 0, padding: '24px 12px' },
  container: { maxWidth: '560px', margin: '0 auto', backgroundColor: BRAND.cream, borderRadius: '16px', overflow: 'hidden' as const },
  header: { backgroundColor: BRAND.primary, padding: '24px', textAlign: 'center' as const },
  logo: { maxWidth: '220px', height: 'auto', margin: '0 auto', display: 'block' as const },
  body: { padding: '28px' },
  h1: { fontSize: '22px', fontWeight: 'bold' as const, color: BRAND.primary, margin: '0 0 16px' },
  text: { fontSize: '14px', color: BRAND.text, lineHeight: '1.6', margin: '0 0 18px' },
  link: { color: BRAND.primary, textDecoration: 'underline' },
  button: { backgroundColor: BRAND.primary, color: '#ffffff', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '999px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' as const },
  code: { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: BRAND.primary, letterSpacing: '4px', margin: '12px 0 24px' },
  footer: { fontSize: '12px', color: BRAND.muted, margin: '28px 0 0', lineHeight: '1.5' },
  footerBar: { backgroundColor: '#f0e9d6', padding: '16px 24px', textAlign: 'center' as const, fontSize: '12px', color: BRAND.muted },
}
