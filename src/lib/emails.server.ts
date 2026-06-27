// Branded HTML email templates for Carwalho's Cafe.
// Server-only - imported only from server function handlers.

const BRAND = {
  primary: "#0f3d2e",
  accent: "#c79a3a",
  bg: "#fbf7ee",
  text: "#1a1a1a",
  muted: "#666",
  logo: "https://carwalhoscafe.in/__l5e/assets-v1/d6086ddc-be1c-4ed3-9b73-7e30bdf65bf3/carwalhos-logo-green.png",
};

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  orderType: string;
  paymentMethod: string;
  items: { name: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
};

function rowsHtml(items: OrderEmailData["items"]) {
  return items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name} <span style="color:#888">x ${i.qty}</span></td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">Rs ${i.lineTotal}</td>
    </tr>
  `).join("");
}

function shell(inner: string, preheader: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#ffffff;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND.text};">
  <span style="display:none;font-size:1px;color:#fff">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.bg};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:24px 28px;background:${BRAND.primary};text-align:center;">
          <img src="${BRAND.logo}" alt="Carwalho's Cafe" width="160" style="max-width:160px;height:auto;display:inline-block;">
        </td></tr>
        <tr><td style="padding:28px;">${inner}</td></tr>
        <tr><td style="padding:18px 28px;background:#f0e9d6;color:${BRAND.muted};font-size:12px;text-align:center;">
          Carwalho's Cafe - Pallavaram, Chennai<br>
          Mon-Fri - Order before 10:00 AM for same-day delivery<br>
          <a href="tel:+919342623521" style="color:${BRAND.primary};">+91 93426 23521</a> -
          <a href="mailto:support@carwalhoscafe.in" style="color:${BRAND.primary};">support@carwalhoscafe.in</a>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

export function customerConfirmationEmail(d: OrderEmailData) {
  const inner = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${BRAND.primary};">Thank you, ${d.customerName}!</h1>
    <p style="margin:0 0 16px;color:${BRAND.muted};">Your order <strong>${d.orderNumber}</strong> is confirmed. We will prepare and deliver it fresh.</p>
    <table width="100%" style="border-collapse:collapse;margin-top:12px;">${rowsHtml(d.items)}
      <tr><td style="padding:10px 0;">Subtotal</td><td style="padding:10px 0;text-align:right;">Rs ${d.subtotal}</td></tr>
      ${d.deliveryFee > 0 ? `<tr><td style="padding:6px 0;">Delivery</td><td style="padding:6px 0;text-align:right;">Rs ${d.deliveryFee}</td></tr>` : ""}
      <tr><td style="padding:12px 0;font-weight:700;border-top:2px solid ${BRAND.primary};">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;border-top:2px solid ${BRAND.primary};">Rs ${d.total}</td></tr>
    </table>
    <p style="margin:18px 0 4px;font-size:13px;color:${BRAND.muted};"><strong>Payment:</strong> ${d.paymentMethod}</p>
    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};"><strong>Order type:</strong> ${d.orderType}</p>
    <p style="margin:0 0 14px;font-size:13px;color:${BRAND.muted};"><strong>Estimated prep time:</strong> 30-45 minutes from confirmation.</p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">Need to change something? Call us at +91 93426 23521.</p>
  `;
  return shell(inner, `Order ${d.orderNumber} confirmed - Rs ${d.total}`);
}

export function adminNotificationEmail(d: OrderEmailData) {
  const inner = `
    <h1 style="margin:0 0 6px;font-size:20px;color:${BRAND.primary};">New order ${d.orderNumber}</h1>
    <p style="margin:0 0 14px;color:${BRAND.muted};font-size:13px;">${new Date(d.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
    <table width="100%" style="font-size:13px;color:${BRAND.text};">
      <tr><td><strong>Customer:</strong></td><td>${d.customerName}</td></tr>
      <tr><td><strong>Phone:</strong></td><td><a href="tel:${d.customerPhone}">${d.customerPhone}</a></td></tr>
      ${d.customerEmail ? `<tr><td><strong>Email:</strong></td><td>${d.customerEmail}</td></tr>` : ""}
      <tr><td><strong>Type:</strong></td><td>${d.orderType}</td></tr>
      ${d.deliveryAddress ? `<tr><td valign="top"><strong>Address:</strong></td><td>${d.deliveryAddress}</td></tr>` : ""}
      <tr><td><strong>Payment:</strong></td><td>${d.paymentMethod}</td></tr>
      ${d.notes ? `<tr><td valign="top"><strong>Notes:</strong></td><td>${d.notes}</td></tr>` : ""}
    </table>
    <h3 style="margin:18px 0 6px;color:${BRAND.primary};">Items</h3>
    <table width="100%" style="border-collapse:collapse;">${rowsHtml(d.items)}
      <tr><td style="padding:10px 0;">Subtotal</td><td style="padding:10px 0;text-align:right;">Rs ${d.subtotal}</td></tr>
      ${d.deliveryFee > 0 ? `<tr><td style="padding:6px 0;">Delivery</td><td style="padding:6px 0;text-align:right;">Rs ${d.deliveryFee}</td></tr>` : ""}
      <tr><td style="padding:12px 0;font-weight:700;border-top:2px solid ${BRAND.primary};">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;border-top:2px solid ${BRAND.primary};">Rs ${d.total}</td></tr>
    </table>
  `;
  return shell(inner, `New order ${d.orderNumber} - Rs ${d.total}`);
}
