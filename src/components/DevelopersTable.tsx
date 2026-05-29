'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteDeveloper } from '@/app/(protected)/developers/actions'
import { AvatarInitials } from '@/components/avatar-initials'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { FormDialog } from '@/components/form-dialog'
import { DeveloperForm, type DeveloperFormData } from '@/components/forms/developer-form'
import { PageHeader } from '@/components/page-header'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
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
type DeveloperRow = {
  id: string
  name: string
  role: string
  email: string
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

function toFormData(dev: DeveloperRow): DeveloperFormData {
  return { ...dev }
}

export function DevelopersTable({ developers }: { developers: DeveloperRow[] }) {
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperFormData | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<DeveloperRow | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()

  const filters = useMemo<FilterConfig[]>(
    () => [
      { key: 'role', label: 'Role', options: uniqueOptions(developers.map((d) => d.role)) },
      { key: 'status', label: 'Status', options: uniqueOptions(developers.map((d) => d.status)) },
      { key: 'availability', label: 'Availability', options: ['Available', 'Busy'] },
      {
        key: 'primarySkillList',
        label: 'Skill',
        options: uniqueOptions(developers.flatMap((d) => splitList(d.primarySkills))),
      },
    ],
    [developers]
  )
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))

  const rows = useMemo(
    () =>
      developers.map((developer) => ({
        ...developer,
        availability:
          developer.status === 'Active' && developer.weeklyHours >= 40 ? 'Available' : 'Busy',
        primarySkillList: splitList(developer.primarySkills),
      })),
    [developers]
  )

  const filteredRows = rows.filter((developer) => {
    const haystack =
      `${developer.name} ${developer.role} ${developer.status} ${developer.primarySkills ?? ''} ${developer.secondarySkills ?? ''}`.toLowerCase()
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
    })
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
          onFilterToggle={toggleFilter}
          onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
          onExport={() =>
            exportCsv(
              'developers.csv',
              filteredRows.map((d) => ({
                Name: d.name,
                Role: d.role,
                'Hours/Week': d.weeklyHours,
                Status: d.status,
                Availability: d.availability,
                'Primary Skills': d.primarySkills,
              }))
            )
          }
          resultCount={filteredRows.length}
          totalCount={developers.length}
          searchPlaceholder="Search developers..."
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
              {filteredRows.map((developer) => (
                <tr
                  key={developer.id}
                  className="transition-colors hover:bg-muted/30"
                >
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
                        <DropdownMenuItem onClick={() => openEdit(developer)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(developer)}
                        >
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
            <EmptyState title="No developers found" description="Adjust filters or add a new developer." />
          )}
        </div>
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
          onSuccess={() => setSheetOpen(false)}
          onCancel={() => setSheetOpen(false)}
        />
      </FormDialog>

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
