'use client'

import { useMemo, useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteDailyPlan } from '@/app/(protected)/daily-plans/actions'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { DetailViewDialog } from '@/components/detail-view-dialog'
import { FormDialog } from '@/components/form-dialog'
import { DailyPlanForm, type DailyPlanFormData } from '@/components/forms/daily-plan-form'
import { PageHeader } from '@/components/page-header'
import { RecordsPagination } from '@/components/records-pagination'
import {
  createInitialFilters,
  filtersToQueryParams,
  RecordsTableToolbar,
  type FilterConfig,
} from '@/components/records-table-tools'
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
type DailyPlanRow = {
  id: string
  date: string
  dateValue: string
  developerId: string
  developerName: string
  projectId: string
  projectName: string
  taskTitle: string
  workType: string
  technologies: string
  expectedEffort: number
  priority: string
  dependency: string | null
  notes: string | null
}

export function DailyPlansTable({
  filters,
  developers,
  projects,
  skills,
  canManageAll,
}: {
  filters: FilterConfig[]
  developers: Option[]
  projects: Option[]
  skills: Option[]
  canManageAll: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<DailyPlanFormData | undefined>()
  const [viewTarget, setViewTarget] = useState<DailyPlanRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DailyPlanRow | null>(null)
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
    usePaginatedQuery<DailyPlanRow>('/api/daily-plans', queryParams)

  async function handleExport() {
    const rows = await fetchAllRecords<DailyPlanRow>('/api/daily-plans', queryParams)
    exportPdf(
      'daily-plans.pdf',
      'Daily Plans',
      rows.map((plan) => ({
        Date: plan.date,
        Developer: plan.developerName,
        Project: plan.projectName,
        Task: plan.taskTitle,
        'Type of Work': plan.workType,
        Technologies: plan.technologies,
        'Expected Effort': plan.expectedEffort,
        Priority: plan.priority,
        Dependency: plan.dependency,
        Notes: plan.notes,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Plans"
        description="Review submitted plans and add new work items through a modal form."
        action={
          <Button onClick={() => { setEditingPlan(undefined); setDialogOpen(true) }}>
            <Plus className="size-4" />
            Add Daily Plan
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
        <RecordsTableToolbar
          title="All daily plans"
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
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dev & Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effort</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((plan) => (
                <tr key={plan.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5 text-muted-foreground">{plan.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{plan.developerName}</div>
                    <div className="text-xs text-muted-foreground">{plan.projectName}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{plan.taskTitle}</div>
                    <div className="text-xs text-muted-foreground">{plan.workType} · {plan.technologies}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{plan.expectedEffort}h</td>
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
                        <DropdownMenuItem onClick={() => setViewTarget(plan)}>
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditingPlan({
                            id: plan.id,
                            date: plan.dateValue,
                            developerId: plan.developerId,
                            developerName: plan.developerName,
                            projectId: plan.projectId,
                            taskTitle: plan.taskTitle,
                            workType: plan.workType,
                            technologies: plan.technologies,
                            expectedEffort: plan.expectedEffort,
                            priority: plan.priority,
                            dependency: plan.dependency,
                            notes: plan.notes,
                          })
                          setDialogOpen(true)
                        }}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(plan)}>
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
        title={editingPlan ? 'Edit Daily Plan' : 'Add Daily Plan'}
        description={editingPlan ? 'Update the selected daily plan.' : 'Create a new daily plan entry.'}
      >
        <DailyPlanForm
          key={editingPlan?.id ?? 'new'}
          plan={editingPlan}
          developers={developers}
          projects={projects}
          skills={skills}
          canManageAll={canManageAll}
          onSuccess={() => { setDialogOpen(false); refetch() }}
          onCancel={() => setDialogOpen(false)}
        />
      </FormDialog>

      <DetailViewDialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.taskTitle ?? 'Daily Plan Details'}
        fields={
          viewTarget
            ? [
                { label: 'Date', value: viewTarget.date },
                { label: 'Developer', value: viewTarget.developerName },
                { label: 'Project', value: viewTarget.projectName },
                { label: 'Task Title', value: viewTarget.taskTitle },
                { label: 'Type of Work', value: viewTarget.workType },
                { label: 'Technologies', value: viewTarget.technologies },
                { label: 'Expected Effort', value: `${viewTarget.expectedEffort}h` },
                { label: 'Priority', value: viewTarget.priority },
                { label: 'Dependency / Blocker', value: viewTarget.dependency },
                { label: 'Notes', value: viewTarget.notes },
              ]
            : []
        }
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete daily plan?"
        description={`This will permanently remove "${deleteTarget?.taskTitle ?? 'this plan'}".`}
        onConfirm={async () => {
          if (!deleteTarget) return
          const fd = new FormData()
          fd.set('id', deleteTarget.id)
          await deleteDailyPlan(fd)
          toast.success('Daily plan deleted')
          setDeleteTarget(null)
          refetch()
        }}
      />
    </div>
  )
}
