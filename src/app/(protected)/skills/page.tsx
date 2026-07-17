export const dynamic = 'force-dynamic'

import { SkillsTable } from '@/components/SkillsTable'
import { getSkillFilters } from '@/lib/filter-options'
import { requireAdmin } from '@/lib/auth'

export default async function SkillsPage() {
  await requireAdmin()
  const filters = await getSkillFilters()
  return <SkillsTable filters={filters} />
}
