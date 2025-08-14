"use client"

import { useState } from "react"
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
import { MoreHorizontal } from "lucide-react"
import { getCommonPinningClasses } from "@/app/event/[slug]/columns/utils"
import { Pagination } from "../../event/[slug]/pagination"
import { ViewOptions } from "../../event/[slug]/viewOptions"
import { Button } from "@/components/ui/button"

import { ColumnHeader } from "../../event/[slug]/columnHeader"
// import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Member } from "@prisma/client"
import { removeMember } from "./actions"
import { toast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { AddTeamMemberDialog, EditTeamMemberDialog } from "./dialogs"

import { ConfirmDialog } from "@/components/ui/custom/ConfirmDialog"

export const columns: ColumnDef<Member>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
  //       onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={value => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  //   // Need to define for pinning or we cannot get the proper size of the column
  //   size: 32,
  // },
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
  // const [rowSelection, setRowSelection] = useState({})

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
    // onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      // rowSelection,
    },
  })

  return (
    <>
      <div className="flex items-center py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter names ..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="w-full sm:w-64"
          />
          <ViewOptions table={table} />
        </div>

        <div className="flex gap-2 ml-auto">
          <AddTeamMemberDialog />
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

const MemberActions = ({ member }: { member: Member }) => {
  const { slug } = useParams() as { slug: string }

  const handleRemove = async () => {
    try {
      await removeMember(slug, member.id)
      toast({ title: "Team member removed successfully" })
    } catch (error) {
      console.error(error)
      toast({ title: "Could not remove team member. Please try again" })
    }
  }

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
        <EditTeamMemberDialog member={member}>
          <DropdownMenuItem
            onSelect={e => {
              e.preventDefault()
            }}
          >
            Edit
          </DropdownMenuItem>
        </EditTeamMemberDialog>
        <ConfirmDialog
          onConfirmAction={handleRemove}
          title="Removing Team Member"
          description={
            <>
              Are you sure you want to remove{" "}
              <strong>{member.nickName || `${member.firstName} ${member.lastName}`}</strong> from the team?
            </>
          }
        >
          <DropdownMenuItem onSelect={e => e.preventDefault()}>Remove</DropdownMenuItem>
        </ConfirmDialog>

        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem disabled>View Player</DropdownMenuItem> */}
        {/* <DropdownMenuItem disabled>View Statistics</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
