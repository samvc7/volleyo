import { cn } from "@/lib/utils"
import { Column, createColumnHelper } from "@tanstack/react-table"
import { Statistics } from "."
import { Position } from "@prisma/client"

export const columnHelper = createColumnHelper<Statistics>()

export const round2DecimalPlaces = (num: number, decimalPlaces: number) => {
  const multiplier = Math.pow(10, decimalPlaces)
  return Math.round(num * multiplier) / multiplier
}

export const toPercentage = (num: number) => Math.round(num * 100)

export const getCommonPinningClasses = <TData>(column: Column<TData>): string => {
  const isPinned = column.getIsPinned()
  if (!isPinned) return ""

  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right")

  const leftPixels = column.getStart("left")
  // somehow directly applying the value into the leftStyle string literal doesn't work, when needed to it for right pin too
  const pix = `${leftPixels}px`
  const leftStyle = `left-[${pix}]`
  const rightPixels = column.getAfter("right")

  const classes = cn(
    // Base classes for pinned columns
    "sticky bg-white z-30",
    // Positioning based on pinning direction
    isPinned === "left" && leftStyle,
    isPinned === "right" && `right-[${rightPixels}px]`,
    // Add shadow effect for pinned columns
    isLastLeftPinnedColumn && "shadow-[inset_-4px_0_4px_-4px_gray]",
    isFirstRightPinnedColumn && "shadow-[inset_4px_0_4px_-4px_gray]",
    `w-${column.getSize()}`,
    // Add opacity to pinned columns for subtle styling
    "opacity-95",
  )

  return classes
}

// TODO: better type return value
export const replaceEmptyToDash = (fn: (row: Statistics) => any) => {
  return (row: Statistics) => {
    const value = fn ? fn(row) : row
    return value === null || value === undefined || value === "" || value.length === 0 ? "-" : value
  }
}

export const positionLongLabels: Record<Position, string> = {
  OUTSIDE_HITTER: "Outside Hitter",
  OPPOSITE: "Opposite",
  MIDDLE_BLOCKER: "Middle Blocker",
  SETTER: "Setter",
  LIBERO: "Libero",
}

export const positionShortLabels: Record<Position, string> = {
  OUTSIDE_HITTER: "OH",
  OPPOSITE: "DIA",
  MIDDLE_BLOCKER: "MB",
  SETTER: "S",
  LIBERO: "L",
}

export const positionBadgeColors: Record<Position, string> = {
  OUTSIDE_HITTER: "border-sky-500 text-sky-600",
  OPPOSITE: "border-indigo-500 text-indigo-600",
  MIDDLE_BLOCKER: "border-rose-500 text-rose-600",
  SETTER: "border-emerald-500 text-emerald-600",
  LIBERO: "border-amber-500 text-amber-600",
}
