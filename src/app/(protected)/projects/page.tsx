export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ProjectsTable } from '@/components/ProjectsTable'
import { requireAdmin } from '@/lib/auth'

export default async function ProjectsPage() {
  await requireAdmin()

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
  })
  const projectRows = projects.map((project) => ({
    ...project,
    startDate: project.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: project.endDate?.toISOString().slice(0, 10) ?? null,
    updatedAt: project.updatedAt.toISOString(),
  }))

  return <ProjectsTable projects={projectRows} />
}
