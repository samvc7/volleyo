"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnDef,
  RowData,
} from "@tanstack/react-table"
import { useState } from "react"
import { Pagination } from "./pagination"
import { ViewOptions } from "./viewOptions"
import { getCommonPinningClasses } from "./columns/utils"
import { UploadStatisticsInput } from "./UploadStatisticsInput"

type EditingCell = {
  rowId: string
  columnId: string
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    editingCell?: EditingCell
    setEditingCell?: ({ rowId, columnId }: EditingCell | undefined) => void
    updateCell?: (rowId: string, columnId: string, value: string) => void
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  initialData?: TData[]
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  initialData = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<TData[]>(initialData)
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string }>()

  const updateCell = (rowId: string, columnId: string, value: string) => {
    setData(prevData => {
      const newData = prevData.map(row => (row.id === rowId ? { ...row, [columnId]: value } : row))
      return newData
    })
  }

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
  }

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
          <UploadStatisticsInput onUploadData={handleUploadData} />
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
                  colSpan={table.getAllLeafColumns().length}
                  className="h-24"
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
    </>
  )
}
