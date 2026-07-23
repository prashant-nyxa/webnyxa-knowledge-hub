'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/empty-state'
import { AvatarInitials } from '@/components/avatar-initials'
import { CategoryBadge, RoleBadge, StatusBadge } from '@/components/status-badges'
import { cn } from '@/lib/utils'

export type WorkHistoryDeveloperCard = {
  id: string
  name: string
  role: string
  status: string
  taskCount: number
  hoursLast30: number
  lastActivity: string | null
}

export type WorkHistoryProjectCard = {
  id: string
  name: string
  type: string
  status: string
  client: string | null
  developerCount: number
  hoursLast30: number
  lastActivity: string | null
}

type Mode = 'developers' | 'projects'

export function WorkHistoryHub({
  developers,
  projects,
  initialMode = 'developers',
}: {
  developers: WorkHistoryDeveloperCard[]
  projects: WorkHistoryProjectCard[]
  initialMode?: Mode
}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [search, setSearch] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setSearch('')
    router.replace(next === 'projects' ? '/work-history?mode=projects' : '/work-history')
  }

  const filteredDevelopers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return developers
    return developers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.role.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    )
  }, [developers, search])

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        (p.client ?? '').toLowerCase().includes(q)
    )
  }, [projects, search])

  const items = mode === 'developers' ? filteredDevelopers : filteredProjects

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode('developers')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              mode === 'developers'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Developers
          </button>
          <button
            type="button"
            onClick={() => switchMode('projects')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              mode === 'projects'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Projects
          </button>
        </div>

        <div className="relative min-w-0 sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mode === 'developers' ? 'Search developers...' : 'Search projects...'}
            className="h-9 pl-9"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {items.length} {mode === 'developers' ? 'developer' : 'project'}
        {items.length === 1 ? '' : 's'}
      </p>

      {mode === 'developers' ? (
        filteredDevelopers.length === 0 ? (
          <EmptyState title="No developers found" description="Try a different search." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDevelopers.map((dev) => (
              <Link
                key={dev.id}
                href={`/work-history/developers/${dev.id}`}
                className="group rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/50 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <AvatarInitials name={dev.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-primary group-hover:underline">{dev.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <RoleBadge role={dev.role} />
                      <StatusBadge status={dev.status} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{dev.taskCount}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tasks</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{dev.hoursLast30.toFixed(0)}h</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">30d</p>
                  </div>
                  <div>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {dev.lastActivity ?? '—'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Last</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : filteredProjects.length === 0 ? (
        <EmptyState title="No projects found" description="Try a different search." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/work-history/projects/${project.id}`}
              className="group rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/50 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="font-medium text-primary group-hover:underline">{project.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={project.type} />
                  <StatusBadge status={project.status} />
                </div>
                {project.client && (
                  <p className="mt-2 text-xs text-muted-foreground">Client: {project.client}</p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                <div>
                  <p className="text-sm font-semibold text-foreground">{project.developerCount}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Devs</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{project.hoursLast30.toFixed(0)}h</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">30d</p>
                </div>
                <div>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {project.lastActivity ?? '—'}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Last</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
