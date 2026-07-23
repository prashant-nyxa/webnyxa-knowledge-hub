'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import {
  aggregateDeveloperHistory,
  type WorkHistoryRecord,
} from '@/lib/work-history'
import { CategoryBadge } from '@/components/status-badges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/work-history/stat-card'
import {
  WorkHistoryFilters,
  emptyWorkHistoryFilters,
  type WorkHistoryFilterState,
} from '@/components/work-history/work-history-filters'
import { WorkHistoryTaskTable } from '@/components/work-history/work-history-task-table'
import { RecordsPagination } from '@/components/records-pagination'
import { useDebounce } from '@/hooks/use-debounce'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { fetchAllRecords } from '@/lib/fetch-all-records'
import type { FilterConfig } from '@/components/records-table-tools'

type EffortSummary = {
  expectedEffort: number
  actualEffort: number
  difference: number
}

function buildQueryParams(
  base: { developerId?: string; projectId?: string },
  filterState: WorkHistoryFilterState,
  search: string
) {
  return {
    ...base,
    search,
    pageSize: DEFAULT_PAGE_SIZE,
    dateFrom: filterState.dateFrom,
    dateTo: filterState.dateTo,
    project: filterState.projects.join(','),
    developer: filterState.developers.join(','),
    technology: filterState.technologies.join(','),
    status: filterState.statuses.join(','),
    workType: filterState.workTypes.join(','),
  }
}

async function fetchEffortSummary(
  params: Record<string, string | number | undefined>
): Promise<EffortSummary> {
  const searchParams = new URLSearchParams()
  Object.entries({ ...params, page: 1, pageSize: 1 }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      searchParams.set(key, String(value))
    }
  })
  const response = await fetch(`/api/work-history?${searchParams.toString()}`)
  if (!response.ok) {
    return { expectedEffort: 0, actualEffort: 0, difference: 0 }
  }
  const result = await response.json()
  return (
    result.summary ?? { expectedEffort: 0, actualEffort: 0, difference: 0 }
  )
}

export function DeveloperWorkHistoryView({
  developerId,
  filters,
}: {
  developerId: string
  filters: FilterConfig[]
}) {
  const [filterState, setFilterState] = useState<WorkHistoryFilterState>(emptyWorkHistoryFilters())
  const debouncedSearch = useDebounce(filterState.search)
  const [allRecords, setAllRecords] = useState<WorkHistoryRecord[]>([])
  const [effort, setEffort] = useState<EffortSummary>({
    expectedEffort: 0,
    actualEffort: 0,
    difference: 0,
  })

  const queryParams = useMemo(
    () => buildQueryParams({ developerId }, filterState, debouncedSearch),
    [developerId, filterState, debouncedSearch]
  )

  const { data, total, page, totalPages, loading, setPage } =
    usePaginatedQuery<WorkHistoryRecord>('/api/work-history', queryParams)

  useEffect(() => {
    fetchAllRecords<WorkHistoryRecord>('/api/work-history', queryParams)
      .then(setAllRecords)
      .catch(() => setAllRecords([]))
    fetchEffortSummary(queryParams).then(setEffort)
  }, [queryParams])

  const stats = useMemo(() => aggregateDeveloperHistory(allRecords), [allRecords])

  return (
    <div className="space-y-6">
      <WorkHistoryFilters
        filters={filterState}
        onChange={setFilterState}
        filterOptions={filters}
        showProjectFilter
        showDeveloperFilter={false}
        resultCount={data.length}
        totalCount={total}
        loading={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total hours" value={`${stats.totalEffort.toFixed(1)}h`} />
        <StatCard label="Completed" value={stats.tasksCompleted} />
        <StatCard label="In progress" value={stats.activeTasks.length} />
        <StatCard
          label="Blockers"
          value={stats.blockers.length}
          className={stats.blockers.length > 0 ? 'border-amber-200/60' : undefined}
        />
      </div>

      <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/50 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Planned effort</p>
          <p className="mt-1 text-xl font-semibold">{effort.expectedEffort.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Actual effort</p>
          <p className="mt-1 text-xl font-semibold">{effort.actualEffort.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Difference</p>
          <p
            className={`mt-1 text-xl font-semibold ${
              effort.difference > 0
                ? 'text-amber-700'
                : effort.difference < 0
                  ? 'text-emerald-700'
                  : 'text-foreground'
            }`}
          >
            {effort.difference > 0 ? '+' : ''}
            {effort.difference.toFixed(1)}h
          </p>
        </div>
      </div>

      {stats.blockers.length > 0 && (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-foreground">Active blockers</h3>
          </div>
          <ul className="space-y-2">
            {stats.blockers.slice(0, 5).map((item) => (
              <li key={item.id} className="text-sm">
                <span className="font-medium text-foreground">{item.task}</span>
                <span className="text-muted-foreground"> · {item.project} · {item.date}</span>
                <p className="text-amber-800">{item.blocker}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="group rounded-xl border bg-card shadow-sm ring-1 ring-border/50 open:pb-0">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          Insights — by project & technologies
          <span className="ml-2 text-xs font-normal text-muted-foreground group-open:hidden">
            (expand)
          </span>
        </summary>
        <div className="grid gap-6 border-t p-4 lg:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              By project
            </h4>
            {stats.projectBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No project history yet.</p>
            ) : (
              stats.projectBreakdown.map((item) => {
                const match = allRecords.find((r) => r.projectName === item.project)
                return (
                  <div key={item.project} className="flex items-center justify-between text-sm">
                    {match ? (
                      <Link
                        href={`/work-history/projects/${match.projectId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.project}
                      </Link>
                    ) : (
                      <span className="font-medium">{item.project}</span>
                    )}
                    <span className="text-muted-foreground">
                      {item.tasks} tasks · {item.effort.toFixed(1)}h
                    </span>
                  </div>
                )
              })
            )}
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.technologies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No technologies recorded.</p>
              ) : (
                stats.technologies.map((tech) => <CategoryBadge key={tech} category={tech} />)
              )}
            </div>
          </div>
        </div>
      </details>

      <WorkHistoryTaskTable
        title="Work timeline"
        records={data}
        secondaryColumn="project"
        exportFilename="developer-work-history.pdf"
        exportTitle="Developer Work History"
        loading={loading}
        onExportAll={() =>
          fetchAllRecords<WorkHistoryRecord>('/api/work-history', queryParams)
        }
      />

      <RecordsPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  )
}
