"use client"

import { useActionState, useState } from "react"
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react"
import { getCommonPinningClasses } from "../statistics/columns"
import { Pagination } from "../statistics/pagination"
import { ViewOptions } from "../statistics/viewOptions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { ColumnHeader } from "../statistics/columnHeader"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Member } from "@prisma/client"
import { createMember } from "./actions"
import { useToast } from "@/hooks/use-toast"

export const columns: ColumnDef<Member>[] = [
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

const AddTeamMemberDialog = () => {
  const { toast } = useToast()
  const [showNewMemberDialog, setShowNewMemberDialog] = useState(false)
  const [state, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      await createMember(formData)
      setShowNewMemberDialog(false)
      toast({ title: "Team member added successfully" })
    } catch (error) {
      console.error(error)
      return "Could not create new team member. Please try again"
    }

    return null
  }, null)

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
          className="h-8"
          variant={"outline"}
          size="sm"
          aria-expanded={showNewMemberDialog}
          aria-label="Create Team Member"
          onClick={() => {
            setShowNewMemberDialog(true)
          }}
        >
          <PlusCircle className="h-5 w-5" />
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Add a team member for your team.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickName">Nick Name</Label>
              <Input
                id="nickName"
                name="nickName"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewMemberDialog(false)}
            >
              Cancel
            </Button>

            <Button
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
