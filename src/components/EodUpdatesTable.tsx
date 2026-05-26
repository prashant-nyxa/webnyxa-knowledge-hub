'use client'

import { useMemo, useState } from 'react'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import { deleteEodUpdate, updateEodUpdate } from '@/app/eod-updates/actions'
import { PendingSubmitButton } from '@/components/PendingSubmitButton'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'

type Option = { id: string; name: string }
type PlanOption = { id: string; label: string }
type EodUpdateRow = {
  id: string
  date: string
  dateValue: string
  developerId: string
  developerName: string
  projectId: string
  projectName: string
  dailyPlanId: string | null
  taskTitle: string
  workType: string
  technologies: string
  status: string
  actualEffort: number
  workCompleted: string | null
  workPending: string | null
  blocker: string | null
  summary: string | null
  planType: string
}

const workTypes = ['Development', 'Bug Fix', 'QA', 'Deployment', 'Research', 'Documentation', 'Client Support', 'Code Review', 'Planning']
const statuses = ['Done', 'In Progress', 'Blocked', 'Carried Forward', 'Cancelled']

export function EodUpdatesTable({
  updates,
  developers,
  projects,
  plans,
}: {
  updates: EodUpdateRow[]
  developers: Option[]
  projects: Option[]
  plans: PlanOption[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    { key: 'developerName', label: 'Developer', options: uniqueOptions(updates.map((update) => update.developerName)) },
    { key: 'projectName', label: 'Project', options: uniqueOptions(updates.map((update) => update.projectName)) },
    { key: 'workType', label: 'Type of Work', options: uniqueOptions(updates.map((update) => update.workType)) },
    { key: 'status', label: 'Status', options: uniqueOptions(updates.map((update) => update.status)) },
    { key: 'planType', label: 'Plan Link', options: ['Planned', 'Unplanned'] },
  ], [updates])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const filteredRows = updates.filter((update) => {
    const haystack = `${update.developerName} ${update.projectName} ${update.taskTitle} ${update.workType} ${update.technologies} ${update.status}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(update, selectedFilters)
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
        title="End-of-Day Updates"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv('eod-updates.csv', filteredRows.map((update) => ({
          Date: update.date,
          Developer: update.developerName,
          Project: update.projectName,
          Task: update.taskTitle,
          'Type of Work': update.workType,
          Technologies: update.technologies,
          Status: update.status,
          'Actual Effort': update.actualEffort,
          'Plan Link': update.planType,
          Completed: update.workCompleted,
          Pending: update.workPending,
          Blocker: update.blocker,
          Summary: update.summary,
        })))}
        resultCount={filteredRows.length}
        totalCount={updates.length}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effort</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((update) => (
            editingId === update.id ? (
              <tr key={update.id}>
                <td colSpan={5} className="px-6 py-4">
                  <form action={updateEodUpdate} className="grid gap-3 lg:grid-cols-2">
                    <input type="hidden" name="id" value={update.id} />
                    <label className="text-xs font-medium text-gray-600">
                      Date
                      <input required type="date" name="date" defaultValue={update.dateValue} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                      Daily Plan
                      <select name="dailyPlanId" defaultValue={update.dailyPlanId ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        <option value="">No Plan (Unplanned Task)</option>
                        {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Developer
                      <select required name="developerId" defaultValue={update.developerId} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {developers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Project
                      <select required name="projectId" defaultValue={update.projectId} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                      Task
                      <input required name="taskTitle" defaultValue={update.taskTitle} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Type
                      <select required name="workType" defaultValue={update.workType} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {workTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Status
                      <select required name="status" defaultValue={update.status} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Technologies
                      <input required name="technologies" defaultValue={update.technologies} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Actual Effort
                      <input required type="number" step="0.5" name="actualEffort" defaultValue={update.actualEffort} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Work Completed
                      <textarea name="workCompleted" defaultValue={update.workCompleted ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Work Pending
                      <textarea name="workPending" defaultValue={update.workPending ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Blocker
                      <input name="blocker" defaultValue={update.blocker ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Summary
                      <input name="summary" defaultValue={update.summary ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <div className="flex gap-2 lg:col-span-2">
                      <PendingSubmitButton label="Update" pendingLabel="Updating..." icon={Save} className="inline-flex h-10 items-center gap-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70" />
                      <button type="button" onClick={() => setEditingId(null)} className="inline-flex h-10 items-center rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={update.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{update.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{update.taskTitle}</div>
                  <div className="text-xs text-gray-500">{update.developerName} - {update.projectName}</div>
                  <span className={`mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    update.dailyPlanId ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                  }`}>
                    {update.planType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    update.status === 'Done' ? 'bg-green-100 text-green-800' :
                    update.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    update.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {update.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{update.actualEffort}h</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingId(update.id)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <form action={deleteEodUpdate} onSubmit={(event) => !confirm('Delete this EOD update?') && event.preventDefault()}>
                      <input type="hidden" name="id" value={update.id} />
                      <PendingSubmitButton label="Delete" pendingLabel="Deleting..." icon={Trash2} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70" />
                    </form>
                  </div>
                </td>
              </tr>
            )
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No EOD updates match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
