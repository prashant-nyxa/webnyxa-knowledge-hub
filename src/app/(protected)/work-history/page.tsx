export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { DeveloperWorkHistoryList } from '@/components/work-history/DeveloperWorkHistoryView'
import { PageHeader } from '@/components/page-header'
import { requireAdmin } from '@/lib/auth'

export default async function WorkHistoryPage() {
  await requireAdmin()

  const developers = await prisma.developer.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, role: true, status: true },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Work History"
        description="Browse work history for each developer based on EOD updates and logged effort."
      />
      <DeveloperWorkHistoryList developers={developers} />
    </div>
  )
}
