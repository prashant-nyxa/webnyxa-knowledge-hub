'use client'

import { useMemo, useState } from 'react'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import { deleteDailyPlan, updateDailyPlan } from '@/app/daily-plans/actions'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'

type Option = { id: string; name: string }
type DailyPlanRow = {
  id: string
  date: string
  dateValue: string
  developerId: string
  developerName: string
  projectId: string
  projectName: string
  taskTitle: string
  workType: string
  technologies: string
  expectedEffort: number
  priority: string
  dependency: string | null
  notes: string | null
}

const workTypes = ['Development', 'Bug Fix', 'QA', 'Deployment', 'Research', 'Documentation', 'Client Support', 'Code Review', 'Planning']

export function DailyPlansTable({
  plans,
  developers,
  projects,
}: {
  plans: DailyPlanRow[]
  developers: Option[]
  projects: Option[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    { key: 'developerName', label: 'Developer', options: uniqueOptions(plans.map((plan) => plan.developerName)) },
    { key: 'projectName', label: 'Project', options: uniqueOptions(plans.map((plan) => plan.projectName)) },
    { key: 'workType', label: 'Type of Work', options: uniqueOptions(plans.map((plan) => plan.workType)) },
    { key: 'priority', label: 'Priority', options: uniqueOptions(plans.map((plan) => plan.priority)) },
  ], [plans])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const filteredRows = plans.filter((plan) => {
    const haystack = `${plan.developerName} ${plan.projectName} ${plan.taskTitle} ${plan.workType} ${plan.technologies} ${plan.priority}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(plan, selectedFilters)
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
        title="Daily Plans"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv('daily-plans.csv', filteredRows.map((plan) => ({
          Date: plan.date,
          Developer: plan.developerName,
          Project: plan.projectName,
          Task: plan.taskTitle,
          'Type of Work': plan.workType,
          Technologies: plan.technologies,
          'Expected Effort': plan.expectedEffort,
          Priority: plan.priority,
          Dependency: plan.dependency,
          Notes: plan.notes,
        })))}
        resultCount={filteredRows.length}
        totalCount={plans.length}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dev & Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effort</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((plan) => (
            editingId === plan.id ? (
              <tr key={plan.id}>
                <td colSpan={5} className="px-6 py-4">
                  <form action={updateDailyPlan} className="grid gap-3 lg:grid-cols-2">
                    <input type="hidden" name="id" value={plan.id} />
                    <label className="text-xs font-medium text-gray-600">
                      Date
                      <input required type="date" name="date" defaultValue={plan.dateValue} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Developer
                      <select required name="developerId" defaultValue={plan.developerId} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {developers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Project
                      <select required name="projectId" defaultValue={plan.projectId} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                      Task
                      <input required name="taskTitle" defaultValue={plan.taskTitle} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Type
                      <select required name="workType" defaultValue={plan.workType} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {workTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Technologies
                      <input required name="technologies" defaultValue={plan.technologies} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Expected Effort
                      <input required type="number" step="0.5" name="expectedEffort" defaultValue={plan.expectedEffort} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Priority
                      <select required name="priority" defaultValue={plan.priority} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Dependency
                      <input name="dependency" defaultValue={plan.dependency ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Notes
                      <input name="notes" defaultValue={plan.notes ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <div className="flex gap-2 lg:col-span-2">
                      <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white">
                        <Save className="h-4 w-4" />
                        Update
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="inline-flex h-10 items-center rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={plan.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{plan.developerName}</div>
                  <div className="text-xs text-gray-500">{plan.projectName}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="font-medium text-gray-900">{plan.taskTitle}</div>
                  <div className="text-xs">{plan.workType} · {plan.technologies}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.expectedEffort}h</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingId(plan.id)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <form action={deleteDailyPlan} onSubmit={(event) => !confirm('Delete this daily plan?') && event.preventDefault()}>
                      <input type="hidden" name="id" value={plan.id} />
                      <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No daily plans match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
