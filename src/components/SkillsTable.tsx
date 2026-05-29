'use client'

import { useMemo, useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSkill } from '@/app/(protected)/skills/actions'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { FormDialog } from '@/components/form-dialog'
import { SkillForm, type SkillFormData } from '@/components/forms/skill-form'
import { PageHeader } from '@/components/page-header'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
  type FilterConfig,
} from '@/components/records-table-tools'
import { CategoryBadge, StatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type SkillRow = {
  id: string
  name: string
  category: string
  status: string
}

export function SkillsTable({ skills }: { skills: SkillRow[] }) {
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillFormData | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<SkillRow | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()

  const filters = useMemo<FilterConfig[]>(
    () => [
      { key: 'category', label: 'Category', options: uniqueOptions(skills.map((s) => s.category)) },
      { key: 'status', label: 'Status', options: uniqueOptions(skills.map((s) => s.status)) },
    ],
    [skills]
  )
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))

  const filteredRows = skills.filter((skill) => {
    const haystack = `${skill.name} ${skill.category} ${skill.status}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(skill, selectedFilters)
  })

  function toggleFilter(key: string, value: string) {
    setSelectedFilters((current) => {
      const values = current[key] ?? []
      return {
        ...current,
        [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
      }
    })
  }

  function openAdd() {
    setEditingSkill(undefined)
    setSheetOpen(true)
  }

  function openEdit(skill: SkillRow) {
    setEditingSkill({ ...skill })
    setSheetOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      const result = await deleteSkill(deleteTarget.id)
      if (!result.success) {
        toast.error(result.error ?? 'Delete failed')
        return
      }
      toast.success(result.message)
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Organize the skill catalog by category for team profiling."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add Skill
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <RecordsTableToolbar
          title="All skills"
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterToggle={toggleFilter}
          onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
          onExport={() =>
            exportCsv(
              'skills.csv',
              filteredRows.map((s) => ({
                Name: s.name,
                Category: s.category,
                Status: s.status,
              }))
            )
          }
          resultCount={filteredRows.length}
          totalCount={skills.length}
          searchPlaceholder="Search skills..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skill
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((skill) => (
                <tr key={skill.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5 font-medium text-foreground">{skill.name}</td>
                  <td className="px-5 py-3.5">
                    <CategoryBadge category={skill.category} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={skill.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(skill)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(skill)}>
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRows.length === 0 && (
            <EmptyState title="No skills found" description="Adjust filters or add a new skill." />
          )}
        </div>
      </div>

      <FormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingSkill ? 'Edit Skill' : 'Add Skill'}
        description={editingSkill ? 'Update skill name and category.' : 'Add a skill to the catalog.'}
        size="lg"
      >
        <SkillForm
          key={editingSkill?.id ?? 'new'}
          skill={editingSkill}
          onSuccess={() => setSheetOpen(false)}
          onCancel={() => setSheetOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete skill?"
        description={`This will permanently remove ${deleteTarget?.name ?? 'this skill'}.`}
        onConfirm={handleDelete}
        loading={deletePending}
      />
    </div>
  )
}
