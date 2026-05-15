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

type PlanVsActualRow = {
  id: string
  date: string
  developerName: string
  projectName: string
  taskTitle: string
  status: string
  expectedEffort: number
  actualEffort: number
  difference: number
  planType: string
}

export function PlanVsActualTable({ rows }: { rows: PlanVsActualRow[] }) {
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    { key: 'developerName', label: 'Developer', options: uniqueOptions(rows.map((row) => row.developerName)) },
    { key: 'projectName', label: 'Project', options: uniqueOptions(rows.map((row) => row.projectName)) },
    { key: 'status', label: 'Status', options: uniqueOptions(rows.map((row) => row.status)) },
    { key: 'planType', label: 'Plan Link', options: ['Planned', 'Unplanned'] },
  ], [rows])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const filteredRows = rows.filter((row) => {
    const haystack = `${row.developerName} ${row.projectName} ${row.taskTitle} ${row.status} ${row.planType}`.toLowerCase()
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
        title="Plan vs Actual"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv('plan-vs-actual.csv', filteredRows.map((row) => ({
          Date: row.date,
          Developer: row.developerName,
          Project: row.projectName,
          Task: row.taskTitle,
          Status: row.status,
          'Expected Effort': row.planType === 'Planned' ? row.expectedEffort : 'N/A',
          'Actual Effort': row.actualEffort,
          Difference: row.planType === 'Planned' ? row.difference : 'N/A',
          'Plan Link': row.planType,
        })))}
        resultCount={filteredRows.length}
        totalCount={rows.length}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dev & Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{row.developerName}</div>
                <div className="text-xs text-gray-500">{row.projectName}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="font-medium text-gray-900">{row.taskTitle}</div>
                {row.planType === 'Unplanned' && <span className="mt-1 inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Unplanned</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.planType === 'Planned' ? `${row.expectedEffort}h` : 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.actualEffort}h</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {row.planType === 'Planned' ? (
                  <span className={`font-medium ${row.difference > 0 ? 'text-red-600' : row.difference < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {row.difference > 0 ? `+${row.difference}h` : row.difference < 0 ? `${row.difference}h` : 'On track'}
                  </span>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </td>
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No report rows match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
