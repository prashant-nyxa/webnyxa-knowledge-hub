import { prisma } from '@/lib/prisma'

export default async function Dashboard() {
  const [totalDevs, activeProjects, todayPlans, pendingUpdates] = await Promise.all([
    prisma.developer.count({ where: { status: 'Active' } }),
    prisma.project.count({ where: { status: 'Active' } }),
    prisma.dailyPlan.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      }
    }),
    prisma.dailyUpdate.count({
      where: {
        status: { in: ['In Progress', 'Blocked'] }
      }
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome to the Internal Knowledge System.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Developers</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{totalDevs}</h3>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Projects</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{activeProjects}</h3>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Today&apos;s Plans</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{todayPlans}</h3>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Blocked / In Progress</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{pendingUpdates}</h3>
        </div>
      </div>
    </div>
  );
}
