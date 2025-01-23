"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Column, ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { ColumnHeader } from "./columnHeader"
import { cn } from "@/lib/utils"

// Maybe use Zod schema here later
export type Statistics = {
  id: string
  name: string
  // attack
  kills: number
  attackErrors: number
  attackAttempts: number
  attackEfficiency: number
  killsPerSet: number
  // serve
  serveAces: number
  serveErrors: number
  serveAttempts: number
  servePercentage: number
  serveEfficiency: number
  serveRating: number
  // serve receive
  receivePerfect: number
  receivePositive: number
  receiveNegative: number
  receiveError: number
  receiveAttempts: number
  receivePercentage: number
  // sets
  setAssists: number
  setsTotal: number
  setErrors: number
  // digs
  digs: number
  digErrors: number
  blockSingle: number
  blockMultiple: number
  blockErrors: number
  blocksPerSet: number
  setsPlayed: number
}

// research: Need to use invertSorting because sortDescFirst is not working
export const columns: ColumnDef<Statistics>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    // Need to define for pinning or we cannot get the proper size of the column
    size: 32,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <ColumnHeader
          className="w-32"
          column={column}
          title="# Name"
          tooltip="Player number & name"
        />
      )
    },
  },
  {
    header: "ATTACK",
    columns: [
      {
        accessorKey: "kills",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="K"
            tooltip="Kills - Number of attacks which led to a point"
          />
        ),
        invertSorting: true,
      },
      {
        accessorKey: "attack_errors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="AE"
            tooltip="Errors - Number of attacks that ended in the other team winning the point (Out, net or blocked)"
          />
        ),
        accessorFn: row => row.attackErrors,
      },
      {
        accessorKey: "attack_attempts",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total attacks"
          />
        ),
        invertSorting: true,
        accessorFn: row => row.attackAttempts,
      },
      {
        accessorKey: "attack_efficiency",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Eff"
            tooltip="Attack Efficiency - (Kills - Errors) / Total Attempts"
          />
        ),
        invertSorting: true,
        accessorFn: row => {
          if (row.attackEfficiency) return row.attackEfficiency

          const efficiency = (row.kills - row.attackErrors) / row.attackAttempts
          return round2DecimalPlaces(efficiency, 2)
        },
      },
      {
        accessorKey: "kills_per_set",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="K/S"
            tooltip="Kills per set"
          />
        ),
        invertSorting: true,
        accessorFn: row => {
          if (row.killsPerSet) return row.killsPerSet

          const killsPerSet = row.kills / row.setsPlayed
          return round2DecimalPlaces(killsPerSet, 2)
        },
      },
    ],
  },
  {
    header: "SERVE",
    columns: [
      {
        accessorKey: "serve_aces",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SA"
            tooltip="Serve Aces - Number of serves that led to a point"
          />
        ),
        accessorFn: row => row.serveAces,
        invertSorting: true,
      },
      {
        accessorKey: "serve_errors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SE"
            tooltip="Serve Errors - Number of serves that went out or to the net"
          />
        ),
        accessorFn: row => row.serveErrors,
        invertSorting: true,
      },
      {
        accessorKey: "serve_attempts",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total serves"
          />
        ),
        accessorFn: row => {
          if (row.serveAttempts) return row.serveAttempts
          return row.serveAces + row.serveErrors
        },
        invertSorting: true,
      },
      {
        accessorKey: "serve_percentage",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SP"
            tooltip="Percentage - % of serves that are not errors"
          />
        ),
        accessorFn: row => {
          if (row.servePercentage) return row.servePercentage

          const percentageRaw = (row.serveAttempts - row.serveErrors) / row.serveAttempts
          return toPercentage(percentageRaw)
        },
        invertSorting: true,
      },
      {
        accessorKey: "serve_efficiency",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Eff"
            tooltip="Serve Efficiency - (Aces - Errors) / Total Attempts"
          />
        ),
        accessorFn: row => {
          if (row.serveEfficiency) return row.serveEfficiency

          const efficiency = (row.serveAces - row.serveErrors) / row.serveAttempts
          return round2DecimalPlaces(efficiency, 2)
        },
        invertSorting: true,
      },
      {
        accessorKey: "serve_rating",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Rating"
            tooltip={
              <>
                <p>
                  Lower is better. Serve Rating reflects the avarage pass rating that a server forces on the
                  opponent.
                </p>
                <br />
                <p>
                  Serve Rating Breakdown: <br />
                  0: Ace (opponent couldn't pass, pass rating 0). <br />
                  1: Opponent passed a 1 (bad pass). <br />
                  2: Opponent passed a 2 (ok pass). <br />
                  3: Server error or Opponent passed a 3 (perfect pass).
                </p>
              </>
            }
          />
        ),
        accessorFn: row => row.serveRating,
      },
    ],
  },
  {
    header: "SERVE RECEIVE",
    columns: [
      {
        accessorKey: "receive_perfect",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="3"
            tooltip="Number of receptions that were rated at 3 (perfect)"
          />
        ),
        accessorFn: row => row.receivePerfect,
        invertSorting: true,
      },
      {
        accessorKey: "receive_positive",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="2"
            tooltip="Number of receptions that were rated at 2 (ok)"
          />
        ),
        accessorFn: row => row.receivePositive,
        invertSorting: true,
      },
      {
        accessorKey: "receive_negative",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="1"
            tooltip="Number of receptions that were rated at 1 (bad)"
          />
        ),
        accessorFn: row => row.receiveNegative,
        invertSorting: true,
      },
      {
        accessorKey: "receive_error",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="0"
            tooltip="Number of receptions that were rated at 0 (error)"
          />
        ),
        accessorFn: row => row.receiveError,
        invertSorting: true,
      },
      {
        accessorKey: "receive_attempts",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total receptions"
          />
        ),
        accessorFn: row => row.receiveAttempts,
        invertSorting: true,
      },
      {
        accessorKey: "receive_percentage",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Pass%"
            tooltip="Average pass rating"
          />
        ),
        accessorFn: row => {
          if (row.receivePercentage) return row.receivePercentage

          const percentageRaw =
            (row.receivePerfect * 3 + row.receivePositive * 2 + row.receiveNegative) / row.receiveAttempts
          return round2DecimalPlaces(percentageRaw, 2)
        },
        invertSorting: true,
      },
    ],
  },
  {
    header: "SET",
    columns: [
      {
        accessorKey: "set_assists",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Ast"
            tooltip="Assists - Number of sets that led to a point"
          />
        ),
        accessorFn: row => row.setAssists,
        invertSorting: true,
      },
      {
        accessorKey: "sets_total",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total sets"
          />
        ),
        accessorFn: row => row.setsTotal,
        invertSorting: true,
      },
      {
        accessorKey: "set_errors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="E"
            tooltip="Set Errors - Number of sets that were called by the referee as a ball handling error."
          />
        ),
        accessorFn: row => row.setErrors,
        invertSorting: true,
      },
    ],
  },
  {
    header: "DIG",
    columns: [
      {
        accessorKey: "digs",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="DS"
            tooltip="Number of successful digs (continued play)"
          />
        ),
        invertSorting: true,
      },
      {
        accessorKey: "dig_errors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="DE"
            tooltip="Number of digs that resulted in a point for the other team"
          />
        ),
        accessorFn: row => row.digErrors,
        invertSorting: true,
      },
    ],
  },
  {
    header: "BLOCK",
    columns: [
      {
        accessorKey: "block_single",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="BS"
            tooltip="Number of blocks resulting in a point when the player is the only blocker"
          />
        ),
        accessorFn: row => row.blockSingle,
        invertSorting: true,
      },
      {
        accessorKey: "block_multiple",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="BM"
            tooltip="Number of blocks resulting in a point when the player is one of multiple blockers"
          />
        ),
        accessorFn: row => row.blockMultiple,
        invertSorting: true,
      },
      {
        accessorKey: "block_errors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="BE"
            tooltip="Number of blocks where the player was called for a net violation."
          />
        ),
        accessorFn: row => row.blockErrors,
        invertSorting: true,
      },
      {
        accessorKey: "blocks_per_set",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="B/S"
            tooltip="Blocks per set"
          />
        ),
        accessorFn: row => {
          if (row.blocksPerSet) return row.blocksPerSet

          const blocksPerSet = (row.blockSingle + row.blockMultiple) / row.setsPlayed
          return round2DecimalPlaces(blocksPerSet, 2)
        },
        invertSorting: true,
      },
    ],
  },
  {
    header: "GENERAL",
    columns: [
      {
        accessorKey: "sets_played",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SP"
            tooltip="Number of sets played"
          />
        ),
        accessorFn: row => row.setsPlayed,
        invertSorting: true,
      },
    ],
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Player</DropdownMenuItem>
            <DropdownMenuItem>View Statistics</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const round2DecimalPlaces = (num: number, decimalPlaces: number) => {
  const multiplier = Math.pow(10, decimalPlaces)
  return Math.round(num * multiplier) / multiplier
}

const toPercentage = (num: number) => Math.round(num * 100)

export const getCommonPinningClasses = <TData,>(column: Column<TData>): string => {
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
