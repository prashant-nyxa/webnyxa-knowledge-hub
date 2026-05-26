'use client'

import { Loader2, type LucideIcon } from 'lucide-react'
import { useFormStatus } from 'react-dom'

type PendingSubmitButtonProps = {
  label: string
  pendingLabel?: string
  className: string
  icon?: LucideIcon
}

export function PendingSubmitButton({
  label,
  pendingLabel,
  className,
  icon: Icon,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={className}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon ? <Icon className="h-4 w-4" /> : null
      )}
      {pending ? (pendingLabel ?? `${label}...`) : label}
    </button>
  )
}
