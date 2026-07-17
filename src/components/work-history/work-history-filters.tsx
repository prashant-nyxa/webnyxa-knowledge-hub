'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/styled-select'
import type { FilterConfig } from '@/components/records-table-tools'

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
  filterOptions: FilterConfig[]
  showProjectFilter: boolean
  showDeveloperFilter: boolean
  resultCount: number
  totalCount: number
  loading?: boolean
}

function FilterSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (value: string) => void
}) {
  if (options.length === 0) return null

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <StyledSelect
        value={selected[0] ?? ''}
        onChange={onChange}
        options={options}
        placeholder={`All ${label.toLowerCase()}`}
        emptyOptionLabel={`All ${label.toLowerCase()}`}
      />
    </div>
  )
}

function getOptions(filterOptions: FilterConfig[], key: string) {
  return filterOptions.find((f) => f.key === key)?.options ?? []
}

export function WorkHistoryFilters({
  filters,
  onChange,
  filterOptions,
  showProjectFilter,
  showDeveloperFilter,
  resultCount,
  totalCount,
  loading,
}: WorkHistoryFiltersProps) {
  const projectOptions = getOptions(filterOptions, 'project')
  const developerOptions = getOptions(filterOptions, 'developer')
  const technologyOptions = getOptions(filterOptions, 'technology')
  const statusOptions = getOptions(filterOptions, 'status')
  const workTypeOptions = getOptions(filterOptions, 'workType')

  function selectFilter<K extends keyof WorkHistoryFilterState>(key: K, value: string) {
    const current = filters[key]
    if (!Array.isArray(current)) return
    onChange({ ...filters, [key]: value ? [value] : [] })
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
            {loading ? 'Loading...' : `${resultCount} of ${totalCount} records`}
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
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date from</label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date to</label>
          <Input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value })} className="h-9" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {showProjectFilter && (
          <FilterSelect label="Project" options={projectOptions} selected={filters.projects} onChange={(v) => selectFilter('projects', v)} />
        )}
        {showDeveloperFilter && (
          <FilterSelect label="Developer" options={developerOptions} selected={filters.developers} onChange={(v) => selectFilter('developers', v)} />
        )}
        <FilterSelect label="Technology" options={technologyOptions} selected={filters.technologies} onChange={(v) => selectFilter('technologies', v)} />
        <FilterSelect label="Status" options={statusOptions} selected={filters.statuses} onChange={(v) => selectFilter('statuses', v)} />
        <FilterSelect label="Type of work" options={workTypeOptions} selected={filters.workTypes} onChange={(v) => selectFilter('workTypes', v)} />
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
