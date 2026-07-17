'use client'

import { Download, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StyledSelect } from '@/components/styled-select'

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
  onFilterToggle?: (key: string, value: string) => void
  onClearFilters: () => void
  onExport: () => void
  resultCount: number
  totalCount: number
  searchPlaceholder?: string
  dateFilter?: string
  onDateFilterChange?: (value: string) => void
  dateFrom?: string
  dateTo?: string
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onFilterSelect?: (key: string, value: string) => void
  loading?: boolean
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
  searchPlaceholder = 'Search...',
  dateFilter,
  onDateFilterChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onFilterSelect,
  loading,
}: RecordsTableToolbarProps) {
  const activeChips = Object.entries(selectedFilters).flatMap(([key, values]) =>
    values.map((value) => {
      const filter = filters.find((f) => f.key === key)
      return { key, value, label: filter?.label ?? key }
    })
  )

  const hasDateFilter = Boolean(dateFilter || dateFrom || dateTo)
  const hasActive = activeChips.length > 0 || hasDateFilter

  const chipFilters = filters.filter((f) => f.options.length > 0)
  const dateRangeFilter = filters.find((f) => f.key === 'date' && f.options.length === 0)

  function handleFilterSelect(key: string, nextValue: string) {
    if (onFilterSelect) {
      onFilterSelect(key, nextValue)
      return
    }
    const currentValues = selectedFilters[key] ?? []
    currentValues.forEach((value) => onFilterToggle?.(key, value))
    if (nextValue) onFilterToggle?.(key, nextValue)
  }

  return (
    <div className="border-b bg-card px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : `${resultCount} of ${totalCount} records`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onExport} disabled={loading}>
            <Download className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {(chipFilters.length > 0 || dateRangeFilter || hasActive) && (
        <div className="mt-3 space-y-3">
          {dateRangeFilter && onDateFilterChange && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dateRangeFilter.label}
              </p>
              <Input
                type="date"
                value={dateFilter ?? ''}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="h-9 w-auto bg-white"
              />
            </div>
          )}

          {dateRangeFilter && onDateFromChange && onDateToChange && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dateRangeFilter.label}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom ?? ''}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="h-8 w-auto"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateTo ?? ''}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="h-8 w-auto"
                />
              </div>
            </div>
          )}

          {onDateFilterChange && !dateRangeFilter && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
              <Input
                type="date"
                value={dateFilter ?? ''}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="h-8 w-auto"
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chipFilters.map((filter) => (
              <div key={filter.key} className="space-y-1.5">
                <label
                  htmlFor={`filter-${filter.key}`}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {filter.label}
                </label>
                <StyledSelect
                  id={`filter-${filter.key}`}
                  value={selectedFilters[filter.key]?.[0] ?? ''}
                  onChange={(value) => handleFilterSelect(filter.key, value)}
                  options={filter.options}
                  placeholder={`All ${filter.label.toLowerCase()}`}
                  emptyOptionLabel={`All ${filter.label.toLowerCase()}`}
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          {hasActive && (
            <Button type="button" variant="ghost" size="xs" onClick={onClearFilters} className="text-muted-foreground">
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
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
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b)
  )
}

export function filtersToQueryParams(
  selectedFilters: Record<string, string[]>,
  extra?: Record<string, string>
): Record<string, string> {
  const params: Record<string, string> = { ...extra }
  Object.entries(selectedFilters).forEach(([key, values]) => {
    if (values.length > 0) params[key] = values.join(',')
  })
  return params
}
