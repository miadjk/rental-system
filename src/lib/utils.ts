export function todayISO(): string {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODateOnly(s: string): Date {
  // s = yyyy-mm-dd, parse as local midnight to avoid TZ shift
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfToday(): Date {
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return n;
}

export function formatDateLong(iso?: string): string {
  if (!iso) return "—";
  const d = parseISODateOnly(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(iso?: string): string {
  if (!iso) return "—";
  const d = parseISODateOnly(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysOverdue(expectedReturnISO: string): number {
  const today = startOfToday();
  const exp = parseISODateOnly(expectedReturnISO);
  exp.setHours(0, 0, 0, 0);
  const diff = today.getTime() - exp.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function isDueToday(expectedReturnISO: string): boolean {
  return toISODate(startOfToday()) === expectedReturnISO;
}

export function isOverdue(expectedReturnISO: string): boolean {
  const today = startOfToday();
  const exp = parseISODateOnly(expectedReturnISO);
  exp.setHours(0, 0, 0, 0);
  return exp.getTime() < today.getTime();
}

export function peso(n: number): string {
  return `₱${Number(n || 0).toLocaleString("en-PH")}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Normalize a dress name for comparison: trim, collapse spaces, lowercase. */
export function normalizeDressName(name: string): string {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function validatePasswordFormat(pw: string): string | null {
  if (pw.length !== 9) return "Password must be exactly 9 characters.";
  if (!/[A-Za-z]/.test(pw)) return "Password must contain letters.";
  if (!/[0-9]/.test(pw)) return "Password must contain numbers.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain a symbol.";
  return null;
}
