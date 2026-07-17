'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteDeveloper } from '@/app/(protected)/developers/actions'
import { AvatarInitials } from '@/components/avatar-initials'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { DetailViewDialog } from '@/components/detail-view-dialog'
import { EmptyState } from '@/components/empty-state'
import { FormDialog } from '@/components/form-dialog'
import { DeveloperForm, type DeveloperFormData } from '@/components/forms/developer-form'
import { PageHeader } from '@/components/page-header'
import { RecordsPagination } from '@/components/records-pagination'
import {
  createInitialFilters,
  filtersToQueryParams,
  RecordsTableToolbar,
  type FilterConfig,
} from '@/components/records-table-tools'
import { RoleBadge, StatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePaginatedQuery } from '@/hooks/use-paginated-query'
import { exportPdf } from '@/lib/pdf-export'
import { fetchAllRecords } from '@/lib/fetch-all-records'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

type DeveloperRow = {
  id: string
  name: string
  role: string
  email: string
  weeklyHours: number
  status: string
  availability: string
  primarySkills: string | null
  secondarySkills: string | null
  weakAreas: string | null
  preferredWork: string | null
  currentProjects: string | null
  pastProjects: string | null
  notes: string | null
}

type Option = { id: string; name: string }

function toFormData(dev: DeveloperRow): DeveloperFormData {
  return { ...dev }
}

export function DevelopersTable({
  filters,
  skills,
  projects,
}: {
  filters: FilterConfig[]
  skills: Option[]
  projects: Option[]
}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperFormData | undefined>()
  const [viewTarget, setViewTarget] = useState<DeveloperRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeveloperRow | null>(null)
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
    usePaginatedQuery<DeveloperRow>('/api/developers', queryParams)

  function openAdd() {
    setEditingDeveloper(undefined)
    setSheetOpen(true)
  }

  function openEdit(developer: DeveloperRow) {
    setEditingDeveloper(toFormData(developer))
    setSheetOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      const result = await deleteDeveloper(deleteTarget.id)
      if (!result.success) {
        toast.error(result.error ?? 'Delete failed')
        return
      }
      toast.success(result.message)
      setDeleteTarget(null)
      refetch()
    })
  }

  async function handleExport() {
    const rows = await fetchAllRecords<DeveloperRow>('/api/developers', queryParams)
    exportPdf(
      'developers.pdf',
      'Developers',
      rows.map((d) => ({
        Name: d.name,
        Email: d.email,
        Role: d.role,
        Status: d.status,
        Availability: d.availability,
        'Weekly Hours': d.weeklyHours,
        'Primary Skills': d.primarySkills,
        'Secondary Skills': d.secondarySkills,
        'Weak Areas': d.weakAreas,
        'Preferred Work': d.preferredWork,
        'Current Projects': d.currentProjects,
        'Past Projects': d.pastProjects,
        Notes: d.notes,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developers"
        description="Manage team profiles, skills, availability, and project assignments."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add Developer
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <RecordsTableToolbar
          title="All developers"
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterSelect={(key, value) =>
            setSelectedFilters((current) => ({ ...current, [key]: value ? [value] : [] }))
          }
          onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
          onExport={handleExport}
          resultCount={data.length}
          totalCount={total}
          searchPlaceholder="Search developers..."
          loading={loading}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="sticky top-0 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Developer
                </th>
                <th className="sticky top-0 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="sticky top-0 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills
                </th>
                <th className="sticky top-0 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hours
                </th>
                <th className="sticky top-0 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Availability
                </th>
                <th className="sticky top-0 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="sticky top-0 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((developer) => (
                <tr key={developer.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={developer.name} />
                      <div className="min-w-0">
                        <Link
                          href={`/developers/${developer.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {developer.name}
                        </Link>
                        {developer.preferredWork && (
                          <p className="truncate text-xs text-muted-foreground">{developer.preferredWork}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={developer.role} />
                  </td>
                  <td className="max-w-[200px] px-5 py-3.5">
                    <p className="truncate text-foreground">{developer.primarySkills || '—'}</p>
                    {developer.secondarySkills && (
                      <p className="truncate text-xs text-muted-foreground">{developer.secondarySkills}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{developer.weeklyHours}h/wk</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={developer.availability} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={developer.status} />
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
                        <DropdownMenuItem onClick={() => setViewTarget(developer)}>
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(developer)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(developer)}>
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
            <EmptyState title="No developers found" description="Adjust filters or add a new developer." />
          )}
        </div>

        <RecordsPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      </div>

      <FormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingDeveloper ? 'Edit Developer' : 'Add Developer'}
        description={
          editingDeveloper
            ? 'Update profile details and skills.'
            : 'Add a new developer to the knowledge base.'
        }
      >
        <DeveloperForm
          key={editingDeveloper?.id ?? 'new'}
          developer={editingDeveloper}
          skills={skills}
          projects={projects}
          onSuccess={() => {
            setSheetOpen(false)
            refetch()
          }}
          onCancel={() => setSheetOpen(false)}
        />
      </FormDialog>

      <DetailViewDialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.name ?? 'Developer Details'}
        fields={
          viewTarget
            ? [
                { label: 'Email', value: viewTarget.email },
                { label: 'Role', value: viewTarget.role },
                { label: 'Status', value: viewTarget.status },
                { label: 'Availability', value: viewTarget.availability },
                { label: 'Weekly Hours', value: viewTarget.weeklyHours },
                { label: 'Primary Skills', value: viewTarget.primarySkills },
                { label: 'Secondary Skills', value: viewTarget.secondarySkills },
                { label: 'Weak / Learning Areas', value: viewTarget.weakAreas },
                { label: 'Preferred Work', value: viewTarget.preferredWork },
                { label: 'Current Active Projects', value: viewTarget.currentProjects },
                { label: 'Past Projects', value: viewTarget.pastProjects },
                { label: 'Notes', value: viewTarget.notes },
              ]
            : []
        }
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete developer?"
        description={`This will permanently remove ${deleteTarget?.name ?? 'this developer'}. This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deletePending}
      />
    </div>
  )
}
