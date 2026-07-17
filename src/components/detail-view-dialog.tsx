'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DetailField = {
  label: string
  value: string | number | null | undefined
}

type DetailViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: DetailField[]
}

export function DetailViewDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
}: DetailViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,900px)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {field.value != null && String(field.value).trim() !== '' ? field.value : '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  )
}
