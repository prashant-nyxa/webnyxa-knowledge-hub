import { type LucideIcon, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: number | string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  iconClassName?: string
}

export function KpiCard({ label, value, icon: Icon, trend, trendUp, iconClassName }: KpiCardProps) {
  return (
    <Card className="card-hover border-border/60 shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 pt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trendUp ? 'text-emerald-600' : 'text-muted-foreground'
              )}
            >
              {trendUp && <TrendingUp className="size-3" />}
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary',
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
