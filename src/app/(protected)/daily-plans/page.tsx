export const dynamic = 'force-dynamic'

import { DailyPlansTable } from '@/components/DailyPlansTable'
import { getDailyPlanFilters } from '@/lib/filter-options'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DailyPlansPage() {
  const session = await requireUser()
  const developerFilter = session.role === 'admin' ? undefined : session.developerId

  const [filters, developers, projects, skills] = await Promise.all([
    getDailyPlanFilters(),
    prisma.developer.findMany({
      where: session.role === 'admin' ? { status: 'Active' } : { id: session.developerId ?? '' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.skill.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <DailyPlansTable
      filters={filters}
      developers={developers}
      projects={projects}
      skills={skills}
      canManageAll={session.role === 'admin'}
    />
  )
}
