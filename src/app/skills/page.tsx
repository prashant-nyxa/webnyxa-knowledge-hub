import { prisma } from '@/lib/prisma'
import { addSkill } from './actions'
import { SkillsTable } from '@/components/SkillsTable'
import { PendingSubmitButton } from '@/components/PendingSubmitButton'

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: { category: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Skills Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Add New Skill</h2>
            <form action={addSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Name</label>
                <input required type="text" name="name" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. React Native" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select required name="category" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Select a category</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Mobile">Mobile</option>
                  <option value="CMS">CMS</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Database">Database</option>
                  <option value="QA">QA</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <PendingSubmitButton label="Add Skill" pendingLabel="Adding..." className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-black py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70" />
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <SkillsTable skills={skills} />
        </div>
      </div>
    </div>
  )
}
