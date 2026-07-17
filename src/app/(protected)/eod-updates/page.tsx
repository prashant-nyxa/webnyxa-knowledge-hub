export const dynamic = 'force-dynamic'

import { EodUpdatesTable } from '@/components/EodUpdatesTable'
import { getEodUpdateFilters } from '@/lib/filter-options'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function EodUpdatesPage() {
  const session = await requireUser()
  const developerFilter = session.role === 'admin' ? undefined : session.developerId

  const [filters, developers, projects, skills, plans] = await Promise.all([
    getEodUpdateFilters(),
    prisma.developer.findMany({
      where: session.role === 'admin' ? { status: 'Active' } : { id: session.developerId ?? '' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.skill.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.dailyPlan.findMany({
      where: developerFilter ? { developerId: developerFilter } : undefined,
      orderBy: { date: 'desc' },
      take: 50,
      include: { developer: true },
    }),
  ])

  const planOptions = plans.map((plan) => ({
    id: plan.id,
    label: `${plan.developer.name}: ${plan.taskTitle}`,
  }))

  return (
    <EodUpdatesTable
      filters={filters}
      developers={developers}
      projects={projects}
      plans={planOptions}
      skills={skills}
      canManageAll={session.role === 'admin'}
    />
  )
}
