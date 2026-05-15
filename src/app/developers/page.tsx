import { prisma } from '@/lib/prisma'
import { addDeveloper } from './actions'
import { DevelopersTable } from '@/components/DevelopersTable'

export default async function DevelopersPage() {
  const developers = await prisma.developer.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Developer Profile Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Add Developer</h2>
            <form action={addDeveloper} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" name="name" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input required type="text" name="role" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. Fullstack Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly Hours</label>
                <input required type="number" name="weeklyHours" defaultValue={40} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors">Add Developer</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <DevelopersTable developers={developers} />
        </div>
      </div>
    </div>
  )
}
