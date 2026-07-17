'use client'

import { useEffect, useMemo, useState } from 'react'
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

  const pendingAndBlocked = [...stats.pendingTasks, ...stats.blockedTasks]

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

      <Card className="border-border/60 shadow-sm">
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
                  <span key={name} className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-foreground">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Developers involved" value={stats.developers.length} />
        <StatCard label="Tasks completed" value={stats.tasksCompleted} />
        <StatCard label="Total effort" value={`${stats.totalEffort.toFixed(1)}h`} />
        <StatCard label="Blocked tasks" value={stats.blockedTasks.length} />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Work done by each developer</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {stats.workByDeveloper.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No developer activity yet.</p>
          ) : (
            stats.workByDeveloper.map((item) => (
              <div key={item.developer} className="flex items-start gap-4 px-4 py-4">
                <AvatarInitials name={item.developer} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.developer}</p>
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
            ))
          )}
        </CardContent>
      </Card>

      <WorkHistoryTaskTable
        title="All work history"
        records={data}
        secondaryColumn="developer"
        exportFilename="project-work-history.pdf"
        exportTitle="Project Work History"
        loading={loading}
      />

      <RecordsPagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} loading={loading} />

      {pendingAndBlocked.length > 0 && (
        <WorkHistoryTaskTable
          title="Current / pending / blocked tasks"
          records={pendingAndBlocked}
          secondaryColumn="developer"
          exportFilename="project-pending-blocked-tasks.pdf"
          exportTitle="Pending and Blocked Tasks"
        />
      )}

      {stats.completedTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Completed tasks"
          records={stats.completedTasks}
          secondaryColumn="developer"
          exportFilename="project-completed-tasks.pdf"
          exportTitle="Completed Tasks"
        />
      )}

      {stats.blockedTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Blocked / carried forward tasks"
          records={stats.blockedTasks}
          secondaryColumn="developer"
          exportFilename="project-blocked-tasks.pdf"
          exportTitle="Blocked Tasks"
        />
      )}
    </div>
  )
}
