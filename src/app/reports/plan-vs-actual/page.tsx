import { prisma } from '@/lib/prisma'
import { PlanVsActualTable } from '@/components/PlanVsActualTable'

export default async function PlanVsActualPage() {
  const updates = await prisma.dailyUpdate.findMany({
    include: { developer: true, project: true, dailyPlan: true },
    orderBy: { date: 'desc' }
  })
  const rows = updates.map((update) => {
    const expected = update.dailyPlan?.expectedEffort || 0
    const actual = update.actualEffort

    return {
      id: update.id,
      date: update.date.toLocaleDateString(),
      developerName: update.developer.name,
      projectName: update.project.name,
      taskTitle: update.taskTitle,
      status: update.status,
      expectedEffort: expected,
      actualEffort: actual,
      difference: actual - expected,
      planType: update.dailyPlanId ? 'Planned' : 'Unplanned',
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Plan vs Actual Report</h1>
      </div>

      <PlanVsActualTable rows={rows} />
    </div>
  )
}
