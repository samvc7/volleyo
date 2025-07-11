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
import { deleteStatistics } from "./actions"
import { Statistics } from "./columns"
import { toast } from "@/hooks/use-toast"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { Team } from "@prisma/client"
import { ConfirmDataLossDialog } from "./ConfirmDataLossDialog"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"
import { useStatistics } from "./StatisticsProvider"

type EditingCell = {
  rowId: string
  columnId: string
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    editingCell?: EditingCell
    setEditingCell?: (editingCell: EditingCell | undefined) => void
    updateCell?: (rowId: string, columnId: string, value: string) => void
    updatePositionsCell?: (rowId: string, columnId: string, value: string[]) => void
  }
}

interface DataTableProps<TData, TValue> {
  teamSlug: Team["slug"]
  columns: ColumnDef<TData, TValue>[]
  isAdmin?: boolean
}

export function DataTable<TData extends Statistics, TValue>({
  teamSlug,
  columns,
  isAdmin,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const {
    statistics: data,
    setStatistics: setData,
    setHasUnsavedChanges,
    setIsFileImported,
  } = useStatistics<TData>()
  const [editingCell, setEditingCell] = useState<EditingCell>()
  const [isRemovingPlayer, startRemovingPlayerTransition] = useTransition()

  const hasSelectedRows = Object.entries(rowSelection).length > 0

  const updateCell = (rowId: string, columnId: string, value: string) => {
    let correctValueType
    if (value === "-") {
      correctValueType = undefined
    } else if (columnId === "name") {
      correctValueType = value
    } else {
      correctValueType = Number(value)
    }

    setData(prevData => {
      const newData = prevData.map(row => {
        return row.id === rowId ? { ...row, [columnId]: correctValueType } : row
      })
      return newData
    })
    setHasUnsavedChanges(true)
  }

  const updatePositionsCell = (rowId: string, columnId: string, value: string[]) => {
    setData(prevData => {
      const newData = prevData.map(row => {
        return row.id === rowId ? { ...row, [columnId]: value } : row
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
    ...(isAdmin
      ? {
          meta: {
            editingCell,
            setEditingCell: editingCell => setEditingCell(editingCell),
            updateCell,
            updatePositionsCell,
          },
        }
      : {}),
  })

  const handleUploadData = (data: TData[]) => {
    setData(data)
    setHasUnsavedChanges(true)
    setIsFileImported(true)
  }

  const handleRemove = () => {
    startRemovingPlayerTransition(async () => {
      try {
        const statisticIds = Object.keys(rowSelection).map(k => data[Number(k)].id)
        deleteStatistics(statisticIds)
        setRowSelection({})
        toast({ title: "Successfully deleted statistics" })
      } catch (error) {
        console.error(error)
        toast({ title: "Could not delete statistics. Please try again" })
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        {data.length ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter names ..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="w-full sm:w-64"
            />
            <ViewOptions table={table} />
          </div>
        ) : null}

        <PermissionClient teamSlug={teamSlug}>
          <div className="flex gap-2 ml-auto">
            {hasSelectedRows ? (
              <ConfirmDataLossDialog onConfirmAction={handleRemove}>
                <ButtonWithLoading
                  label="Remove"
                  loadingLabel={"Removing Player..."}
                  disabled={isRemovingPlayer}
                />
              </ConfirmDataLossDialog>
            ) : null}
            <UploadStatisticsInput onUploadData={handleUploadData} />
          </div>
        </PermissionClient>
      </div>
      {data.length ? (
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
      ) : null}
    </>
  )
}
