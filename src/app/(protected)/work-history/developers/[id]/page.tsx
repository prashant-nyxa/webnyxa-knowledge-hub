export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DeveloperWorkHistoryView } from '@/components/work-history/DeveloperWorkHistoryView'
import { PageHeader } from '@/components/page-header'
import { AvatarInitials } from '@/components/avatar-initials'
import { RoleBadge, StatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getWorkHistoryFilters } from '@/lib/filter-options'

export default async function DeveloperWorkHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const [developer, filters] = await Promise.all([
    prisma.developer.findUnique({ where: { id } }),
    getWorkHistoryFilters(),
  ])

  if (!developer) return notFound()

  const availability =
    developer.status === 'Active' && developer.weeklyHours >= 40 ? 'Available' : 'Busy'

  return (
    <div className="space-y-6">
      <PageHeader
        title={developer.name}
        description="Developer work history — real experience based on EOD updates and logged effort."
        action={
          <Button variant="outline" size="sm" render={<Link href="/work-history" />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/50">
        <AvatarInitials name={developer.name} size="lg" />
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge role={developer.role} />
          <StatusBadge status={developer.status} />
          <StatusBadge status={availability} />
          <span className="text-sm text-muted-foreground">{developer.weeklyHours}h/week</span>
        </div>
      </div>

      <DeveloperWorkHistoryView developerId={developer.id} filters={filters} />
    </div>
  )
}
