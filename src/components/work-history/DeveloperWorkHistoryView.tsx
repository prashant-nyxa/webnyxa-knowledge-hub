'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
        <StatCard label="Projects worked on" value={stats.projects.length} />
        <StatCard label="Tasks completed" value={stats.tasksCompleted} />
        <StatCard label="Total effort" value={`${stats.totalEffort.toFixed(1)}h`} />
        <StatCard label="Blockers faced" value={stats.blockers.length} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active tasks" value={stats.activeTasks.length} hint="In progress" />
        <StatCard label="Carried forward" value={stats.carriedForwardTasks.length} />
        <StatCard label="Blocked tasks" value={stats.blockedTasks.length} className="border-amber-200/60" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Projects worked on</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {stats.projectBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No project history yet.</p>
            ) : (
              stats.projectBreakdown.map((item) => (
                <div key={item.project} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.project}</span>
                  <span className="text-muted-foreground">{item.tasks} tasks · {item.effort.toFixed(1)}h</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Technologies used</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {stats.technologies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No technologies recorded.</p>
            ) : (
              stats.technologies.map((tech) => <CategoryBadge key={tech} category={tech} />)
            )}
          </CardContent>
        </Card>
      </div>

      <WorkHistoryTaskTable
        title="All work history"
        records={data}
        secondaryColumn="project"
        exportFilename="developer-work-history.pdf"
        exportTitle="Developer Work History"
        loading={loading}
      />

      <RecordsPagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} loading={loading} />

      {stats.activeTasks.length > 0 && (
        <WorkHistoryTaskTable title="Active tasks" records={stats.activeTasks} secondaryColumn="project" exportFilename="developer-active-tasks.pdf" exportTitle="Active Tasks" />
      )}
      {stats.completedTasks.length > 0 && (
        <WorkHistoryTaskTable title="Completed tasks" records={stats.completedTasks} secondaryColumn="project" exportFilename="developer-completed-tasks.pdf" exportTitle="Completed Tasks" />
      )}
      {stats.carriedForwardTasks.length > 0 && (
        <WorkHistoryTaskTable title="Carried forward tasks" records={stats.carriedForwardTasks} secondaryColumn="project" exportFilename="developer-carried-forward.pdf" exportTitle="Carried Forward Tasks" />
      )}
    </div>
  )
}

export function DeveloperWorkHistoryList({ developers }: { developers: Array<{ id: string; name: string; role: string; status: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {developers.map((dev) => (
        <Link
          key={dev.id}
          href={`/developers/${dev.id}`}
          className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
        >
          <p className="font-medium text-primary">{dev.name}</p>
          <p className="text-xs text-muted-foreground">{dev.role} · {dev.status}</p>
        </Link>
      ))}
    </div>
  )
}
