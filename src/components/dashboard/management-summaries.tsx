import Link from 'next/link'
import {
  Users,
  Briefcase,
  CalendarCheck,
  Code2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Forward,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badges'
import { CategoryBadge } from '@/components/status-badges'
import { AvatarInitials } from '@/components/avatar-initials'
import { KpiCard } from '@/components/dashboard/kpi-card'
import type { getManagementDashboardData } from '@/lib/dashboard-data'

type DashboardData = Awaited<ReturnType<typeof getManagementDashboardData>>

export function ManagementSummaries({ data }: { data: DashboardData }) {
  const { developerSummary, projectSummary, dailyWorkSummary, skillSummary } = data

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Developer Summary</h2>
          <p className="text-sm text-muted-foreground">Team capacity and blocker visibility</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total active developers" value={developerSummary.totalActive} icon={Users} />
          <KpiCard
            label="Available developers"
            value={developerSummary.available}
            icon={CheckCircle2}
            iconClassName="bg-emerald-500/10 text-emerald-600"
            trend="40+ hrs/week"
            trendUp
          />
          <KpiCard
            label="Busy developers"
            value={developerSummary.busy}
            icon={Clock}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
          <KpiCard
            label="Developers with blockers"
            value={developerSummary.withBlockers}
            icon={AlertTriangle}
            iconClassName="bg-red-500/10 text-red-600"
          />
        </div>
        {developerSummary.developersWithBlockersList.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex flex-wrap gap-2 p-4">
              {developerSummary.developersWithBlockersList.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  <AlertTriangle className="size-3" />
                  {name}
                </span>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Project Summary</h2>
          <p className="text-sm text-muted-foreground">Delivery status across the portfolio</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total active projects" value={projectSummary.totalActive} icon={Briefcase} />
          <KpiCard
            label="Completed projects"
            value={projectSummary.completed}
            icon={CheckCircle2}
            iconClassName="bg-blue-500/10 text-blue-600"
          />
          <KpiCard
            label="Projects with blockers"
            value={projectSummary.withBlockers}
            icon={AlertTriangle}
            iconClassName="bg-red-500/10 text-red-600"
          />
          <KpiCard
            label="Projects with pending work"
            value={projectSummary.withPending}
            icon={Clock}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daily Work Summary</h2>
            <p className="text-sm text-muted-foreground">Today&apos;s plans and EOD progress</p>
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/daily-plans" />}>
            Plans
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Planned tasks"
            value={dailyWorkSummary.planned}
            icon={CalendarCheck}
          />
          <KpiCard
            label="Completed"
            value={dailyWorkSummary.completed}
            icon={CheckCircle2}
            iconClassName="bg-emerald-500/10 text-emerald-600"
          />
          <KpiCard
            label="In progress"
            value={dailyWorkSummary.inProgress}
            icon={Clock}
            iconClassName="bg-indigo-500/10 text-indigo-600"
          />
          <KpiCard
            label="Blocked"
            value={dailyWorkSummary.blocked}
            icon={AlertTriangle}
            iconClassName="bg-red-500/10 text-red-600"
          />
          <KpiCard
            label="Carried forward"
            value={dailyWorkSummary.carriedForward}
            icon={Forward}
            iconClassName="bg-slate-500/10 text-slate-600"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">Today&apos;s planned tasks</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {dailyWorkSummary.plannedTasks.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No plans for today.</p>
              ) : (
                dailyWorkSummary.plannedTasks.map((plan) => (
                  <div key={plan.id} className="px-4 py-3">
                    <p className="text-sm font-medium">{plan.taskTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.developer.name} · {plan.project.name}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">Today&apos;s blocked tasks</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {dailyWorkSummary.blockedTasks.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No blocked tasks today.</p>
              ) : (
                dailyWorkSummary.blockedTasks.map((update) => (
                  <div key={update.id} className="flex items-center gap-3 px-4 py-3">
                    <AvatarInitials name={update.developer.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{update.taskTitle}</p>
                      <p className="text-xs text-muted-foreground">{update.project.name}</p>
                    </div>
                    <StatusBadge status={update.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Skill Summary</h2>
          <p className="text-sm text-muted-foreground">
            Technologies used by the team · {skillSummary.totalTechnologies} tracked
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 border-b pb-3">
              <Code2 className="size-4 text-primary" />
              <CardTitle className="text-base">Technologies & developers</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0 max-h-80 overflow-y-auto">
              {skillSummary.technologies.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No technology data yet.</p>
              ) : (
                skillSummary.technologies.map((skill) => (
                  <div key={skill.technology} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <CategoryBadge category={skill.technology} />
                      <span className="text-xs text-muted-foreground">{skill.count} dev(s)</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{skill.developers.join(', ')}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="border-emerald-200/60 shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">Strong coverage (2+ developers)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-4">
                {skillSummary.strongSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shared skills yet.</p>
                ) : (
                  skillSummary.strongSkills.map((skill) => (
                    <span
                      key={skill.technology}
                      className="inline-flex flex-col rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-emerald-900">{skill.technology}</span>
                      <span className="text-emerald-700">{skill.count} developers</span>
                    </span>
                  ))
                )}
              </CardContent>
            </Card>
            <Card className="border-amber-200/60 shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">Limited strength (1 developer)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-4">
                {skillSummary.limitedSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No single-coverage skills.</p>
                ) : (
                  skillSummary.limitedSkills.map((skill) => (
                    <span
                      key={skill.technology}
                      className="inline-flex flex-col rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-amber-900">{skill.technology}</span>
                      <span className="text-amber-700">{skill.developers[0]}</span>
                    </span>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
