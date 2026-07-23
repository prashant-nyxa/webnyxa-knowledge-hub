export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProjectWorkHistoryView } from '@/components/work-history/ProjectWorkHistoryView'
import { PageHeader } from '@/components/page-header'
import { CategoryBadge, StatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getWorkHistoryFilters } from '@/lib/filter-options'

export default async function ProjectWorkHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const [project, filters] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    getWorkHistoryFilters(),
  ])

  if (!project) return notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description="Project work history — complete delivery record for proposals and references."
        action={
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/work-history?mode=projects" />}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/50">
        <CategoryBadge category={project.type} />
        <StatusBadge status={project.status} />
        {project.client && (
          <span className="text-sm text-muted-foreground">Client: {project.client}</span>
        )}
        {project.techStack && (
          <span className="text-sm text-muted-foreground">· {project.techStack}</span>
        )}
      </div>

      <ProjectWorkHistoryView
        projectId={project.id}
        filters={filters}
        projectSummary={project.summary}
        projectNotes={project.notes}
        developersInvolved={project.developersInvolved}
      />
    </div>
  )
}
