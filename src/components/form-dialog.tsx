'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'default' | 'lg' | 'xl'
}

const sizeClasses = {
  default: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'xl',
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[calc(100%-2rem)]',
          sizeClasses[size]
        )}
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
