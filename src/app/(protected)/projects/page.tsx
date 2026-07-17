export const dynamic = 'force-dynamic'

import { ProjectsTable } from '@/components/ProjectsTable'
import { getProjectFilters } from '@/lib/filter-options'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function ProjectsPage() {
  await requireAdmin()

  const [filters, skills, developers] = await Promise.all([
    getProjectFilters(),
    prisma.skill.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.developer.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return <ProjectsTable filters={filters} skills={skills} developers={developers} />
}
