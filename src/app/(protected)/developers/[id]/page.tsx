export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'

export default async function DeveloperHistoryRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  redirect(`/work-history/developers/${id}`)
}
