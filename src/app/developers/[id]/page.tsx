import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { WorkHistoryTable } from '@/components/WorkHistoryTable'

export default async function DeveloperHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const developer = await prisma.developer.findUnique({
    where: { id },
    include: {
      dailyUpdates: {
        include: { project: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!developer) return notFound()
  const rows = developer.dailyUpdates.map((update) => ({
    id: update.id,
    date: update.date.toLocaleDateString(),
    developerName: developer.name,
    projectName: update.project.name,
    taskTitle: update.taskTitle,
    workType: update.workType,
    technologies: update.technologies,
    status: update.status,
    actualEffort: update.actualEffort,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{developer.name} - Work History</h1>
        <Link href="/developers" className="text-sm text-blue-600 hover:underline">Back to Developers</Link>
      </div>

      <WorkHistoryTable rows={rows} mode="developer" />
    </div>
  )
}
