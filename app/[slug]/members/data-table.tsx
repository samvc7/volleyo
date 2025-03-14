"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
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
import { MoreHorizontal, Loader2 } from "lucide-react"
import { getCommonPinningClasses } from "@/app/statistics/[slug]/columns/utils"
import { Pagination } from "../../statistics/[slug]/pagination"
import { ViewOptions } from "../../statistics/[slug]/viewOptions"
import { Button } from "@/components/ui/button"

import { ColumnHeader } from "../../statistics/[slug]/columnHeader"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Person } from "@prisma/client"
import { editMember, removeMember } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { AddTeamMemberDialog, EditTeamMemberDialog } from "./dialogs"

export const columns: ColumnDef<Person>[] = [
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
          title="Name"
        />
      )
    },
    accessorFn: row => (row.nickName ? row.nickName : `${row.firstName} ${row.lastName}`),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <ColumnHeader
          column={column}
          title="Email"
        />
      )
    },
  },
  {
    id: "actions",
    cell: data => {
      return <MemberActions member={data.row.original} />
    },
  },
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names ..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 ml-auto">
          <AddTeamMemberDialog />
          <ViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border">
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
      </div>

      <Pagination table={table} />
    </>
  )
}

const MemberActions = ({ member }: { member: Person }) => {
  const { slug } = useParams() as { slug: string }
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeMember(slug, member.id)
        toast({ title: "Team member removed successfully" })
      } catch (error) {
        console.error(error)
        toast({ title: "Could not remove team member. Please try again" })
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="sr-only">Loading</span>
              <Loader2 className="animate-spin h-4 w-4" />
            </>
          ) : (
            <>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <EditTeamMemberDialog member={member}>
          <DropdownMenuItem
            onSelect={e => {
              e.preventDefault()
            }}
          >
            Edit
          </DropdownMenuItem>
        </EditTeamMemberDialog>
        <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>View Player</DropdownMenuItem>
        <DropdownMenuItem disabled>View Statistics</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
