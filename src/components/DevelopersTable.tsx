'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import { deleteDeveloper, updateDeveloper } from '@/app/developers/actions'
import { PendingSubmitButton } from '@/components/PendingSubmitButton'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'

type DeveloperRow = {
  id: string
  name: string
  role: string
  weeklyHours: number
  status: string
  primarySkills: string | null
  secondarySkills: string | null
  weakAreas: string | null
  preferredWork: string | null
  currentProjects: string | null
  pastProjects: string | null
  notes: string | null
}

function splitList(value: string | null) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

export function DevelopersTable({ developers }: { developers: DeveloperRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    { key: 'role', label: 'Role', options: uniqueOptions(developers.map((developer) => developer.role)) },
    { key: 'status', label: 'Status', options: uniqueOptions(developers.map((developer) => developer.status)) },
    { key: 'availability', label: 'Availability', options: ['Available', 'Busy'] },
    { key: 'primarySkillList', label: 'Primary Skill', options: uniqueOptions(developers.flatMap((developer) => splitList(developer.primarySkills))) },
  ], [developers])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))

  const rows = useMemo(() => developers.map((developer) => ({
    ...developer,
    availability: developer.status === 'Active' && developer.weeklyHours >= 40 ? 'Available' : 'Busy',
    primarySkillList: splitList(developer.primarySkills),
  })), [developers])
  const filteredRows = rows.filter((developer) => {
    const haystack = `${developer.name} ${developer.role} ${developer.status} ${developer.primarySkills ?? ''} ${developer.secondarySkills ?? ''} ${developer.weakAreas ?? ''} ${developer.preferredWork ?? ''} ${developer.currentProjects ?? ''} ${developer.pastProjects ?? ''} ${developer.notes ?? ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(developer, selectedFilters)
  })

  function toggleFilter(key: string, value: string) {
    setSelectedFilters((current) => ({
      ...current,
      [key]: current[key]?.includes(value)
        ? current[key].filter((item) => item !== value)
        : [...(current[key] ?? []), value],
    }))
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <RecordsTableToolbar
        title="Developer List"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv('developers.csv', filteredRows.map((developer) => ({
          Name: developer.name,
          Role: developer.role,
          'Hours/Week': developer.weeklyHours,
          Status: developer.status,
          Availability: developer.availability,
          'Primary Skills': developer.primarySkills,
          'Secondary Skills': developer.secondarySkills,
          'Weak / Learning Areas': developer.weakAreas,
          'Preferred Work': developer.preferredWork,
          'Current Projects': developer.currentProjects,
          'Past Projects': developer.pastProjects,
          Notes: developer.notes,
        })))}
        resultCount={filteredRows.length}
        totalCount={developers.length}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((developer) => (
            editingId === developer.id ? (
              <tr key={developer.id}>
                <td colSpan={6} className="px-6 py-4">
                  <form action={updateDeveloper} className="grid gap-3 lg:grid-cols-2">
                    <input type="hidden" name="id" value={developer.id} />
                    <label className="text-xs font-medium text-gray-600">
                      Name
                      <input required name="name" defaultValue={developer.name} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Role
                      <input required name="role" defaultValue={developer.role} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Hours
                      <input required type="number" name="weeklyHours" defaultValue={developer.weeklyHours} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Preferred Work
                      <input name="preferredWork" defaultValue={developer.preferredWork ?? ''} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Status
                      <select name="status" defaultValue={developer.status} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Primary Skills
                      <textarea name="primarySkills" defaultValue={developer.primarySkills ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Secondary Skills
                      <textarea name="secondarySkills" defaultValue={developer.secondarySkills ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Weak / Learning Areas
                      <textarea name="weakAreas" defaultValue={developer.weakAreas ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Current Active Projects
                      <textarea name="currentProjects" defaultValue={developer.currentProjects ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Past Projects
                      <textarea name="pastProjects" defaultValue={developer.pastProjects ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Notes
                      <textarea name="notes" defaultValue={developer.notes ?? ''} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
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
              <tr key={developer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/developers/${developer.id}`} className="hover:underline text-blue-600">{developer.name}</Link>
                  {developer.preferredWork && <div className="text-xs font-normal text-gray-500">{developer.preferredWork}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{developer.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="font-medium text-gray-900">{developer.primarySkills || '-'}</div>
                  {developer.secondarySkills && <div className="text-xs">Secondary: {developer.secondarySkills}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{developer.weeklyHours}h/week</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${developer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {developer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingId(developer.id)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <form action={deleteDeveloper} onSubmit={(event) => !confirm('Delete this developer?') && event.preventDefault()}>
                      <input type="hidden" name="id" value={developer.id} />
                      <PendingSubmitButton label="Delete" pendingLabel="Deleting..." icon={Trash2} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70" />
                    </form>
                  </div>
                </td>
              </tr>
            )
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No developers match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
