'use client'

import React, { useMemo, useState } from 'react'
import {
  tableFeatures,
  rowPaginationFeature,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature, // <--- 1. Import the global filtering feature
  createPaginatedRowModel,
  createSortedRowModel,
  createFilteredRowModel,
  useTable,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { useCreateAtom } from '@tanstack/react-store'
import * as XLSX from 'xlsx'

// 2. Add globalFilteringFeature and filteredRowModel to the static config
const tableFeaturesConfig = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature, // <--- Added here
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
})

interface ExcelDataGridProps {
  headers: string[]
  data: Record<string, any>[]
}

export function ExcelDataGrid({ headers, data }: ExcelDataGridProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  const paginationAtom = useCreateAtom({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    return headers.map((header) => ({
      accessorFn: (row) => row[header],
      id: header,
      header: header,
      cell: ({ getValue }) => {
        const value = getValue()
        const stringVal = value !== null && value !== undefined ? String(value) : ''

        if (!stringVal) {
          return <span className="text-slate-600 italic">empty</span>
        }
        return <span className="text-slate-300">{stringVal}</span>
      },
    }))
  }, [headers])

  // 3. Pass globalFilter state and handlers directly into useTable config
  const table = useTable({
    features: tableFeaturesConfig,
    data,
    columns,
    state: {
      globalFilter, // Bind the search state here
    },
    onGlobalFilterChange: setGlobalFilter, // Enables table state updates when user types
    atoms: {
      pagination: paginationAtom,
    },
  })

  const paginationState = table.atoms.pagination.get()
  const rowModel = table.getRowModel()
  const selectedCount = Object.values(selectedRows).filter(Boolean).length

  const handleExportToExcel = () => {
    if (data.length === 0) return
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data')
    XLSX.writeFile(workbook, 'table-export.xlsx')
  }

  if (headers.length === 0 || data.length === 0) {
    return <p className="text-slate-500 italic text-center py-6">No spreadsheet data available to display.</p>
  }

  return (
    <div className="space-y-4 w-full bg-[#121417] text-slate-200 p-6 rounded-xl border border-slate-800/80 shadow-2xl font-sans">

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search table rows..."
            value={globalFilter} // <--- Wire state to input value
            onChange={(e) => setGlobalFilter(e.target.value)} // <--- Update local state on type
            className="w-full pl-10 pr-4 py-2 bg-[#1a1d24] border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Actions & Export Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider bg-[#1a1d24] text-cyan-400 hover:bg-[#222630] border border-cyan-500/30 transition-all shadow-sm flex items-center gap-2"
          >
            📥 Export XLSX
          </button>
        </div>
      </div>

      {/* Sub-header Controls & Row Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#1a1d24] border border-slate-800 rounded text-slate-300 font-medium">Columns</span>
          <span className="px-2.5 py-1 bg-[#1a1d24] border border-slate-800 rounded text-slate-300 font-medium">Sort</span>
        </div>
        <div className="tracking-wider uppercase font-mono">
          <div className="tracking-wider uppercase font-mono">
            {table.getFilteredRowModel().rows.length} ROWS — {selectedCount} SELECTED
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#16181d]">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-[#1a1d24]/60 text-slate-400 uppercase tracking-wider text-[11px] font-mono">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-12 px-4 py-3.5">
                  <span className="sr-only">Select All</span>
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3.5 font-medium cursor-pointer select-none hover:text-slate-200 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center mr-auto gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#14161b]">
            {rowModel.rows.length > 0 ? (
              rowModel.rows.map((row) => {
                const isSelected = !!selectedRows[row.id]
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-[#1a1d24]/50 ${isSelected ? 'bg-cyan-950/20' : ''}`}
                  >
                    <td className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          setSelectedRows(prev => ({ ...prev, [row.id]: e.target.checked }))
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    {row.getAllCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-12 text-center text-slate-500 italic">
                  No matching data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Navigation & Page Counter */}
      <div className="flex items-center justify-between pt-2 text-sm">
        <button
          className="px-4 py-1.5 rounded-lg border border-slate-800 bg-[#1a1d24] text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </button>

        <div className="text-xs tracking-widest text-slate-500 uppercase font-mono">
          PAGE <span className="text-slate-300 font-bold">{paginationState.pageIndex + 1}</span> / {table.getPageCount() || 1}
        </div>

        <button
          className="px-4 py-1.5 rounded-lg border border-slate-800 bg-[#1a1d24] text-slate-200 hover:bg-[#222630] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>

    </div>
  )
}