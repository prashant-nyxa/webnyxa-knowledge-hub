'use client'

import { useMemo, useState } from 'react'
import {
  aggregateDeveloperHistory,
  filterWorkHistory,
  uniqueSorted,
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

export function DeveloperWorkHistoryView({ records }: { records: WorkHistoryRecord[] }) {
  const [filters, setFilters] = useState<WorkHistoryFilterState>(emptyWorkHistoryFilters())

  const projectOptions = useMemo(() => uniqueSorted(records.map((r) => r.projectName)), [records])
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
        { ...filters, developers: [] },
        'developer'
      ),
    [records, filters]
  )

  const stats = useMemo(() => aggregateDeveloperHistory(filtered), [filtered])

  return (
    <div className="space-y-6">
      <WorkHistoryFilters
        filters={filters}
        onChange={setFilters}
        projectOptions={projectOptions}
        developerOptions={[]}
        technologyOptions={technologyOptions}
        statusOptions={statusOptions}
        workTypeOptions={workTypeOptions}
        showProjectFilter
        showDeveloperFilter={false}
        resultCount={filtered.length}
        totalCount={records.length}
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
        <StatCard
          label="Blocked tasks"
          value={stats.blockedTasks.length}
          className="border-amber-200/60"
        />
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
                  <span className="text-muted-foreground">
                    {item.tasks} tasks · {item.effort.toFixed(1)}h
                  </span>
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

        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Type of work done</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {stats.workTypeBreakdown.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No work types recorded.</p>
            ) : (
              stats.workTypeBreakdown.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="font-medium">{item.type}</span>
                  <span className="text-muted-foreground">
                    {item.count} tasks · {item.effort.toFixed(1)}h
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {stats.blockers.length > 0 && (
        <Card className="border-amber-200/60 bg-amber-50/30 shadow-sm">
          <CardHeader className="border-b border-amber-200/40 pb-3">
            <CardTitle className="text-base">Blockers faced</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-amber-200/30 p-0">
            {stats.blockers.map((item) => (
              <div key={item.id} className="px-4 py-3 text-sm">
                <p className="font-medium">{item.task}</p>
                <p className="text-xs text-muted-foreground">
                  {item.date} · {item.project}
                </p>
                <p className="mt-1 text-amber-800">{item.blocker}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-3">
          <WorkHistoryTaskTable
            title="All work history"
            records={filtered}
            secondaryColumn="project"
            exportFilename="developer-work-history.csv"
          />
        </div>
      </div>

      {stats.activeTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Active tasks"
          records={stats.activeTasks}
          secondaryColumn="project"
          exportFilename="developer-active-tasks.csv"
        />
      )}

      {stats.completedTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Completed tasks"
          records={stats.completedTasks}
          secondaryColumn="project"
          exportFilename="developer-completed-tasks.csv"
        />
      )}

      {stats.carriedForwardTasks.length > 0 && (
        <WorkHistoryTaskTable
          title="Carried forward tasks"
          records={stats.carriedForwardTasks}
          secondaryColumn="project"
          exportFilename="developer-carried-forward.csv"
        />
      )}
    </div>
  )
}
