'use client'

import { Download, Filter, Search, X } from 'lucide-react'

export type FilterConfig = {
  key: string
  label: string
  options: string[]
}

type RecordsTableToolbarProps = {
  title?: string
  search: string
  onSearchChange: (value: string) => void
  filters: FilterConfig[]
  selectedFilters: Record<string, string[]>
  onFilterToggle: (key: string, value: string) => void
  onClearFilters: () => void
  onExport: () => void
  resultCount: number
  totalCount: number
}

export function RecordsTableToolbar({
  title = 'Records',
  search,
  onSearchChange,
  filters,
  selectedFilters,
  onFilterToggle,
  onClearFilters,
  onExport,
  resultCount,
  totalCount,
}: RecordsTableToolbarProps) {
  const activeFilterCount = Object.values(selectedFilters).reduce((count, values) => count + values.length, 0)

  return (
    <div className="border-b bg-white px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{resultCount} of {totalCount} shown</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search records"
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-gray-900"
            />
          </label>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            CSV
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {filters.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filters.map((filter) => (
            <fieldset key={filter.key} className="rounded-md border border-gray-200 p-3">
              <legend className="flex items-center gap-2 px-1 text-xs font-semibold uppercase text-gray-500">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                {filter.label}
              </legend>
              <div className="mt-2 flex max-h-28 flex-wrap gap-2 overflow-auto">
                {filter.options.map((option) => {
                  const checked = selectedFilters[filter.key]?.includes(option) ?? false

                  return (
                    <label
                      key={option}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                        checked ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onFilterToggle(filter.key, option)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  )
}

export function createInitialFilters(filters: FilterConfig[]) {
  return filters.reduce<Record<string, string[]>>((selected, filter) => {
    selected[filter.key] = []
    return selected
  }, {})
}

export function matchesFilters<T extends Record<string, unknown>>(
  row: T,
  selectedFilters: Record<string, string[]>,
) {
  return Object.entries(selectedFilters).every(([key, selected]) => {
    if (selected.length === 0) return true
    const value = row[key]

    if (Array.isArray(value)) {
      return value.some((item) => selected.includes(String(item)))
    }

    return selected.includes(String(value ?? ''))
  })
}

export function exportCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escapeCell = (value: string | number | null | undefined) => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }
  const csv = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b))
}
