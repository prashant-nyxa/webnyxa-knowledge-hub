export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { SkillsTable } from '@/components/SkillsTable'
import { requireAdmin } from '@/lib/auth'

export default async function SkillsPage() {
  await requireAdmin()

  const skills = await prisma.skill.findMany({
    orderBy: { category: 'asc' },
  })

  return <SkillsTable skills={skills} />
}
