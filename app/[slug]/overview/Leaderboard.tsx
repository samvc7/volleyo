"use client"

import { Button } from "@/components/ui/button"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table"
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { ColumnHeader } from "../../statistics/[slug]/columnHeader"
import { Statistics } from "@/app/statistics/[slug]/columns"
import { getCommonPinningClasses } from "@/app/statistics/[slug]/columns/utils"
import { ViewOptions } from "../../statistics/[slug]/viewOptions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type LeaderboardPlayer = Pick<Statistics, "name" | "kills" | "serveAces" | "digs" | "setAssists"> & {
  playerId: string
  blocks: number
  score: number
}

export const columns: ColumnDef<LeaderboardPlayer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <ColumnHeader
          className="w-32"
          column={column}
          title="Name"
        />
      )
    },
  },
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
    accessorKey: "serveAces",
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
    accessorKey: "blocks",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="B"
        tooltip="Number of blocks resulting in a point when the player is the only blocker or one of multiple"
      />
    ),
    invertSorting: true,
  },
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
    accessorKey: "setAssists",
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
            <DropdownMenuItem>View Player</DropdownMenuItem>
            <DropdownMenuItem>View Statistics</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function Leaderboard<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center">
            <div className="text-2xl font-semibold leading-none tracking-tight">Leaderboard</div>
            <ViewOptions table={table} />
          </div>
        </CardTitle>
        <CardDescription>Who is the best of the best?</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={getCommonPinningClasses(header.column)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <TableCell
                        key={cell.id}
                        className={getCommonPinningClasses(cell.column)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
