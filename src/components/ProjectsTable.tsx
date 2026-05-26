'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import { deleteProject, updateProject } from '@/app/projects/actions'
import { PendingSubmitButton } from '@/components/PendingSubmitButton'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'

type ProjectRow = {
  id: string
  name: string
  client: string | null
  type: string
  status: string
  techStack: string | null
  developersInvolved: string | null
  developerRoles: string | null
  mainFeatures: string | null
  challenges: string | null
  startDate: string | null
  endDate: string | null
  summary: string | null
  notes: string | null
}

const projectTypes = ['Website', 'Mobile App', 'Admin Panel', 'Backend', 'Shopify', 'WordPress', 'CMS', 'Maintenance', 'Other']

function splitList(value: string | null) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

function formatDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

function dateInputValue(value: string | null) {
  if (!value) return ''
  return value
}

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    { key: 'type', label: 'Project Type', options: uniqueOptions(projects.map((project) => project.type)) },
    { key: 'status', label: 'Status', options: uniqueOptions(projects.map((project) => project.status)) },
    { key: 'client', label: 'Client', options: uniqueOptions(projects.map((project) => project.client)) },
    { key: 'techList', label: 'Technology', options: uniqueOptions(projects.flatMap((project) => splitList(project.techStack))) },
  ], [projects])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const rows = projects.map((project) => ({ ...project, techList: splitList(project.techStack) }))
  const filteredRows = rows.filter((project) => {
    const haystack = `${project.name} ${project.client ?? ''} ${project.type} ${project.status} ${project.techStack ?? ''} ${project.developersInvolved ?? ''} ${project.developerRoles ?? ''} ${project.mainFeatures ?? ''} ${project.challenges ?? ''} ${project.summary ?? ''} ${project.notes ?? ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(project, selectedFilters)
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
        title="Project List"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv('projects.csv', filteredRows.map((project) => ({
          Name: project.name,
          Client: project.client,
          Type: project.type,
          Status: project.status,
          'Tech Stack': project.techStack,
          'Developers Involved': project.developersInvolved,
          'Developer Roles': project.developerRoles,
          'Main Features': project.mainFeatures,
          Challenges: project.challenges,
          'Start Date': formatDate(project.startDate),
          'End Date': formatDate(project.endDate),
          Summary: project.summary,
          Notes: project.notes,
        })))}
        resultCount={filteredRows.length}
        totalCount={projects.length}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tech / Team</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((project) => (
            editingId === project.id ? (
              <tr key={project.id}>
                <td colSpan={6} className="px-6 py-4">
                  <form action={updateProject} className="grid gap-3 lg:grid-cols-2">
                    <input type="hidden" name="id" value={project.id} />
                    <label className="text-xs font-medium text-gray-600">
                      Name
                      <input required name="name" defaultValue={project.name} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Client
                      <input name="client" defaultValue={project.client ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Type
                      <select required name="type" defaultValue={project.type} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Status
                      <select name="status" defaultValue={project.status} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                      Tech Stack
                      <textarea name="techStack" defaultValue={project.techStack ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Developers Involved
                      <textarea name="developersInvolved" defaultValue={project.developersInvolved ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Developer Roles
                      <textarea name="developerRoles" defaultValue={project.developerRoles ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Main Features
                      <textarea name="mainFeatures" defaultValue={project.mainFeatures ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Challenges
                      <textarea name="challenges" defaultValue={project.challenges ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Start Date
                      <input type="date" name="startDate" defaultValue={dateInputValue(project.startDate)} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      End Date
                      <input type="date" name="endDate" defaultValue={dateInputValue(project.endDate)} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                      Summary
                      <textarea name="summary" defaultValue={project.summary ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                      Notes
                      <textarea name="notes" defaultValue={project.notes ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
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
              <tr key={project.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/projects/${project.id}`} className="hover:underline text-blue-600">{project.name}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="font-medium text-gray-900">{project.techStack || '-'}</div>
                  {project.developersInvolved && <div className="text-xs">Team: {project.developersInvolved}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    project.status === 'Active' ? 'bg-green-100 text-green-800' :
                    project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingId(project.id)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <form action={deleteProject} onSubmit={(event) => !confirm('Delete this project?') && event.preventDefault()}>
                      <input type="hidden" name="id" value={project.id} />
                      <PendingSubmitButton label="Delete" pendingLabel="Deleting..." icon={Trash2} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70" />
                    </form>
                  </div>
                </td>
              </tr>
            )
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No projects match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
