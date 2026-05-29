import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Busy: 'bg-amber-50 text-amber-700 border-amber-200',
  Blocked: 'bg-red-50 text-red-700 border-red-200',
  'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', statusStyles[status] ?? 'bg-muted text-muted-foreground', className)}
    >
      {status}
    </Badge>
  )
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('font-normal', className)}>
      {role}
    </Badge>
  )
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('bg-primary/5 text-primary border-primary/20', className)}>
      {category}
    </Badge>
  )
}

export function projectProgress(status: string) {
  switch (status) {
    case 'Completed':
      return 100
    case 'Active':
      return 65
    case 'On Hold':
      return 40
    case 'Cancelled':
      return 0
    default:
      return 30
  }
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
