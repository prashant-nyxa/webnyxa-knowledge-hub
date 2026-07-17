'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dropdownPanelClass =
  'fixed z-[201] max-h-60 overflow-y-auto rounded-lg border border-border/80 bg-white p-1.5 shadow-lg ring-1 ring-black/5'

export const dropdownOptionClass = (selected: boolean) =>
  cn(
    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-slate-50',
    selected && 'bg-primary/5 font-medium'
  )

export const dropdownCheckboxClass = (selected: boolean) =>
  cn(
    'flex size-4 shrink-0 items-center justify-center rounded border',
    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-300 bg-white'
  )

export const dropdownTriggerClass =
  'flex h-9 w-full items-center justify-between rounded-lg border border-input bg-white px-3 text-sm shadow-sm transition-colors hover:bg-slate-50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'

export type SelectOption = string | { value: string; label: string }

function normalizeOptions(options: SelectOption[]): { value: string; label: string }[] {
  const seen = new Set<string>()
  const normalized: { value: string; label: string }[] = []

  for (const option of options) {
    const entry = typeof option === 'string' ? { value: option, label: option } : option
    if (!entry.value || seen.has(entry.value)) continue
    seen.add(entry.value)
    normalized.push(entry)
  }

  return normalized
}

type StyledSelectProps = {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  emptyOptionLabel?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function StyledSelect({
  id,
  name,
  value,
  defaultValue = '',
  onChange,
  options,
  placeholder = 'Select...',
  emptyOptionLabel,
  required,
  disabled,
  className,
}: StyledSelectProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selected = isControlled ? value : internalValue
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  const normalizedOptions = normalizeOptions(options)

  const displayOptions = emptyOptionLabel
    ? [{ value: '', label: emptyOptionLabel }, ...normalizedOptions]
    : [{ value: '', label: placeholder }, ...normalizedOptions]

  const selectedLabel =
    displayOptions.find((o) => o.value === selected)?.label ||
    (selected ? selected : placeholder)

  useEffect(() => {
    if (!open || !triggerRef.current) return

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  function selectOption(next: string) {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
    setOpen(false)
  }

  const dropdown =
    open &&
    !disabled &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} aria-hidden />
        <div
          className={dropdownPanelClass}
          style={{ top: position.top, left: position.left, width: position.width }}
          role="listbox"
        >
          {displayOptions.length <= 1 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">No options available</p>
          ) : (
            displayOptions.map((option, index) => {
              const isSelected = selected === option.value
              return (
                <button
                  key={`${option.value || '__empty__'}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectOption(option.value)}
                  className={dropdownOptionClass(isSelected)}
                >
                  <span className={dropdownCheckboxClass(isSelected)}>
                    {isSelected && <Check className="size-3" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })
          )}
        </div>
      </>,
      document.body
    )

  return (
    <div className={className}>
      {name && <input type="hidden" name={name} value={selected} required={required && !selected} />}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(dropdownTriggerClass, !selected && 'text-muted-foreground')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selected ? selectedLabel : placeholder}</span>
        <ChevronDown className={cn('size-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
      {dropdown}
    </div>
  )
}
