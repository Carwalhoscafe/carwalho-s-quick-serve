// Isomorphic — runs on server and client. No deps.
// Source of truth: Shipping Policy. Mon–Fri, 10:00–14:00 IST order window.
// Inside the window on a weekday  -> "Later today" (same-day dispatch).
// Outside the window or weekend   -> next working day, "<Weekday> morning".

const IST_TZ = "Asia/Kolkata";
const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** Return the wall-clock parts of `date` in IST. */
function istParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TZ,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );
  // Build a Date interpreting the IST wall-clock parts to extract weekday safely.
  const monthIdx = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(parts.month);
  const refUtc = new Date(Date.UTC(
    Number(parts.year), monthIdx, Number(parts.day),
    Number(parts.hour), Number(parts.minute), 0,
  ));
  return {
    year: Number(parts.year),
    monthIdx,
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: refUtc.getUTCDay(), // 0=Sun..6=Sat (IST-aligned)
  };
}

/** "30 Jun, 2:14 PM" in IST. */
function formatReceived(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date).replace(",", "");
}

function nextWeekdayName(fromWeekday: number): string {
  // Given current IST weekday (0=Sun..6=Sat), return name of next Mon–Fri.
  let d = fromWeekday + 1;
  for (let i = 0; i < 8; i++) {
    const w = (d + i) % 7;
    if (w >= 1 && w <= 5) return WEEKDAY_NAMES[w];
  }
  return "Monday";
}

export function computeEstimatedDelivery(
  orderType: "delivery" | "pickup",
  placedAt: Date,
): { receivedLabel: string; etaLabel: string } {
  const p = istParts(placedAt);
  const isWeekday = p.weekday >= 1 && p.weekday <= 5;
  const minutes = p.hour * 60 + p.minute;
  const windowStart = 10 * 60; // 10:00
  const windowEnd = 14 * 60;   // 14:00
  const insideWindow = isWeekday && minutes >= windowStart && minutes < windowEnd;

  const receivedLabel = formatReceived(placedAt);
  const etaLabel = insideWindow
    ? "Later today"
    : `${nextWeekdayName(p.weekday)} morning`;

  // pickup branch reserved for later — same shape today.
  void orderType;
  return { receivedLabel, etaLabel };
}
