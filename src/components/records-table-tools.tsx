'use client'

import { Download, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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
  searchPlaceholder?: string
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
}: RecordsTableToolbarProps) {
  const activeChips = Object.entries(selectedFilters).flatMap(([key, values]) =>
    values.map((value) => {
      const filter = filters.find((f) => f.key === key)
      return { key, value, label: filter?.label ?? key }
    })
  )

  const allFilterOptions = filters.flatMap((filter) =>
    filter.options.map((option) => ({ key: filter.key, value: option, label: filter.label }))
  )

  return (
    <div className="border-b bg-card px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {resultCount} of {totalCount} records
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
          <Button type="button" variant="outline" size="sm" onClick={onExport}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {(allFilterOptions.length > 0 || activeChips.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {allFilterOptions.map(({ key, value, label }) => {
            const active = selectedFilters[key]?.includes(value) ?? false
            return (
              <button
                key={`${key}-${value}`}
                type="button"
                onClick={() => onFilterToggle(key, value)}
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground'
                )}
                title={label}
              >
                {value}
              </button>
            )
          })}
          {activeChips.length > 0 && (
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
