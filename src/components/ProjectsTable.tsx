'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProject } from '@/app/(protected)/projects/actions'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { DetailViewDialog } from '@/components/detail-view-dialog'
import { EmptyState } from '@/components/empty-state'
import { FormDialog } from '@/components/form-dialog'
import { ProjectForm, type ProjectFormData } from '@/components/forms/project-form'
import { PageHeader } from '@/components/page-header'
import { RecordsPagination } from '@/components/records-pagination'
import {
  createInitialFilters,
  filtersToQueryParams,
  RecordsTableToolbar,
  type FilterConfig,
} from '@/components/records-table-tools'
import { CategoryBadge, ProgressBar, projectProgress, StatusBadge } from '@/components/status-badges'
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
  updatedAt?: string
}

type Option = { id: string; name: string }

function formatRelativeDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function ProjectsTable({
  filters,
  skills,
  developers,
}: {
  filters: FilterConfig[]
  skills: Option[]
  developers: Option[]
}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectFormData | undefined>()
  const [viewTarget, setViewTarget] = useState<ProjectRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null)
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
    usePaginatedQuery<ProjectRow>('/api/projects', queryParams)

  async function handleExport() {
    const rows = await fetchAllRecords<ProjectRow>('/api/projects', queryParams)
    exportPdf(
      'projects.pdf',
      'Projects',
      rows.map((p) => ({
        Name: p.name,
        Client: p.client,
        Type: p.type,
        Status: p.status,
        'Tech Stack': p.techStack,
        'Developers Involved': p.developersInvolved,
        'Developer Roles': p.developerRoles,
        'Main Features': p.mainFeatures,
        Challenges: p.challenges,
        'Start Date': p.startDate,
        'End Date': p.endDate,
        Summary: p.summary,
        Notes: p.notes,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Track client work, tech stacks, team assignments, and delivery status."
        action={
          <Button onClick={() => { setEditingProject(undefined); setSheetOpen(true) }}>
            <Plus className="size-4" />
            Add Project
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <RecordsTableToolbar
          title="All projects"
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
          searchPlaceholder="Search projects..."
          loading={loading}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((project) => {
                const progress = projectProgress(project.status)
                return (
                  <tr key={project.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <Link href={`/work-history/projects/${project.id}`} className="font-medium text-primary hover:underline">
                        {project.name}
                      </Link>
                      {project.techStack && (
                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground">{project.techStack}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{project.client || '—'}</td>
                    <td className="px-5 py-3.5"><CategoryBadge category={project.type} /></td>
                    <td className="max-w-[160px] px-5 py-3.5">
                      <p className="truncate text-muted-foreground">{project.developersInvolved || '—'}</p>
                    </td>
                    <td className="min-w-[120px] px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={project.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatRelativeDate(project.updatedAt)}</td>
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
                          <DropdownMenuItem onClick={() => setViewTarget(project)}>
                            <Eye className="size-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingProject({ ...project }); setSheetOpen(true) }}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(project)}>
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && data.length === 0 && (
            <EmptyState title="No projects found" description="Adjust filters or add a new project." />
          )}
        </div>

        <RecordsPagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} loading={loading} />
      </div>

      <FormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        description={editingProject ? 'Update project details and team info.' : 'Create a new project record.'}
      >
        <ProjectForm
          key={editingProject?.id ?? 'new'}
          project={editingProject}
          skills={skills}
          developers={developers}
          onSuccess={() => { setSheetOpen(false); refetch() }}
          onCancel={() => setSheetOpen(false)}
        />
      </FormDialog>

      <DetailViewDialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.name ?? 'Project Details'}
        fields={
          viewTarget
            ? [
                { label: 'Client', value: viewTarget.client },
                { label: 'Type', value: viewTarget.type },
                { label: 'Status', value: viewTarget.status },
                { label: 'Tech Stack', value: viewTarget.techStack },
                { label: 'Developers Involved', value: viewTarget.developersInvolved },
                { label: 'Developer Roles', value: viewTarget.developerRoles },
                { label: 'Main Features', value: viewTarget.mainFeatures },
                { label: 'Challenges', value: viewTarget.challenges },
                { label: 'Start Date', value: viewTarget.startDate },
                { label: 'End Date', value: viewTarget.endDate },
                { label: 'Summary', value: viewTarget.summary },
                { label: 'Notes', value: viewTarget.notes },
              ]
            : []
        }
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete project?"
        description={`This will permanently remove ${deleteTarget?.name ?? 'this project'}.`}
        onConfirm={() => {
          if (!deleteTarget) return
          startDeleteTransition(async () => {
            const result = await deleteProject(deleteTarget.id)
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
