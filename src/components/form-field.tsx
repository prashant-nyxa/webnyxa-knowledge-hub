import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormField({
  label,
  htmlFor,
  required,
  children,
  className,
  hint,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  hint?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
