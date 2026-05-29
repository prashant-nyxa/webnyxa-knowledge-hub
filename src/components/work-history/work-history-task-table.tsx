'use client'

import { StatusBadge } from '@/components/status-badges'
import { EmptyState } from '@/components/empty-state'
import { exportCsv } from '@/components/records-table-tools'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { WorkHistoryRecord } from '@/lib/work-history'

export function WorkHistoryTaskTable({
  title,
  records,
  secondaryColumn,
  exportFilename,
}: {
  title: string
  records: WorkHistoryRecord[]
  secondaryColumn: 'project' | 'developer'
  exportFilename: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={records.length === 0}
          onClick={() =>
            exportCsv(
              exportFilename,
              records.map((r) => ({
                Date: r.dateLabel,
                Developer: r.developerName,
                Project: r.projectName,
                Task: r.taskTitle,
                'Work Type': r.workType,
                Technologies: r.technologies,
                Status: r.status,
                Effort: r.actualEffort,
                Blocker: r.blocker,
              }))
            )
          }
        >
          <Download className="size-4" />
          Export
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {secondaryColumn === 'project' ? 'Project' : 'Developer'}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Task
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Effort
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.id} className="transition-colors hover:bg-muted/30">
                <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{record.dateLabel}</td>
                <td className="whitespace-nowrap px-5 py-3.5 font-medium">
                  {secondaryColumn === 'project' ? record.projectName : record.developerName}
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium">{record.taskTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {record.workType} · {record.technologyList.join(', ') || '—'}
                  </div>
                  {record.blocker && (
                    <p className="mt-1 text-xs text-amber-700">Blocker: {record.blocker}</p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={record.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                  {record.actualEffort}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <EmptyState title="No tasks" description="No records match the current filters." />
        )}
      </div>
    </div>
  )
}
