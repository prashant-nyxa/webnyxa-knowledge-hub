import { prisma } from '@/lib/prisma'
import { addProject } from './actions'
import { ProjectsTable } from '@/components/ProjectsTable'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })
  const projectRows = projects.map((project) => ({
    ...project,
    startDate: project.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: project.endDate?.toISOString().slice(0, 10) ?? null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Project Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Add Project</h2>
            <form action={addProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input required type="text" name="name" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. Acme Website" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <input type="text" name="client" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select required name="type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Select a type</option>
                  <option value="Website">Website</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Admin Panel">Admin Panel</option>
                  <option value="Backend">Backend</option>
                  <option value="Shopify">Shopify</option>
                  <option value="WordPress">WordPress</option>
                  <option value="CMS">CMS</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tech Stack Used</label>
                <textarea name="techStack" rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Next.js, PostgreSQL, Sanity CMS" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Developers Involved</label>
                <textarea name="developersInvolved" rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Names or team members" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role of Each Developer</label>
                <textarea name="developerRoles" rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Gaurav - frontend, Riya - backend" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Main Features Delivered</label>
                <textarea name="mainFeatures" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Important Challenges Handled</label>
                <textarea name="challenges" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" name="startDate" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" name="endDate" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <textarea name="summary" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors">Add Project</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <ProjectsTable projects={projectRows} />
        </div>
      </div>
    </div>
  )
}
