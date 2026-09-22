export function formatDate(value?: string | Date | null, timeZone = "Asia/Kolkata") {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone }).format(new Date(value));
}
export function formatDateTime(value?: string | Date | null, timeZone = "Asia/Kolkata") {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone }).format(new Date(value));
}
export function formatMoney(paise?: number | null) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((paise ?? 0) / 100); }
