"use client"

import { formatCurrency } from "@/lib/format"
import { useId } from "react"

type Point = { label: string; value: number }

export function Sparkline({
  points,
  currency,
  locale,
  numberFormat = "standard",
}: {
  points: Point[]
  currency: string
  locale: string
  numberFormat?: "standard" | "compact"
}) {
  const id = useId().replace(/:/g, "")
  const width = 280
  const height = 64
  const padX = 4
  const padY = 8

  if (points.length === 0) return null

  const max = Math.max(...points.map((p) => p.value), 1)
  const min = Math.min(...points.map((p) => p.value), 0)
  const range = max - min || 1

  const stepX =
    points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = padX + stepX * i
    const y = padY + (height - padY * 2) * (1 - (p.value - min) / range)
    return { x, y, ...p }
  })

  const linePath = coords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(" ")
  const areaPath = `${linePath} L ${coords[coords.length - 1]!.x} ${height - padY} L ${coords[0]!.x} ${height - padY} Z`

  const last = points[points.length - 1]

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-xs text-muted-foreground">
        Last {points.length} months · {formatCurrency(last!.value, { currency, locale, numberFormat })}
      </p>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="text-primary"
        aria-label="Spending trend"
      >
        <defs>
          <linearGradient id={`spark-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-grad-${id})`} />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 3 : 0}
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="flex w-full justify-between text-[10px] text-muted-foreground">
        {coords.map((c, i) =>
          i === 0 || i === coords.length - 1 || i === Math.floor(coords.length / 2) ? (
            <span key={i}>{c.label}</span>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  )
}
