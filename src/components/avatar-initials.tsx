import { cn } from '@/lib/utils'

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AvatarInitials({
  name,
  className,
  size = 'md',
}: {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass =
    size === 'sm' ? 'size-8 text-xs' : size === 'lg' ? 'size-11 text-sm' : 'size-9 text-xs'

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-background',
        sizeClass,
        className
      )}
      aria-hidden
    >
      {getInitials(name) || '?'}
    </div>
  )
}
