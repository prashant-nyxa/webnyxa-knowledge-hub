'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { StatusBadge } from '@/components/status-badges'
import { EmptyState } from '@/components/empty-state'
import { DetailViewDialog } from '@/components/detail-view-dialog'
import { Button } from '@/components/ui/button'
import { exportPdf } from '@/lib/pdf-export'
import type { WorkHistoryRecord } from '@/lib/work-history'

function toPdfRows(records: WorkHistoryRecord[]) {
  return records.map((r) => ({
    Date: r.dateLabel,
    Developer: r.developerName,
    Project: r.projectName,
    Task: r.taskTitle,
    'Work Type': r.workType,
    Technologies: r.technologies,
    Status: r.status,
    Effort: r.actualEffort,
    'Work Completed': r.workCompleted,
    'Work Pending': r.workPending,
    Blocker: r.blocker,
    Summary: r.summary,
  }))
}

export function WorkHistoryTaskTable({
  title,
  records,
  secondaryColumn,
  exportFilename,
  exportTitle,
  loading,
  onExportAll,
}: {
  title: string
  records: WorkHistoryRecord[]
  secondaryColumn: 'project' | 'developer'
  exportFilename: string
  exportTitle?: string
  loading?: boolean
  onExportAll?: () => Promise<WorkHistoryRecord[]>
}) {
  const [viewTarget, setViewTarget] = useState<WorkHistoryRecord | null>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const rows = onExportAll ? await onExportAll() : records
      exportPdf(exportFilename, exportTitle ?? title, toPdfRows(rows))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || exporting}
            onClick={handleExport}
          >
            <Download className="size-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
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
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                    {record.dateLabel}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium">
                    {secondaryColumn === 'project' ? (
                      <Link
                        href={`/work-history/projects/${record.projectId}`}
                        className="text-primary hover:underline"
                      >
                        {record.projectName}
                      </Link>
                    ) : (
                      <Link
                        href={`/work-history/developers/${record.developerId}`}
                        className="text-primary hover:underline"
                      >
                        {record.developerName}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setViewTarget(record)}
                      className="text-left hover:underline"
                    >
                      <div className="font-medium text-primary">{record.taskTitle}</div>
                    </button>
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
          {!loading && records.length === 0 && (
            <EmptyState title="No tasks" description="No records match the current filters." />
          )}
        </div>
      </div>

      <DetailViewDialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.taskTitle ?? 'Task Details'}
        fields={
          viewTarget
            ? [
                { label: 'Date', value: viewTarget.dateLabel },
                { label: 'Developer', value: viewTarget.developerName },
                { label: 'Project', value: viewTarget.projectName },
                { label: 'Type of Work', value: viewTarget.workType },
                { label: 'Technologies', value: viewTarget.technologies },
                { label: 'Status', value: viewTarget.status },
                { label: 'Actual Effort', value: `${viewTarget.actualEffort}h` },
                { label: 'Work Completed', value: viewTarget.workCompleted },
                { label: 'Work Pending', value: viewTarget.workPending },
                { label: 'Blocker', value: viewTarget.blocker },
                { label: 'Summary', value: viewTarget.summary },
              ]
            : []
        }
      />
    </>
  )
}
