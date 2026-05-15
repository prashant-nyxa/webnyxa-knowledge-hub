'use client'

import { useMemo, useState } from 'react'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import { deleteSkill, updateSkill } from '@/app/skills/actions'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'

type SkillRow = {
  id: string
  name: string
  category: string
  status: string
}

const skillCategories = ['Frontend', 'Backend', 'Mobile', 'CMS', 'Cloud', 'Database', 'QA', 'Design', 'Other']

export function SkillsTable({ skills }: { skills: SkillRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filters = useMemo<FilterConfig[]>(() => [
    { key: 'category', label: 'Category', options: uniqueOptions(skills.map((skill) => skill.category)) },
    { key: 'status', label: 'Status', options: uniqueOptions(skills.map((skill) => skill.status)) },
  ], [skills])
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const filteredRows = skills.filter((skill) => {
    const haystack = `${skill.name} ${skill.category} ${skill.status}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(skill, selectedFilters)
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
        title="Skill List"
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterToggle={toggleFilter}
        onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
        onExport={() => exportCsv('skills.csv', filteredRows.map((skill) => ({
          Name: skill.name,
          Category: skill.category,
          Status: skill.status,
        })))}
        resultCount={filteredRows.length}
        totalCount={skills.length}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRows.map((skill) => (
            editingId === skill.id ? (
              <tr key={skill.id}>
                <td colSpan={4} className="px-6 py-4">
                  <form action={updateSkill} className="grid gap-3 lg:grid-cols-[1.2fr_1fr_0.8fr_auto] lg:items-end">
                    <input type="hidden" name="id" value={skill.id} />
                    <label className="text-xs font-medium text-gray-600">
                      Name
                      <input required name="name" defaultValue={skill.name} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Category
                      <select required name="category" defaultValue={skill.category} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        {skillCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Status
                      <select name="status" defaultValue={skill.status} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </label>
                    <div className="flex gap-2">
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
              <tr key={skill.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${skill.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {skill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingId(skill.id)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <form action={deleteSkill} onSubmit={(event) => !confirm('Delete this skill?') && event.preventDefault()}>
                      <input type="hidden" name="id" value={skill.id} />
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
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No skills match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
