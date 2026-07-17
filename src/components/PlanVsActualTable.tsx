'use client'

import { useMemo, useState } from 'react'
import {
  createInitialFilters,
  filtersToQueryParams,
  RecordsTableToolbar,
  type FilterConfig,
} from '@/components/records-table-tools'
import { RecordsPagination } from '@/components/records-pagination'
import { PageHeader } from '@/components/page-header'
import { useDebounce } from '@/hooks/use-debounce'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { fetchAllRecords } from '@/lib/fetch-all-records'
import { exportPdf } from '@/lib/pdf-export'

type PlanVsActualRow = {
  id: string
  developerName: string
  date: string
  dateValue: string
  projectName: string
  plannedTasks: string
  completedTasks: string
  inProgressTasks: string
  blockedTasks: string
  carriedForwardTasks: string
  expectedEffort: number
  actualEffort: number
  difference: number
}

export function PlanVsActualTable({ filters }: { filters: FilterConfig[] }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const [dateFilter, setDateFilter] = useState('')

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      pageSize: DEFAULT_PAGE_SIZE,
      date: dateFilter,
      ...filtersToQueryParams(selectedFilters),
    }),
    [debouncedSearch, selectedFilters, dateFilter]
  )

  const { data, total, page, totalPages, loading, error, setPage } =
    usePaginatedQuery<PlanVsActualRow>('/api/reports/plan-vs-actual', queryParams)

  async function handleExport() {
    const rows = await fetchAllRecords<PlanVsActualRow>('/api/reports/plan-vs-actual', queryParams)
    exportPdf(
      'plan-vs-actual.pdf',
      'Plan vs Actual Report',
      rows.map((row) => ({
        Developer: row.developerName,
        Date: row.date,
        Project: row.projectName,
        'Planned Tasks': row.plannedTasks,
        'Completed Tasks': row.completedTasks,
        'In-Progress Tasks': row.inProgressTasks,
        'Blocked Tasks': row.blockedTasks,
        'Carried Forward Tasks': row.carriedForwardTasks,
        'Expected Effort': row.expectedEffort,
        'Actual Effort': row.actualEffort,
        Difference: row.difference,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan vs Actual Report"
        description="Compare daily plans with end-of-day updates to understand delivery outcomes."
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <RecordsTableToolbar
          title="Plan vs Actual"
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterSelect={(key, value) =>
            setSelectedFilters((current) => ({ ...current, [key]: value ? [value] : [] }))
          }
          onClearFilters={() => { setSelectedFilters(createInitialFilters(filters)); setDateFilter('') }}
          onExport={handleExport}
          resultCount={data.length}
          totalCount={total}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          loading={loading}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Developer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planned Tasks</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blocked</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carried Forward</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expected</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actual</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{row.developerName}</div>
                    <div className="text-xs text-muted-foreground">{row.projectName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.date}</td>
                  <td className="max-w-[160px] px-5 py-3.5 text-xs">{row.plannedTasks || '—'}</td>
                  <td className="max-w-[140px] px-5 py-3.5 text-xs">{row.completedTasks || '—'}</td>
                  <td className="max-w-[140px] px-5 py-3.5 text-xs">{row.inProgressTasks || '—'}</td>
                  <td className="max-w-[140px] px-5 py-3.5 text-xs">{row.blockedTasks || '—'}</td>
                  <td className="max-w-[140px] px-5 py-3.5 text-xs">{row.carriedForwardTasks || '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.expectedEffort}h</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.actualEffort}h</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-medium ${row.difference > 0 ? 'text-red-600' : row.difference < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {row.difference > 0 ? `+${row.difference}h` : row.difference < 0 ? `${row.difference}h` : 'On track'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No report rows match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <RecordsPagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} loading={loading} />
      </div>
    </div>
  )
}
