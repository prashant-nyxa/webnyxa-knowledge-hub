'use client'

import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badges'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'

export type WorkHistoryRow = {
  id: string
  date: string
  developerName: string
  projectName: string
  taskTitle: string
  workType: string
  technologies: string
  status: string
  actualEffort: number
}

export function WorkHistoryTable({
  rows,
  mode,
}: {
  rows: WorkHistoryRow[]
  mode: 'developer' | 'project'
}) {
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    mode === 'developer'
      ? { key: 'projectName', label: 'Project', options: uniqueOptions(rows.map((row) => row.projectName)) }
      : { key: 'developerName', label: 'Developer', options: uniqueOptions(rows.map((row) => row.developerName)) },
    { key: 'technologies', label: 'Technology', options: uniqueOptions(rows.flatMap((row) => row.technologies.split(',').map((item) => item.trim()).filter(Boolean))) },
    { key: 'status', label: 'Status', options: uniqueOptions(rows.map((row) => row.status)) },
    { key: 'workType', label: 'Type of Work', options: uniqueOptions(rows.map((row) => row.workType)) },
  ], [mode, rows])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const rowsForFiltering = rows.map((row) => ({
    ...row,
    technologies: row.technologies.split(',').map((item) => item.trim()).filter(Boolean),
  }))
  const filteredRows = rowsForFiltering.filter((row) => {
    const haystack = `${row.developerName} ${row.projectName} ${row.taskTitle} ${row.workType} ${row.technologies.join(' ')} ${row.status}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(row, selectedFilters)
  })

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
      <RecordsTableToolbar
        title="Work History"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterSelect={(key, value) =>
          setSelectedFilters((current) => ({ ...current, [key]: value ? [value] : [] }))
        }
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv(`${mode}-work-history.csv`, filteredRows.map((row) => ({
          Date: row.date,
          Developer: row.developerName,
          Project: row.projectName,
          Task: row.taskTitle,
          'Type of Work': row.workType,
          Technologies: row.technologies.join(', '),
          Status: row.status,
          Effort: row.actualEffort,
        })))}
        resultCount={filteredRows.length}
        totalCount={rows.length}
      />
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{mode === 'developer' ? 'Project' : 'Developer'}</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effort</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredRows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-muted/30">
              <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{row.date}</td>
              <td className="px-5 py-3.5 whitespace-nowrap font-medium">{mode === 'developer' ? row.projectName : row.developerName}</td>
              <td className="px-5 py-3.5">
                <div className="font-medium">{row.taskTitle}</div>
                <div className="text-xs text-muted-foreground">{row.workType} · {row.technologies.join(', ')}</div>
              </td>
              <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
              <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{row.actualEffort}h</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredRows.length === 0 && (
        <EmptyState title="No work history" description="No records match the current filters." />
      )}
      </div>
    </div>
  )
}
