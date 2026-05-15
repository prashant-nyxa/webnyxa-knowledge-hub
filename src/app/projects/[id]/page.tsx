import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { WorkHistoryTable } from '@/components/WorkHistoryTable'

export default async function ProjectHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      dailyUpdates: {
        include: { developer: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!project) return notFound()
  const rows = project.dailyUpdates.map((update) => ({
    id: update.id,
    date: update.date.toLocaleDateString(),
    developerName: update.developer.name,
    projectName: project.name,
    taskTitle: update.taskTitle,
    workType: update.workType,
    technologies: update.technologies,
    status: update.status,
    actualEffort: update.actualEffort,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{project.name} - Work History</h1>
        <Link href="/projects" className="text-sm text-blue-600 hover:underline">Back to Projects</Link>
      </div>

      <WorkHistoryTable rows={rows} mode="project" />
    </div>
  )
}
