'use client'

import { useMemo, useState, useTransition } from 'react'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSkill } from '@/app/(protected)/skills/actions'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { DetailViewDialog } from '@/components/detail-view-dialog'
import { EmptyState } from '@/components/empty-state'
import { FormDialog } from '@/components/form-dialog'
import { SkillForm, type SkillFormData } from '@/components/forms/skill-form'
import { PageHeader } from '@/components/page-header'
import { RecordsPagination } from '@/components/records-pagination'
import {
  createInitialFilters,
  filtersToQueryParams,
  RecordsTableToolbar,
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
import { useDebounce } from '@/hooks/use-debounce'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { fetchAllRecords } from '@/lib/fetch-all-records'
import { exportPdf } from '@/lib/pdf-export'

type SkillRow = {
  id: string
  name: string
  category: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export function SkillsTable({ filters }: { filters: FilterConfig[] }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillFormData | undefined>()
  const [viewTarget, setViewTarget] = useState<SkillRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SkillRow | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      pageSize: DEFAULT_PAGE_SIZE,
      ...filtersToQueryParams(selectedFilters),
    }),
    [debouncedSearch, selectedFilters]
  )

  const { data, total, page, totalPages, loading, setPage, refetch } =
    usePaginatedQuery<SkillRow>('/api/skills', queryParams)

  async function handleExport() {
    const rows = await fetchAllRecords<SkillRow>('/api/skills', queryParams)
    exportPdf(
      'skills.pdf',
      'Skills',
      rows.map((s) => ({
        Name: s.name,
        Category: s.category,
        Status: s.status,
        Created: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
        Updated: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '',
      }))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Organize the skill catalog by category for team profiling."
        action={
          <Button onClick={() => { setEditingSkill(undefined); setSheetOpen(true) }}>
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
          onFilterSelect={(key, value) =>
            setSelectedFilters((current) => ({
              ...current,
              [key]: value ? [value] : [],
            }))
          }
          onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
          onExport={handleExport}
          resultCount={data.length}
          totalCount={total}
          searchPlaceholder="Search skills..."
          loading={loading}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skill</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((skill) => (
                <tr key={skill.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5 font-medium text-foreground">{skill.name}</td>
                  <td className="px-5 py-3.5"><CategoryBadge category={skill.category} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={skill.status} /></td>
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
                        <DropdownMenuItem onClick={() => setViewTarget(skill)}>
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingSkill({ ...skill }); setSheetOpen(true) }}>
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
          {!loading && data.length === 0 && (
            <EmptyState title="No skills found" description="Adjust filters or add a new skill." />
          )}
        </div>

        <RecordsPagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} loading={loading} />
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
          onSuccess={() => { setSheetOpen(false); refetch() }}
          onCancel={() => setSheetOpen(false)}
        />
      </FormDialog>

      <DetailViewDialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.name ?? 'Skill Details'}
        fields={
          viewTarget
            ? [
                { label: 'Category', value: viewTarget.category },
                { label: 'Status', value: viewTarget.status },
                { label: 'Created', value: viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleString() : null },
                { label: 'Updated', value: viewTarget.updatedAt ? new Date(viewTarget.updatedAt).toLocaleString() : null },
              ]
            : []
        }
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete skill?"
        description={`This will permanently remove ${deleteTarget?.name ?? 'this skill'}.`}
        onConfirm={() => {
          if (!deleteTarget) return
          startDeleteTransition(async () => {
            const result = await deleteSkill(deleteTarget.id)
            if (!result.success) { toast.error(result.error ?? 'Delete failed'); return }
            toast.success(result.message)
            setDeleteTarget(null)
            refetch()
          })
        }}
        loading={deletePending}
      />
    </div>
  )
}
