'use client'

import { useMemo, useState } from 'react'
import {
  aggregateProjectHistory,
  filterWorkHistory,
  uniqueSorted,
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

export function ProjectWorkHistoryView({
  records,
  projectSummary,
  projectNotes,
}: {
  records: WorkHistoryRecord[]
  projectSummary: string | null
  projectNotes: string | null
}) {
  const [filters, setFilters] = useState<WorkHistoryFilterState>(emptyWorkHistoryFilters())

  const developerOptions = useMemo(
    () => uniqueSorted(records.map((r) => r.developerName)),
    [records]
  )
  const technologyOptions = useMemo(
    () => uniqueSorted(records.flatMap((r) => r.technologyList)),
    [records]
  )
  const statusOptions = useMemo(() => uniqueSorted(records.map((r) => r.status)), [records])
  const workTypeOptions = useMemo(() => uniqueSorted(records.map((r) => r.workType)), [records])

  const filtered = useMemo(
    () =>
      filterWorkHistory(
        records,
        { ...filters, projects: [] },
        'project'
      ),
    [records, filters]
  )

  const stats = useMemo(
    () => aggregateProjectHistory(filtered, projectSummary),
    [filtered, projectSummary]
  )

  const summaryText =
    projectSummary?.trim() ||
    (stats.totalEffort > 0
      ? `Team has logged ${stats.totalEffort.toFixed(1)} hours across ${stats.tasksCompleted} completed tasks with ${stats.developers.length} developer(s) involved.`
      : 'No EOD updates recorded for this project yet.')

  return (
    <div className="space-y-6">
      <WorkHistoryFilters
        filters={filters}
        onChange={setFilters}
        projectOptions={[]}
        developerOptions={developerOptions}
        technologyOptions={technologyOptions}
        statusOptions={statusOptions}
        workTypeOptions={workTypeOptions}
        showProjectFilter={false}
        showDeveloperFilter
        resultCount={filtered.length}
        totalCount={records.length}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Project summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 text-sm text-muted-foreground">
          <p className="text-foreground">{summaryText}</p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Pending tasks" value={stats.pendingTasks.length} hint="In progress" />
        <StatCard
          label="Technologies used"
          value={stats.technologies.length}
          hint={stats.technologies.slice(0, 3).join(', ') || '—'}
        />
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

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Technologies used on project</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-4">
          {stats.technologies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No technologies recorded.</p>
          ) : (
            stats.technologies.map((tech) => <CategoryBadge key={tech} category={tech} />)
          )}
        </CardContent>
      </Card>

      <WorkHistoryTaskTable
        title="All work history"
        records={filtered}
        secondaryColumn="developer"
        exportFilename="project-work-history.csv"
      />

      {stats.pendingTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Pending tasks"
          records={stats.pendingTasks}
          secondaryColumn="developer"
          exportFilename="project-pending-tasks.csv"
        />
      )}

      {stats.blockedTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Blocked tasks"
          records={stats.blockedTasks}
          secondaryColumn="developer"
          exportFilename="project-blocked-tasks.csv"
        />
      )}

      {stats.completedTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Completed tasks"
          records={stats.completedTasks}
          secondaryColumn="developer"
          exportFilename="project-completed-tasks.csv"
        />
      )}
    </div>
  )
}
