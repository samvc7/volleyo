"use client"

import { ReactNode, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
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
import { ColumnHeader } from "../statistics/columnHeader"
import { getCommonPinningClasses } from "../statistics/columns"
import { Pagination } from "../statistics/pagination"
import { ViewOptions } from "../statistics/viewOptions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export const TeamMembersView = () => {
  return (
    <section>
      <DataTable
        columns={columns}
        data={teamMembers}
      />
    </section>
  )
}

export type TeamMember = {
  id: string
  name: string
  email: string
}

export const teamMembers: TeamMember[] = [
  { id: "a1b2c3d4", name: "Liam Anderson", email: "liam.anderson@example.com" },
  { id: "e5f6g7h8", name: "Emma Johnson", email: "emma.johnson@example.com" },
  { id: "i9j0k1l2", name: "Noah Williams", email: "noah.williams@example.com" },
  { id: "m3n4o5p6", name: "Olivia Brown", email: "olivia.brown@example.com" },
  { id: "q7r8s9t0", name: "William Garcia", email: "william.garcia@example.com" },
  { id: "u1v2w3x4", name: "Sophia Martinez", email: "sophia.martinez@example.com" },
  { id: "y5z6a7b8", name: "James Rodriguez", email: "james.rodriguez@example.com" },
  { id: "c9d0e1f2", name: "Ava Davis", email: "ava.davis@example.com" },
  { id: "g3h4i5j6", name: "Benjamin Wilson", email: "benjamin.wilson@example.com" },
  { id: "k7l8m9n0", name: "Mia Lopez", email: "mia.lopez@example.com" },
]

export const columns: ColumnDef<TeamMember>[] = [
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
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
    <AddTeamMemberDialog>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names ..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <ViewOptions table={table} />
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
    </AddTeamMemberDialog>
  )
}

const AddTeamMemberDialog = ({ children }: { children: ReactNode }) => {
  const [showNewMemberDialog, setShowNewMemberDialog] = useState(false)

  return (
    <Dialog
      open={showNewMemberDialog}
      onOpenChange={setShowNewMemberDialog}
    >
      <DialogTrigger
        className="flex"
        asChild
      >
        <Button
          variant={"outline"}
          aria-expanded={showNewMemberDialog}
          aria-label="Create Team Member"
          onClick={() => {
            setShowNewMemberDialog(true)
          }}
          className="ml-auto"
        >
          <PlusCircle className="h-5 w-5" />
          Add Member
        </Button>
      </DialogTrigger>
      {children}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Add a team member for your team.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowNewMemberDialog(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
