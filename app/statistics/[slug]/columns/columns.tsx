"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnHeader } from "../columnHeader"
import { columnHelper, replaceEmptyToDash, round2DecimalPlaces, toPercentage } from "./utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CellContext } from "@tanstack/react-table"
import { Statistics } from "."
import { Badge } from "@/components/ui/badge"

export const selectActionColumn = columnHelper.display({
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
})

export const nameColumn = columnHelper.accessor(
  replaceEmptyToDash(row => {
    if (row.name.includes("total_a")) return "Team Total"
    return row.name
  }),
  {
    id: "name",
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
)

export const positionColumn = columnHelper.accessor(
  replaceEmptyToDash(row => {
    return row.positions?.map(position => <Badge variant="outline">{position}</Badge>)
  }),
  {
    id: "positions",
    header: ({ column }) => {
      return (
        <ColumnHeader
          column={column}
          title="Positions"
          tooltip="Player positions"
        />
      )
    },
  },
)

export const attackGroupColum = columnHelper.group({
  header: "ATTACK",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.kills),
      {
        id: "kills",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="K"
            tooltip="Kills - Number of attacks which led to a point"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.attackErrors),
      {
        id: "attackErrors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="AE"
            tooltip="Errors - Number of attacks that ended in the other team winning the point (Out, net or blocked)"
          />
        ),
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.attackAttempts),
      {
        id: "attackAttempts",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total attacks"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (
          row.attackEfficiency ||
          row.kills === undefined ||
          row.attackErrors === undefined ||
          row.attackAttempts === undefined
        )
          return row.attackEfficiency

        const efficiency = (row.kills - row.attackErrors) / row.attackAttempts
        const rounded = round2DecimalPlaces(efficiency, 2)
        if (isNaN(rounded)) return row.attackEfficiency
        return rounded
      }),
      {
        id: "attackEfficiency",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Eff"
            tooltip="Attack Efficiency - (Kills - Errors) / Total Attempts"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (row.killsPerSet || !row.kills || !row.setsPlayed) return row.killsPerSet

        const killsPerSet = row.kills / row.setsPlayed
        return round2DecimalPlaces(killsPerSet, 2)
      }),
      {
        id: "killsPerSet",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="K/S"
            tooltip="Kills per set"
          />
        ),
        invertSorting: true,
      },
    ),
  ],
})

export const serveGroupColumn = columnHelper.group({
  header: "SERVE",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.serveAces),
      {
        id: "serveAces",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SA"
            tooltip="Serve Aces - Number of serves that led to a point"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.serveErrors),
      {
        id: "serveErrors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SE"
            tooltip="Serve Errors - Number of serves that went out or to the net"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (row.serveAttempts || !row.serveAces || !row.serveErrors) return row.serveAttempts
        return row.serveAces + row.serveErrors
      }),
      {
        id: "serveAttempts",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total serves"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (row.servePercentage || !row.serveAttempts || !row.serveErrors) return row.servePercentage

        const percentageRaw = (row.serveAttempts - row.serveErrors) / row.serveAttempts
        if (isNaN(percentageRaw)) return row.servePercentage
        return toPercentage(percentageRaw)
      }),
      {
        id: "servePercentage",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SP"
            tooltip="Percentage - % of serves that are not errors"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (row.serveEfficiency || !row.serveAces || !row.serveErrors || !row.serveAttempts)
          return row.serveEfficiency
        const efficiency = (row.serveAces - row.serveErrors) / row.serveAttempts
        if (isNaN(efficiency)) return row.serveEfficiency
        return round2DecimalPlaces(efficiency, 2)
      }),
      {
        id: "serveEfficiency",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Eff"
            tooltip="Serve Efficiency - (Aces - Errors) / Total Attempts"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.serveRating),
      {
        id: "serveRating",
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
      },
    ),
  ],
})

export const receiveGroupColumn = columnHelper.group({
  header: "SERVE RECEIVE",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.receivePerfect),
      {
        id: "receivePerfect",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="3"
            tooltip="Number of receptions that were rated at 3 (perfect)"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.receivePositive),
      {
        id: "receivePositive",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="2"
            tooltip="Number of receptions that were rated at 2 (ok)"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.receiveNegative),
      {
        id: "receiveNegative",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="1"
            tooltip="Number of receptions that were rated at 1 (bad)"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.receiveError),
      {
        id: "receiveError",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="0"
            tooltip="Number of receptions that were rated at 0 (error)"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.receiveAttempts),
      {
        id: "receiveAttempts",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total receptions"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (
          row.receivePercentage ||
          !row.receivePerfect ||
          !row.receivePositive ||
          !row.receiveNegative ||
          !row.receiveAttempts
        )
          return row.receivePercentage

        const percentageRaw =
          (row.receivePerfect * 3 + row.receivePositive * 2 + row.receiveNegative) / row.receiveAttempts
        if (isNaN(percentageRaw)) return row.receivePercentage
        return round2DecimalPlaces(percentageRaw, 2)
      }),
      {
        id: "receivePercentage",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Pass%"
            tooltip="Average pass rating"
          />
        ),
        invertSorting: true,
      },
    ),
  ],
})

export const setsGroupColumn = columnHelper.group({
  header: "SET",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.setAssists),
      {
        id: "setAssists",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="Ast"
            tooltip="Assists - Number of sets that led to a point"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.setsTotal),
      {
        id: "setsTotal",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="TA"
            tooltip="Total Attempts - Total sets"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.setErrors),
      {
        id: "setErrors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="E"
            tooltip="Set Errors - Number of sets that were called by the referee as a ball handling error."
          />
        ),
        invertSorting: true,
      },
    ),
  ],
})

export const digGroupColumn = columnHelper.group({
  header: "DIG",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.digs),
      {
        id: "digs",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="DS"
            tooltip="Number of successful digs (continued play)"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.digErrors),
      {
        id: "digErrors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="DE"
            tooltip="Number of digs that resulted in a point for the other team"
          />
        ),
        invertSorting: true,
      },
    ),
  ],
})

export const blockGroupColumn = columnHelper.group({
  header: "BLOCK",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.blockSingle),
      {
        id: "blockSingle",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="BS"
            tooltip="Number of blocks resulting in a point when the player is the only blocker"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.blockMultiple),
      {
        id: "blockMultiple",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="BM"
            tooltip="Number of blocks resulting in a point when the player is one of multiple blockers"
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => row.blockErrors),
      {
        id: "blockErrors",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="BE"
            tooltip="Number of blocks where the player was called for a net violation."
          />
        ),
        invertSorting: true,
      },
    ),
    columnHelper.accessor(
      replaceEmptyToDash(row => {
        if (row.blocksPerSet || !row.blockSingle || !row.blockMultiple || !row.setsPlayed)
          return row.blocksPerSet

        const blocksPerSet = (row.blockSingle + row.blockMultiple) / row.setsPlayed
        return round2DecimalPlaces(blocksPerSet, 2)
      }),
      {
        id: "blocksPerSet",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="B/S"
            tooltip="Blocks per set"
          />
        ),
        invertSorting: true,
      },
    ),
  ],
})

export const generalGroupColumn = columnHelper.group({
  header: "GENERAL",
  columns: [
    columnHelper.accessor(
      replaceEmptyToDash(row => row.setsPlayed),
      {
        id: "setsPlayed",
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title="SP"
            tooltip="Number of sets played"
          />
        ),
        invertSorting: true,
      },
    ),
  ],
})

export const actionsColumn = columnHelper.display({
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
})

const editableCell = ({ row, column, table, getValue }: CellContext<Statistics, any>) => {
  const { editingCell, setEditingCell, updateCell } = table.options.meta || {}
  const isEditingCurrentCell = editingCell?.rowId === row.original.id && editingCell?.columnId === column.id

  return isEditingCurrentCell ? (
    <Input
      autoFocus
      defaultValue={getValue()}
      onBlur={e => {
        updateCell?.(row.original.id, column.id, e.target.value)
        setEditingCell?.(undefined)
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          updateCell?.(row.original.id, column.id, e.currentTarget.value)
          setEditingCell?.(undefined)
        }
        if (e.key === "Escape") {
          setEditingCell?.(undefined)
        }
      }}
      className="max-w-sm"
    />
  ) : (
    <span onClick={() => setEditingCell?.({ rowId: row.original.id, columnId: column.id })}>
      {getValue()}
    </span>
  )
}

// Process columns
const dataColumns = [
  nameColumn,
  attackGroupColum,
  serveGroupColumn,
  receiveGroupColumn,
  setsGroupColumn,
  digGroupColumn,
  blockGroupColumn,
  generalGroupColumn,
]

dataColumns.forEach(column => {
  if ("columns" in column && column.columns) {
    column.columns.forEach(columnAccessor => {
      columnAccessor.cell = (props: Parameters<typeof editableCell>[0]) => editableCell(props)
    })
  }
  column.cell = (props: Parameters<typeof editableCell>[0]) => editableCell(props)
})
