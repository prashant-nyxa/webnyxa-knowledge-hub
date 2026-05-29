'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type WorkHistoryFilterState = {
  dateFrom: string
  dateTo: string
  projects: string[]
  developers: string[]
  technologies: string[]
  statuses: string[]
  workTypes: string[]
  search: string
}

type WorkHistoryFiltersProps = {
  filters: WorkHistoryFilterState
  onChange: (filters: WorkHistoryFilterState) => void
  projectOptions: string[]
  developerOptions: string[]
  technologyOptions: string[]
  statusOptions: string[]
  workTypeOptions: string[]
  showProjectFilter: boolean
  showDeveloperFilter: boolean
  resultCount: number
  totalCount: number
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  if (options.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function WorkHistoryFilters({
  filters,
  onChange,
  projectOptions,
  developerOptions,
  technologyOptions,
  statusOptions,
  workTypeOptions,
  showProjectFilter,
  showDeveloperFilter,
  resultCount,
  totalCount,
}: WorkHistoryFiltersProps) {
  function toggle<K extends keyof WorkHistoryFilterState>(key: K, value: string) {
    const current = filters[key]
    if (!Array.isArray(current)) return
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  function clearAll() {
    onChange({
      dateFrom: '',
      dateTo: '',
      projects: [],
      developers: [],
      technologies: [],
      statuses: [],
      workTypes: [],
      search: '',
    })
  }

  const hasActive =
    filters.dateFrom ||
    filters.dateTo ||
    filters.projects.length > 0 ||
    filters.developers.length > 0 ||
    filters.technologies.length > 0 ||
    filters.statuses.length > 0 ||
    filters.workTypes.length > 0 ||
    filters.search

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          <p className="text-xs text-muted-foreground">
            {resultCount} of {totalCount} records
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Search tasks..."
              className="h-9 pl-9"
            />
          </div>
          {hasActive && (
            <Button type="button" variant="outline" size="sm" onClick={clearAll}>
              <X className="size-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date from
          </label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date to
          </label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {showProjectFilter && (
          <ChipGroup
            label="Project"
            options={projectOptions}
            selected={filters.projects}
            onToggle={(v) => toggle('projects', v)}
          />
        )}
        {showDeveloperFilter && (
          <ChipGroup
            label="Developer"
            options={developerOptions}
            selected={filters.developers}
            onToggle={(v) => toggle('developers', v)}
          />
        )}
        <ChipGroup
          label="Technology"
          options={technologyOptions}
          selected={filters.technologies}
          onToggle={(v) => toggle('technologies', v)}
        />
        <ChipGroup
          label="Status"
          options={statusOptions}
          selected={filters.statuses}
          onToggle={(v) => toggle('statuses', v)}
        />
        <ChipGroup
          label="Type of work"
          options={workTypeOptions}
          selected={filters.workTypes}
          onToggle={(v) => toggle('workTypes', v)}
        />
      </div>
    </div>
  )
}

export function emptyWorkHistoryFilters(): WorkHistoryFilterState {
  return {
    dateFrom: '',
    dateTo: '',
    projects: [],
    developers: [],
    technologies: [],
    statuses: [],
    workTypes: [],
    search: '',
  }
}
