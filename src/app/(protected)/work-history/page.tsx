export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/page-header'
import { WorkHistoryHub } from '@/components/work-history/WorkHistoryHub'
import { requireAdmin } from '@/lib/auth'

function daysAgo(days: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d
}

export default async function WorkHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const initialMode = params.mode === 'projects' ? 'projects' : 'developers'
  const since = daysAgo(30)

  const [developers, projects, updates] = await Promise.all([
    prisma.developer.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true, status: true },
    }),
    prisma.project.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, type: true, status: true, client: true },
    }),
    prisma.dailyUpdate.findMany({
      select: {
        developerId: true,
        projectId: true,
        date: true,
        actualEffort: true,
      },
      orderBy: { date: 'desc' },
    }),
  ])

  const developerCards = developers.map((dev) => {
    const rows = updates.filter((u) => u.developerId === dev.id)
    const recent = rows.filter((u) => u.date >= since)
    const last = rows[0]
    return {
      id: dev.id,
      name: dev.name,
      role: dev.role,
      status: dev.status,
      taskCount: rows.length,
      hoursLast30: recent.reduce((sum, u) => sum + u.actualEffort, 0),
      lastActivity: last ? last.date.toLocaleDateString() : null,
    }
  })

  const projectCards = projects.map((project) => {
    const rows = updates.filter((u) => u.projectId === project.id)
    const recent = rows.filter((u) => u.date >= since)
    const last = rows[0]
    const developerIds = new Set(rows.map((u) => u.developerId))
    return {
      id: project.id,
      name: project.name,
      type: project.type,
      status: project.status,
      client: project.client,
      developerCount: developerIds.size,
      hoursLast30: recent.reduce((sum, u) => sum + u.actualEffort, 0),
      lastActivity: last ? last.date.toLocaleDateString() : null,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work History"
        description="Browse delivery history by developer or project — effort, tasks, and outcomes from EOD updates."
      />
      <WorkHistoryHub
        developers={developerCards}
        projects={projectCards}
        initialMode={initialMode}
      />
    </div>
  )
}
