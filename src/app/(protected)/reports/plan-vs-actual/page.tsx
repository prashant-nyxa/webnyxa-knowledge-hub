export const dynamic = 'force-dynamic'

import { PlanVsActualTable } from '@/components/PlanVsActualTable'
import { getPlanVsActualFilters } from '@/lib/filter-options'
import { requireAdmin } from '@/lib/auth'

export default async function PlanVsActualPage() {
  await requireAdmin()
  const filters = await getPlanVsActualFilters()
  return <PlanVsActualTable filters={filters} />
}
