'use client'

import { useMemo, useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteEodUpdate } from '@/app/(protected)/eod-updates/actions'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { DetailViewDialog } from '@/components/detail-view-dialog'
import { FormDialog } from '@/components/form-dialog'
import { EodUpdateForm, type EodUpdateFormData } from '@/components/forms/eod-update-form'
import { PageHeader } from '@/components/page-header'
import { RecordsPagination } from '@/components/records-pagination'
import {
  createInitialFilters,
  filtersToQueryParams,
  RecordsTableToolbar,
  type FilterConfig,
} from '@/components/records-table-tools'
import { StatusBadge } from '@/components/status-badges'
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

type Option = { id: string; name: string }
type PlanOption = { id: string; label: string }
type EodUpdateRow = {
  id: string
  date: string
  dateValue: string
  developerId: string
  developerName: string
  projectId: string
  projectName: string
  dailyPlanId: string | null
  taskTitle: string
  workType: string
  technologies: string
  status: string
  actualEffort: number
  workCompleted: string | null
  workPending: string | null
  blocker: string | null
  summary: string | null
  planType: string
}

export function EodUpdatesTable({
  filters,
  developers,
  projects,
  plans,
  skills,
  canManageAll,
}: {
  filters: FilterConfig[]
  developers: Option[]
  projects: Option[]
  plans: PlanOption[]
  skills: Option[]
  canManageAll: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<EodUpdateFormData | undefined>()
  const [viewTarget, setViewTarget] = useState<EodUpdateRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EodUpdateRow | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [selectedFilters, setSelectedFilters] = useState(() => createInitialFilters(filters))
  const [dateFilter, setDateFilter] = useState('')

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      pageSize: DEFAULT_PAGE_SIZE,
      date: dateFilter,
      ...filtersToQueryParams(selectedFilters),
    }),
    [debouncedSearch, selectedFilters, dateFilter]
  )

  const { data, total, page, totalPages, loading, setPage, refetch } =
    usePaginatedQuery<EodUpdateRow>('/api/eod-updates', queryParams)

  async function handleExport() {
    const rows = await fetchAllRecords<EodUpdateRow>('/api/eod-updates', queryParams)
    exportPdf(
      'eod-updates.pdf',
      'End-of-Day Updates',
      rows.map((update) => ({
        Date: update.date,
        Developer: update.developerName,
        Project: update.projectName,
        Task: update.taskTitle,
        'Type of Work': update.workType,
        Technologies: update.technologies,
        Status: update.status,
        'Actual Effort': update.actualEffort,
        'Plan Link': update.planType,
        Completed: update.workCompleted,
        Pending: update.workPending,
        Blocker: update.blocker,
        Summary: update.summary,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="End-of-Day Updates"
        description="Track delivery outcomes in a table view and manage entries from a modal form."
        action={
          <Button onClick={() => { setEditingUpdate(undefined); setDialogOpen(true) }}>
            <Plus className="size-4" />
            Add EOD Update
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <RecordsTableToolbar
          title="All end-of-day updates"
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterSelect={(key, value) =>
            setSelectedFilters((current) => ({ ...current, [key]: value ? [value] : [] }))
          }
          onClearFilters={() => { setSelectedFilters(createInitialFilters(filters)); setDateFilter('') }}
          onExport={handleExport}
          resultCount={data.length}
          totalCount={total}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          loading={loading}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effort</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((update) => (
                <tr key={update.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5 text-muted-foreground">{update.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{update.taskTitle}</div>
                    <div className="text-xs text-muted-foreground">{update.developerName} - {update.projectName}</div>
                    <span className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      update.dailyPlanId ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {update.planType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={update.status} /></td>
                  <td className="px-5 py-3.5 text-muted-foreground">{update.actualEffort}h</td>
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
                        <DropdownMenuItem onClick={() => setViewTarget(update)}>
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditingUpdate({
                            id: update.id,
                            date: update.dateValue,
                            developerId: update.developerId,
                            developerName: update.developerName,
                            projectId: update.projectId,
                            dailyPlanId: update.dailyPlanId,
                            taskTitle: update.taskTitle,
                            workType: update.workType,
                            technologies: update.technologies,
                            status: update.status,
                            actualEffort: update.actualEffort,
                            workCompleted: update.workCompleted,
                            workPending: update.workPending,
                            blocker: update.blocker,
                            summary: update.summary,
                          })
                          setDialogOpen(true)
                        }}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(update)}>
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
        </div>

        <RecordsPagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} loading={loading} />
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingUpdate ? 'Edit EOD Update' : 'Add EOD Update'}
        description={editingUpdate ? 'Update the selected end-of-day report.' : 'Create a new end-of-day update entry.'}
      >
        <EodUpdateForm
          key={editingUpdate?.id ?? 'new'}
          update={editingUpdate}
          developers={developers}
          projects={projects}
          plans={plans}
          skills={skills}
          canManageAll={canManageAll}
          onSuccess={() => { setDialogOpen(false); refetch() }}
          onCancel={() => setDialogOpen(false)}
        />
      </FormDialog>

      <DetailViewDialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.taskTitle ?? 'EOD Update Details'}
        fields={
          viewTarget
            ? [
                { label: 'Date', value: viewTarget.date },
                { label: 'Developer', value: viewTarget.developerName },
                { label: 'Project', value: viewTarget.projectName },
                { label: 'Task Title', value: viewTarget.taskTitle },
                { label: 'Type of Work', value: viewTarget.workType },
                { label: 'Technologies Used', value: viewTarget.technologies },
                { label: 'Status', value: viewTarget.status },
                { label: 'Actual Effort', value: `${viewTarget.actualEffort}h` },
                { label: 'Plan Link', value: viewTarget.planType },
                { label: 'Work Completed', value: viewTarget.workCompleted },
                { label: 'Work Pending', value: viewTarget.workPending },
                { label: 'Blocker', value: viewTarget.blocker },
                { label: 'Summary', value: viewTarget.summary },
              ]
            : []
        }
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete EOD update?"
        description={`This will permanently remove "${deleteTarget?.taskTitle ?? 'this update'}".`}
        onConfirm={async () => {
          if (!deleteTarget) return
          const fd = new FormData()
          fd.set('id', deleteTarget.id)
          await deleteEodUpdate(fd)
          toast.success('EOD update deleted')
          setDeleteTarget(null)
          refetch()
        }}
      />
    </div>
  )
}
