// Server-only integration helpers: Resend email + Google Sheets append.
// Imported only from .functions.ts handlers (inside the handler body).

const RESEND_URL = "https://connector-gateway.lovable.dev/resend/emails";
const SHEETS_BASE = "https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets";
const DRIVE_BASE = "https://connector-gateway.lovable.dev/google_sheets/v3/files";

function gatewayHeaders(secretEnv: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const apiKey = process.env[secretEnv];
  if (!lovableKey || !apiKey) {
    throw new Error(`Missing ${!lovableKey ? "LOVABLE_API_KEY" : secretEnv}`);
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": apiKey,
  };
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: gatewayHeaders("RESEND_API_KEY"),
      body: JSON.stringify({
        from: "Carwalho's Cafe <no-reply@carwalhoscafe.in>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo ?? "support@carwalhoscafe.in",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[resend] failed", res.status, body);
      return { ok: false as const, error: `Resend ${res.status}` };
    }
    return { ok: true as const, data: await res.json() };
  } catch (e) {
    console.error("[resend] exception", e);
    return { ok: false as const, error: String(e) };
  }
}

let cachedSpreadsheetId: string | null = null;

async function resolveSpreadsheetId(): Promise<string | null> {
  if (cachedSpreadsheetId) return cachedSpreadsheetId;
  const envId = process.env.SHEETS_SPREADSHEET_ID;
  if (envId) {
    cachedSpreadsheetId = envId;
    return envId;
  }
  // Try Drive search via gateway
  try {
    const q = encodeURIComponent(
      "name = \"Carwalho's Cafe Business System\" and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
    );
    const res = await fetch(`${DRIVE_BASE}?q=${q}&fields=files(id,name)&pageSize=5`, {
      headers: gatewayHeaders("GOOGLE_SHEETS_API_KEY"),
    });
    if (!res.ok) {
      console.warn("[sheets] drive search failed", res.status);
      return null;
    }
    const body = await res.json();
    const file = body.files?.[0];
    if (file?.id) {
      cachedSpreadsheetId = file.id;
      return file.id;
    }
  } catch (e) {
    console.warn("[sheets] drive search exception", e);
  }
  return null;
}

export async function appendSheetRow(worksheet: string, row: (string | number)[]) {
  try {
    const spreadsheetId = await resolveSpreadsheetId();
    if (!spreadsheetId) {
      console.warn("[sheets] no spreadsheet id; skipping append to", worksheet);
      return { ok: false as const, error: "no spreadsheet" };
    }
    const range = `${worksheet}!A:Z`;
    const url = `${SHEETS_BASE}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const res = await fetch(url, {
      method: "POST",
      headers: gatewayHeaders("GOOGLE_SHEETS_API_KEY"),
      body: JSON.stringify({ values: [row] }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[sheets] append failed", res.status, body);
      return { ok: false as const, error: `Sheets ${res.status}` };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("[sheets] exception", e);
    return { ok: false as const, error: String(e) };
  }
}

async function getSheetValues(range: string): Promise<string[][] | null> {
  try {
    const spreadsheetId = await resolveSpreadsheetId();
    if (!spreadsheetId) return null;
    const url = `${SHEETS_BASE}/${spreadsheetId}/values/${range}`;
    const res = await fetch(url, { headers: gatewayHeaders("GOOGLE_SHEETS_API_KEY") });
    if (!res.ok) {
      console.warn("[sheets] get failed", range, res.status);
      return null;
    }
    const body = await res.json();
    return (body.values ?? []) as string[][];
  } catch (e) {
    console.warn("[sheets] get exception", e);
    return null;
  }
}

async function updateSheetRange(range: string, values: (string | number)[][]) {
  try {
    const spreadsheetId = await resolveSpreadsheetId();
    if (!spreadsheetId) return { ok: false as const };
    const url = `${SHEETS_BASE}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: "PUT",
      headers: gatewayHeaders("GOOGLE_SHEETS_API_KEY"),
      body: JSON.stringify({ values }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[sheets] update failed", res.status, body);
      return { ok: false as const, error: `Sheets ${res.status}` };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("[sheets] update exception", e);
    return { ok: false as const, error: String(e) };
  }
}

/**
 * Upsert a user row into the `Users` worksheet.
 * Columns: A user_id | B email | C name | D provider | E first_seen | F last_seen | G login_count
 * Requires a `Users` tab to exist in the spreadsheet (create it manually with headers).
 */
export async function upsertUserRow(input: {
  userId: string;
  email: string | null;
  name: string | null;
  provider: string | null;
  nowIso: string;
}) {
  const rows = await getSheetValues("Users!A:G");
  const nowLocal = new Date(input.nowIso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  // If sheet doesn't exist or is empty, append a header row first then the data row.
  if (rows == null || rows.length === 0) {
    await appendSheetRow("Users", ["user_id", "email", "name", "provider", "first_seen", "last_seen", "login_count"]);
    return appendSheetRow("Users", [
      input.userId,
      input.email ?? "",
      input.name ?? "",
      input.provider ?? "",
      nowLocal,
      nowLocal,
      1,
    ]);
  }
  // Find existing row (skip header if present).
  const startIdx = rows[0]?.[0]?.toLowerCase() === "user_id" ? 1 : 0;
  let foundRow = -1;
  let currentCount = 0;
  for (let i = startIdx; i < rows.length; i++) {
    if (rows[i]?.[0] === input.userId) {
      foundRow = i + 1; // 1-indexed
      currentCount = Number(rows[i]?.[6] ?? 0) || 0;
      break;
    }
  }
  if (foundRow === -1) {
    return appendSheetRow("Users", [
      input.userId,
      input.email ?? "",
      input.name ?? "",
      input.provider ?? "",
      nowLocal,
      nowLocal,
      1,
    ]);
  }
  // Update last_seen (F) and login_count (G) only.
  return updateSheetRange(`Users!F${foundRow}:G${foundRow}`, [[nowLocal, currentCount + 1]]);
}
