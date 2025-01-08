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
  attackSuccess: number
  attackFailures: number
  digs: number
  sets: number
  blocks: number
  errors: number
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
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Name"
      />
    ),
  },
  {
    accessorKey: "attackAttempts",
    header: "Attack Attempts",
    accessorFn: row => row.attackSuccess + row.attackFailures,
  },
  {
    accessorKey: "attackSuccess",
    header: "Attack Success",
  },
  {
    accessorKey: "attackFailures",
    header: "Attack Failures",
  },
  {
    accessorKey: "attackSuccessRate",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Attack Success Rate"
      />
    ),
    invertSorting: true,
    accessorFn: row => {
      const attackSuccessRateRaw = (row.attackSuccess / (row.attackSuccess + row.attackFailures)) * 100
      const attackSuccessRate = round2DecimalPlaces(attackSuccessRateRaw)

      return attackSuccessRate
    },
  },
  {
    accessorKey: "digs",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Digs"
      />
    ),
    invertSorting: true,
  },
  {
    accessorKey: "sets",
    header: "Sets",
  },
  {
    accessorKey: "blocks",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Blocks"
      />
    ),
    invertSorting: true,
  },
  {
    accessorKey: "errors",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Errors"
      />
    ),
    invertSorting: true,
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

const round2DecimalPlaces = (num: number) => Math.round(num * 100) / 100
