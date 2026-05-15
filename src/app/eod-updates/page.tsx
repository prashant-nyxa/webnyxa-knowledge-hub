import { prisma } from '@/lib/prisma'
import { addEodUpdate } from './actions'
import { EodUpdatesTable } from '@/components/EodUpdatesTable'

export default async function EodUpdatesPage() {
  const updates = await prisma.dailyUpdate.findMany({
    include: { developer: true, project: true, dailyPlan: true },
    orderBy: { date: 'desc' }
  })
  
  const developers = await prisma.developer.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }})
  const projects = await prisma.project.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }})
  const plans = await prisma.dailyPlan.findMany({ orderBy: { date: 'desc' }, take: 50, include: { developer: true } })
  const updateRows = updates.map((update) => ({
    id: update.id,
    date: update.date.toLocaleDateString(),
    developerId: update.developerId,
    developerName: update.developer.name,
    projectId: update.projectId,
    projectName: update.project.name,
    dailyPlanId: update.dailyPlanId,
    taskTitle: update.taskTitle,
    workType: update.workType,
    technologies: update.technologies,
    status: update.status,
    actualEffort: update.actualEffort,
    workCompleted: update.workCompleted,
    workPending: update.workPending,
    blocker: update.blocker,
    summary: update.summary,
    planType: update.dailyPlanId ? 'Planned' : 'Unplanned',
  }))
  const planOptions = plans.map((plan) => ({
    id: plan.id,
    label: `${plan.developer.name}: ${plan.taskTitle}`,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">End-of-Day Update Submission</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Submit Update</h2>
            <form action={addEodUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Daily Plan (Optional)</label>
                <select name="dailyPlanId" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">No Plan (Unplanned Task)</option>
                  {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.developer.name}: {plan.taskTitle}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Developer</label>
                  <select required name="developerId" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">Select Developer</option>
                    {developers.map(dev => <option key={dev.id} value={dev.id}>{dev.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select required name="projectId" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">Select Project</option>
                    {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input required type="text" name="taskTitle" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Type</label>
                  <select required name="workType" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="Development">Development</option>
                    <option value="Bug Fix">Bug Fix</option>
                    <option value="QA">QA</option>
                    <option value="Deployment">Deployment</option>
                    <option value="Research">Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select required name="status" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="Done">Done</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Carried Forward">Carried Forward</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Technologies used</label>
                <input required type="text" name="technologies" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Actual Effort (hours)</label>
                <input required type="number" step="0.5" name="actualEffort" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Work Completed</label>
                <textarea name="workCompleted" rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Work Pending / Blocker</label>
                <textarea name="workPending" rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors">Submit Update</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <EodUpdatesTable updates={updateRows} developers={developers} projects={projects} plans={planOptions} />
        </div>
      </div>
    </div>
  )
}
