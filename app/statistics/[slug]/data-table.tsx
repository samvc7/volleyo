"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnDef,
  RowData,
} from "@tanstack/react-table"
import { useState, useTransition } from "react"
import { ViewOptions } from "./viewOptions"
import { getCommonPinningClasses } from "./columns/utils"
import { UploadStatisticsInput } from "./UploadStatisticsInput"
import { saveStatistics } from "./actions"
import { Statistics } from "./columns"
import { toast } from "@/hooks/use-toast"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"

type EditingCell = {
  rowId: string
  columnId: string
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    editingCell?: EditingCell
    setEditingCell?: (editingCell: EditingCell | undefined) => void
    updateCell?: (rowId: string, columnId: string, value: string) => void
  }
}

interface DataTableProps<TData, TValue> {
  gameId: string
  columns: ColumnDef<TData, TValue>[]
  initialData?: TData[]
}

export function DataTable<TData extends Statistics, TValue>({
  gameId,
  columns,
  initialData = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<TData[]>(initialData)
  const [editingCell, setEditingCell] = useState<EditingCell>()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isPending, startTransition] = useTransition()

  const updateCell = (rowId: string, columnId: string, value: string) => {
    const correctValueType = columnId === "name" ? value : Number(value)
    setData(prevData => {
      const newData = prevData.map(row => {
        return row.id === rowId ? { ...row, [columnId]: correctValueType } : row
      })
      return newData
    })
    setHasUnsavedChanges(true)
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      columnPinning: {
        left: ["select", "name"],
      },
    },
    meta: {
      editingCell,
      setEditingCell: editingCell => setEditingCell(editingCell),
      updateCell,
    },
  })

  const handleUploadData = (data: TData[]) => {
    setData(data)
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveStatistics(data, gameId)
        setHasUnsavedChanges(false)
        toast({ title: "Successfully saved statistics" })
      } catch (error) {
        console.error(error)
        toast({ title: "Could not save statistics. Please try again" })
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-4 py-4">
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
          <UploadStatisticsInput onUploadData={handleUploadData} />
          {hasUnsavedChanges ? (
            <ButtonWithLoading
              label="Save"
              loadingLabel={"Saving..."}
              disabled={isPending}
              onClick={handleSave}
            />
          ) : null}
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
                  colSpan={table.getAllLeafColumns().length}
                  className="h-24"
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
