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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "./Pagination"

export type LeaderboardPlayer = Pick<
  Statistics,
  "id" | "name" | "kills" | "attackEfficiency" | "serveAces" | "digs" | "setsTotal"
> & { blocks: number }

export const leaderboardPlayers: LeaderboardPlayer[] = [
  {
    id: "m5gr84i9",
    name: "#7 Monserrat",
    kills: 18,
    attackEfficiency: 0.31,
    blocks: 6,
    serveAces: 4,
    digs: 15,
    setsTotal: 5,
  },
  {
    id: "3u1reuv4",
    name: "#12 Silas",
    kills: 22,
    attackEfficiency: 0.32,
    blocks: 10,
    serveAces: 6,
    digs: 24,
    setsTotal: 3,
  },
  {
    id: "derv1ws0",
    name: "#9 Carmella",
    kills: 12,
    attackEfficiency: 0.32,
    blocks: 3,
    serveAces: 5,
    digs: 14,
    setsTotal: 7,
  },
  {
    id: "5kma53ae",
    name: "#4 Kathlyn",
    kills: 25,
    attackEfficiency: 0.4,
    blocks: 3,
    serveAces: 7,
    digs: 5,
    setsTotal: 27,
  },
  {
    id: "bhqecj4p",
    name: "#5 Laurie",
    kills: 30,
    attackEfficiency: 0.45,
    blocks: 4,
    serveAces: 9,
    digs: 18,
    setsTotal: 12,
  },
]

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
    accessorKey: "attack_efficiency",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Eff"
        tooltip="Attack Efficiency - (Kills - Errors) / Total Attempts"
      />
    ),
    invertSorting: true,
    accessorFn: row => row.attackEfficiency,
  },
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
    accessorKey: "blocks",
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="BS"
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
      <CardFooter className="justify-end">
        <Pagination table={table} />
      </CardFooter>
    </Card>
  )
}
