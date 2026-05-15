import { prisma } from '@/lib/prisma'
import { addDailyPlan } from './actions'
import { DailyPlansTable } from '@/components/DailyPlansTable'

export default async function DailyPlansPage() {
  const plans = await prisma.dailyPlan.findMany({
    include: { developer: true, project: true },
    orderBy: { date: 'desc' }
  })
  
  const developers = await prisma.developer.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }})
  const projects = await prisma.project.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }})
  const planRows = plans.map((plan) => ({
    id: plan.id,
    date: plan.date.toLocaleDateString(),
    developerId: plan.developerId,
    developerName: plan.developer.name,
    projectId: plan.projectId,
    projectName: plan.project.name,
    taskTitle: plan.taskTitle,
    workType: plan.workType,
    technologies: plan.technologies,
    expectedEffort: plan.expectedEffort,
    priority: plan.priority,
    dependency: plan.dependency,
    notes: plan.notes,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Daily Plan Submission</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Submit Plan</h2>
            <form action={addDailyPlan} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input required type="text" name="taskTitle" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type of Work</label>
                <select required name="workType" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="Development">Development</option>
                  <option value="Bug Fix">Bug Fix</option>
                  <option value="QA">QA</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Research">Research</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Client Support">Client Support</option>
                  <option value="Code Review">Code Review</option>
                  <option value="Planning">Planning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Technologies</label>
                <input required type="text" name="technologies" placeholder="React, Node..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Effort (hours)</label>
                <input required type="number" step="0.5" name="expectedEffort" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select required name="priority" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dependency / Blocker</label>
                <input type="text" name="dependency" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors">Submit Plan</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <DailyPlansTable plans={planRows} developers={developers} projects={projects} />
        </div>
      </div>
    </div>
  )
}
