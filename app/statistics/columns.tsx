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
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { ColumnHeader } from "./columnHeader"

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
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <ColumnHeader
          className="w-32"
          column={column}
          title="# Name"
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
          />
        ),
        accessorFn: row => row.receiveError,
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
