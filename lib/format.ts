// Generic formatting + finance helpers. Currency and locale are configurable
// per-user (see lib/get-preferences.ts). Defaults are USD / en-US so the app
// works out of the box for any locale.

export type NumberFormatStyle = 'standard' | 'compact'

export type CurrencyInfo = {
  code: string
  label: string
  symbol: string
  /** Used to filter the picker — e.g. "United States", "India". */
  region: string
}

export type LocaleInfo = {
  code: string
  label: string
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$', region: 'United States' },
  { code: 'EUR', label: 'Euro', symbol: '€', region: 'Eurozone' },
  { code: 'GBP', label: 'British Pound', symbol: '£', region: 'United Kingdom' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', region: 'India' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', region: 'Japan' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', region: 'Australia' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', region: 'Canada' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$', region: 'Singapore' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'Fr', region: 'Switzerland' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥', region: 'China' },
  { code: 'HKD', label: 'Hong Kong Dollar', symbol: 'HK$', region: 'Hong Kong' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ', region: 'United Arab Emirates' },
  { code: 'BRL', label: 'Brazilian Real', symbol: 'R$', region: 'Brazil' },
  { code: 'MXN', label: 'Mexican Peso', symbol: 'MX$', region: 'Mexico' },
  { code: 'ZAR', label: 'South African Rand', symbol: 'R', region: 'South Africa' },
  { code: 'KRW', label: 'South Korean Won', symbol: '₩', region: 'South Korea' },
  { code: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$', region: 'New Zealand' },
  { code: 'SEK', label: 'Swedish Krona', symbol: 'kr', region: 'Sweden' },
  { code: 'NOK', label: 'Norwegian Krone', symbol: 'kr', region: 'Norway' },
  { code: 'TRY', label: 'Turkish Lira', symbol: '₺', region: 'Turkey' },
]

export const LOCALES: LocaleInfo[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'en-CA', label: 'English (Canada)' },
  { code: 'de-DE', label: 'Deutsch (Deutschland)' },
  { code: 'fr-FR', label: 'Français (France)' },
  { code: 'es-ES', label: 'Español (España)' },
  { code: 'es-MX', label: 'Español (México)' },
  { code: 'it-IT', label: 'Italiano (Italia)' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'ja-JP', label: '日本語 (日本)' },
  { code: 'ko-KR', label: '한국어 (대한민국)' },
  { code: 'zh-CN', label: '中文 (中国)' },
  { code: 'hi-IN', label: 'हिन्दी (भारत)' },
  { code: 'ar-AE', label: 'العربية (الإمارات)' },
  { code: 'nl-NL', label: 'Nederlands (Nederland)' },
  { code: 'sv-SE', label: 'Svenska (Sverige)' },
]

/** Default fallback when a user has no preferences yet. */
export const DEFAULT_PREFERENCES = {
  currency: 'USD',
  locale: 'en-US',
  numberFormat: 'standard' as NumberFormatStyle,
  theme: 'system' as 'light' | 'dark' | 'system',
}

export type MoneyFormatOptions = {
  currency: string
  locale: string
  /** standard (12,345) or compact (12.3K) */
  numberFormat?: NumberFormatStyle
  /** Default 0 for clean dashboards. */
  maximumFractionDigits?: number
  /** Render with a leading minus sign (negative-first). */
  showSign?: boolean
}

/** Generic, locale-aware money formatter. */
export function formatCurrency(
  value: number | string | null | undefined,
  options: MoneyFormatOptions,
): string {
  const num =
    value == null
      ? 0
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : value
  if (Number.isNaN(num)) {
    return new Intl.NumberFormat(options.locale, {
      style: 'currency',
      currency: options.currency,
      maximumFractionDigits: 0,
    }).format(0)
  }
  const useCompact = options.numberFormat === 'compact'
  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    notation: useCompact ? 'compact' : 'standard',
    maximumFractionDigits:
      options.maximumFractionDigits ??
      (useCompact ? 1 : num % 1 === 0 ? 0 : 2),
    signDisplay: options.showSign ? 'exceptZero' : 'auto',
  }).format(num)
}

/** Like formatCurrency but explicit with-sign call site. */
export function formatCurrencySigned(
  value: number | string | null | undefined,
  options: MoneyFormatOptions,
) {
  return formatCurrency(value, { ...options, showSign: true })
}

export function formatDate(
  date: Date | string | number | null | undefined,
  locale = 'en-US',
): string {
  if (date == null) return '—'
  const d =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatMonth(
  date: Date | string | null | undefined,
  locale = 'en-US',
): string {
  if (date == null) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(d)
}

export function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  return Number.isNaN(n) ? 0 : n
}

/**
 * Given a day-of-month (1-31), compute the next occurrence of that day
 * starting from `from` (defaults to today). If today is that day, returns today.
 */
export function nextOccurrence(
  dayOfMonth: number,
  from: Date = new Date(),
): Date {
  const base = new Date(from.getFullYear(), from.getMonth(), 1)
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
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank', label: 'Bank Transfer' },
] as const

export const CATEGORY_COLORS = [
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#3b82f6',
  '#84cc16',
  '#06b6d4',
  '#f97316',
  '#a855f7',
  '#14b8a6',
]
