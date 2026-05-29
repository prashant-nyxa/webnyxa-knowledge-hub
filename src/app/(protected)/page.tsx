export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Clock } from 'lucide-react'
import { getManagementDashboardData } from '@/lib/dashboard-data'
import { ManagementSummaries } from '@/components/dashboard/management-summaries'
import { AvatarInitials } from '@/components/avatar-initials'
import { StatusBadge, ProgressBar } from '@/components/status-badges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireUser } from '@/lib/auth'

export default async function Dashboard() {
  const session = await requireUser()
  if (session.role !== 'admin') {
    redirect('/daily-plans')
  }

  const data = await getManagementDashboardData()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">{dateLabel}</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}, team
          </h1>
          <p className="text-muted-foreground">
            Management overview — team workload, project progress, and skill availability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href="/daily-plans" />}>
            Daily Plans
          </Button>
          <Button size="sm" render={<Link href="/eod-updates" />}>
            EOD Updates
          </Button>
        </div>
      </div>

      <ManagementSummaries data={data} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Activity & availability</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/eod-updates" />}>
                View all
                <ArrowRight className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {data.recentUpdates.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground">No recent EOD updates.</p>
              ) : (
                data.recentUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                  >
                    <AvatarInitials name={update.developer.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{update.taskTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {update.developer.name} · {update.project.name}
                      </p>
                    </div>
                    <StatusBadge status={update.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Project Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.projectsByStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              ) : (
                data.projectsByStatus.map((group) => (
                  <div key={group.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <StatusBadge status={group.status} />
                      <span className="font-medium text-foreground">{group._count.status}</span>
                    </div>
                    <ProgressBar
                      value={
                        (group._count.status /
                          data.projectsByStatus.reduce((s, g) => s + g._count.status, 0)) *
                        100
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-base">Developer Availability</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/developers" />}>
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-0 divide-y divide-border p-0 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {data.developersAvailability.map((dev) => {
              const availability =
                dev.weeklyHours >= 40 ? 'Available' : 'Busy'
              return (
                <div key={dev.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30">
                  <AvatarInitials name={dev.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/developers/${dev.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {dev.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{dev.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{dev.weeklyHours}h</span>
                    <StatusBadge status={availability} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      {data.pendingUpdates.length > 0 && (
        <Card className="border-amber-200/60 bg-amber-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-amber-200/40 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-amber-600" />
              <CardTitle className="text-base">Pending EOD Updates</CardTitle>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/eod-updates" />}>
              Resolve
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-amber-200/30 p-0">
            {data.pendingUpdates.map((update) => (
              <div key={update.id} className="flex items-center gap-4 px-6 py-3.5">
                <AvatarInitials name={update.developer.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{update.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {update.developer.name} · {update.project.name}
                  </p>
                </div>
                <StatusBadge status={update.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
