'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProject } from '@/app/(protected)/projects/actions'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { FormDialog } from '@/components/form-dialog'
import { ProjectForm, type ProjectFormData } from '@/components/forms/project-form'
import { PageHeader } from '@/components/page-header'
import {
  createInitialFilters,
  exportCsv,
  matchesFilters,
  RecordsTableToolbar,
  uniqueOptions,
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

function splitList(value: string | null) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

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

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectFormData | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()

  const filters = useMemo<FilterConfig[]>(
    () => [
      { key: 'type', label: 'Type', options: uniqueOptions(projects.map((p) => p.type)) },
      { key: 'status', label: 'Status', options: uniqueOptions(projects.map((p) => p.status)) },
      { key: 'client', label: 'Client', options: uniqueOptions(projects.map((p) => p.client)) },
      {
        key: 'techList',
        label: 'Tech',
        options: uniqueOptions(projects.flatMap((p) => splitList(p.techStack))),
      },
    ],
    [projects]
  )
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))

  const rows = projects.map((project) => ({
    ...project,
    techList: splitList(project.techStack),
  }))

  const filteredRows = rows.filter((project) => {
    const haystack =
      `${project.name} ${project.client ?? ''} ${project.type} ${project.status} ${project.techStack ?? ''} ${project.developersInvolved ?? ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && matchesFilters(project, selectedFilters)
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
    setEditingProject(undefined)
    setSheetOpen(true)
  }

  function openEdit(project: ProjectRow) {
    setEditingProject({ ...project })
    setSheetOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      const result = await deleteProject(deleteTarget.id)
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
        title="Projects"
        description="Track client work, tech stacks, team assignments, and delivery status."
        action={
          <Button onClick={openAdd}>
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
          onFilterToggle={toggleFilter}
          onClearFilters={() => setSelectedFilters(createInitialFilters(filters))}
          onExport={() =>
            exportCsv(
              'projects.csv',
              filteredRows.map((p) => ({
                Name: p.name,
                Client: p.client,
                Type: p.type,
                Status: p.status,
                'Tech Stack': p.techStack,
                Team: p.developersInvolved,
              }))
            )
          }
          resultCount={filteredRows.length}
          totalCount={projects.length}
          searchPlaceholder="Search projects..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Project
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Progress
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Updated
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((project) => {
                const progress = projectProgress(project.status)
                return (
                  <tr key={project.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {project.name}
                      </Link>
                      {project.techStack && (
                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground">
                          {project.techStack}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{project.client || '—'}</td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={project.type} />
                    </td>
                    <td className="max-w-[160px] px-5 py-3.5">
                      <p className="truncate text-muted-foreground">
                        {project.developersInvolved || '—'}
                      </p>
                    </td>
                    <td className="min-w-[120px] px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {formatRelativeDate(project.updatedAt)}
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
                          <DropdownMenuItem onClick={() => openEdit(project)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(project)}
                          >
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
          {filteredRows.length === 0 && (
            <EmptyState title="No projects found" description="Adjust filters or add a new project." />
          )}
        </div>
      </div>

      <FormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        description={
          editingProject ? 'Update project details and team info.' : 'Create a new project record.'
        }
      >
        <ProjectForm
          key={editingProject?.id ?? 'new'}
          project={editingProject}
          onSuccess={() => setSheetOpen(false)}
          onCancel={() => setSheetOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete project?"
        description={`This will permanently remove ${deleteTarget?.name ?? 'this project'}.`}
        onConfirm={handleDelete}
        loading={deletePending}
      />
    </div>
  )
}
