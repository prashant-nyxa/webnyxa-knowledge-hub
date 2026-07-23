'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import {
  aggregateProjectHistory,
  type WorkHistoryRecord,
} from '@/lib/work-history'
import { AvatarInitials } from '@/components/avatar-initials'
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

export function ProjectWorkHistoryView({
  projectId,
  filters,
  projectSummary,
  projectNotes,
  developersInvolved,
}: {
  projectId: string
  filters: FilterConfig[]
  projectSummary: string | null
  projectNotes: string | null
  developersInvolved: string | null
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
    () => ({
      projectId,
      search: debouncedSearch,
      pageSize: DEFAULT_PAGE_SIZE,
      dateFrom: filterState.dateFrom,
      dateTo: filterState.dateTo,
      developer: filterState.developers.join(','),
      technology: filterState.technologies.join(','),
      status: filterState.statuses.join(','),
      workType: filterState.workTypes.join(','),
    }),
    [projectId, filterState, debouncedSearch]
  )

  const { data, total, page, totalPages, loading, setPage } =
    usePaginatedQuery<WorkHistoryRecord>('/api/work-history', queryParams)

  useEffect(() => {
    fetchAllRecords<WorkHistoryRecord>('/api/work-history', queryParams)
      .then(setAllRecords)
      .catch(() => setAllRecords([]))
    fetchEffortSummary(queryParams).then(setEffort)
  }, [queryParams])

  const stats = useMemo(
    () => aggregateProjectHistory(allRecords, projectSummary),
    [allRecords, projectSummary]
  )

  const involvedDevelopers = (developersInvolved ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  const summaryText =
    projectSummary?.trim() ||
    (stats.totalEffort > 0
      ? `Team has logged ${stats.totalEffort.toFixed(1)} hours across ${stats.tasksCompleted} completed tasks with ${stats.developers.length} developer(s) involved.`
      : 'No EOD updates recorded for this project yet.')

  const blockers = allRecords.filter((r) => r.status === 'Blocked' || Boolean(r.blocker?.trim()))

  return (
    <div className="space-y-6">
      <WorkHistoryFilters
        filters={filterState}
        onChange={setFilterState}
        filterOptions={filters}
        showProjectFilter={false}
        showDeveloperFilter
        resultCount={data.length}
        totalCount={total}
        loading={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total hours" value={`${stats.totalEffort.toFixed(1)}h`} />
        <StatCard label="Completed" value={stats.tasksCompleted} />
        <StatCard label="In progress" value={stats.pendingTasks.filter((t) => t.status === 'In Progress').length} />
        <StatCard
          label="Blockers"
          value={stats.blockedTasks.length}
          className={stats.blockedTasks.length > 0 ? 'border-amber-200/60' : undefined}
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

      {blockers.length > 0 && (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-foreground">Active blockers</h3>
          </div>
          <ul className="space-y-2">
            {blockers.slice(0, 5).map((item) => (
              <li key={item.id} className="text-sm">
                <span className="font-medium text-foreground">{item.taskTitle}</span>
                <span className="text-muted-foreground">
                  {' '}
                  · {item.developerName} · {item.dateLabel}
                </span>
                {item.blocker && <p className="text-amber-800">{item.blocker}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="group rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          Insights — summary & work by developer
          <span className="ml-2 text-xs font-normal text-muted-foreground group-open:hidden">
            (expand)
          </span>
        </summary>
        <div className="space-y-6 border-t p-4">
          <Card className="border-border/60 shadow-none">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">Project summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p className="text-foreground">{summaryText}</p>
              {involvedDevelopers.length > 0 && (
                <div>
                  <p className="font-medium text-foreground">Developers involved</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {involvedDevelopers.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                      >
                        <AvatarInitials name={name} size="sm" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {projectNotes?.trim() && (
                <p>
                  <span className="font-medium text-foreground">Notes: </span>
                  {projectNotes}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="divide-y divide-border rounded-lg border">
            {stats.workByDeveloper.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No developer activity yet.</p>
            ) : (
              stats.workByDeveloper.map((item) => {
                const match = allRecords.find((r) => r.developerName === item.developer)
                return (
                  <div key={item.developer} className="flex items-start gap-4 px-4 py-4">
                    <AvatarInitials name={item.developer} size="sm" />
                    <div className="min-w-0 flex-1">
                      {match ? (
                        <Link
                          href={`/work-history/developers/${match.developerId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.developer}
                        </Link>
                      ) : (
                        <p className="font-medium text-foreground">{item.developer}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.tasks} tasks · {item.completed} completed · {item.effort.toFixed(1)}h
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.technologies.map((tech) => (
                          <CategoryBadge key={tech} category={tech} />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </details>

      <WorkHistoryTaskTable
        title="Work timeline"
        records={data}
        secondaryColumn="developer"
        exportFilename="project-work-history.pdf"
        exportTitle="Project Work History"
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
