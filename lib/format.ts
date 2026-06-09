// Shared formatting + finance helpers for the expense manager.

export function formatINR(value: number | string): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  if (Number.isNaN(num)) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  return Number.isNaN(n) ? 0 : n
}

/**
 * Given a day-of-month (1-31), compute the next occurrence of that day
 * starting from `from` (defaults to today). If today is that day, returns today.
 */
export function nextOccurrence(dayOfMonth: number, from: Date = new Date()): Date {
  const base = new Date(from.getFullYear(), from.getMonth(), 1)
  // Clamp the day to the number of days in the candidate month.
  function clampedDate(year: number, month: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return new Date(year, month, Math.min(dayOfMonth, daysInMonth))
  }
  let candidate = clampedDate(base.getFullYear(), base.getMonth())
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  if (candidate < today) {
    candidate = clampedDate(base.getFullYear(), base.getMonth() + 1)
  }
  return candidate
}

/** Whole days from today until the given date (negative = overdue). */
export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank Transfer" },
] as const

export const CATEGORY_COLORS = [
  "#16a34a",
  "#0891b2",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#2563eb",
  "#65a30d",
]
