'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StyledSelect } from '@/components/styled-select'
import { dropdownCheckboxClass, dropdownOptionClass, dropdownPanelClass, dropdownTriggerClass } from '@/components/styled-select'

type MultiSelectProps = {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  name?: string
  required?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  name,
  required,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const mergedOptions = [...new Set([...options, ...value])].sort((a, b) => a.localeCompare(b))

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

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])
  }

  const dropdown =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} aria-hidden />
        <div
          className={dropdownPanelClass}
          style={{ top: position.top, left: position.left, width: position.width }}
        >
          {mergedOptions.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">No options available</p>
          ) : (
            mergedOptions.map((option) => {
              const selected = value.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={dropdownOptionClass(selected)}
                >
                  <span className={dropdownCheckboxClass(selected)}>
                    {selected && <Check className="size-3" />}
                  </span>
                  <span className="truncate">{option}</span>
                </button>
              )
            })
          )}
        </div>
      </>,
      document.body
    )

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={value.join(', ')} required={required && value.length === 0} />}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(dropdownTriggerClass, 'text-muted-foreground')}
      >
        <span className="truncate text-left">{placeholder}</span>
        <ChevronDown className={cn('size-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
      {dropdown}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="rounded-full text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

type DeveloperRoleEntry = { developerId: string; developerName: string; role: string }

const DEV_ROLES = ['Lead', 'Developer', 'Reviewer', 'Consultant', 'QA']

export function DeveloperRoleSelector({
  developers,
  value,
  onChange,
}: {
  developers: Array<{ id: string; name: string }>
  value: DeveloperRoleEntry[]
  onChange: (value: DeveloperRoleEntry[]) => void
}) {
  const selectedIds = value.map((v) => v.developerId)

  function toggleDeveloper(developerId: string) {
    if (selectedIds.includes(developerId)) {
      onChange(value.filter((v) => v.developerId !== developerId))
    } else {
      const dev = developers.find((d) => d.id === developerId)
      if (dev) {
        onChange([...value, { developerId, developerName: dev.name, role: 'Developer' }])
      }
    }
  }

  function updateRole(developerId: string, role: string) {
    onChange(value.map((v) => (v.developerId === developerId ? { ...v, role } : v)))
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="developersInvolved" value={value.map((v) => v.developerName).join(', ')} />
      <input
        type="hidden"
        name="developerRoles"
        value={JSON.stringify(value.map((v) => ({ name: v.developerName, role: v.role })))}
      />
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/80 bg-white p-2 shadow-sm">
        {developers.map((dev) => {
          const selected = selectedIds.includes(dev.id)
          const entry = value.find((v) => v.developerId === dev.id)
          return (
            <div
              key={dev.id}
              className="flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleDeveloper(dev.id)}
                className="size-4 rounded border-slate-300"
              />
              <span className="min-w-0 flex-1 text-sm">{dev.name}</span>
              {selected && (
                <StyledSelect
                  options={DEV_ROLES}
                  value={entry?.role ?? 'Developer'}
                  onChange={(role) => updateRole(dev.id, role)}
                  placeholder="Role"
                  className="w-36"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function parseDeveloperRoles(
  developersInvolved: string | null,
  developerRoles: string | null,
  allDevelopers: Array<{ id: string; name: string }>
): DeveloperRoleEntry[] {
  const names = (developersInvolved ?? '').split(',').map((n) => n.trim()).filter(Boolean)
  let rolesMap: Record<string, string> = {}
  try {
    if (developerRoles?.startsWith('[')) {
      const parsed = JSON.parse(developerRoles) as Array<{ name: string; role: string }>
      rolesMap = Object.fromEntries(parsed.map((r) => [r.name, r.role]))
    }
  } catch {
    // legacy text format
  }
  return names.map((name) => {
    const dev = allDevelopers.find((d) => d.name === name)
    return {
      developerId: dev?.id ?? name,
      developerName: name,
      role: rolesMap[name] ?? 'Developer',
    }
  })
}
