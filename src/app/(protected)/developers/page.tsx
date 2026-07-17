export const dynamic = 'force-dynamic'

import { DevelopersTable } from '@/components/DevelopersTable'
import { getDeveloperFilters } from '@/lib/filter-options'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DevelopersPage() {
  await requireAdmin()

  const [filters, skills, projects] = await Promise.all([
    getDeveloperFilters(),
    prisma.skill.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.project.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return <DevelopersTable filters={filters} skills={skills} projects={projects} />
}
