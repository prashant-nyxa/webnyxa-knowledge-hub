'use client'

import { useMemo, useState } from 'react'
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

  function toggleFilter(key: string, value: string) {
    setSelectedFilters((current) => {
      const values = current[key] ?? []
      return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] }
    })
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <RecordsTableToolbar
        title="Work History"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{mode === 'developer' ? 'Project' : 'Developer'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effort</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mode === 'developer' ? row.projectName : row.developerName}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{row.taskTitle}</div>
                <div className="text-xs text-gray-500">{row.workType} · {row.technologies.join(', ')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.actualEffort}h</td>
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No work history matches the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
