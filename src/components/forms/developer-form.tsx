'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FormField, FormSection } from '@/components/form-field'
import { MultiSelect } from '@/components/multi-select'
import { StyledSelect } from '@/components/styled-select'
import { addDeveloper, updateDeveloper } from '@/app/(protected)/developers/actions'
import { DEVELOPER_ROLES, DEVELOPER_STATUSES } from '@/lib/constants'
import type { ActionResult } from '@/lib/action-result'

export type DeveloperFormData = {
  id?: string
  name: string
  role: string
  email: string
  weeklyHours: number
  status: string
  primarySkills: string | null
  secondarySkills: string | null
  weakAreas: string | null
  preferredWork: string | null
  currentProjects: string | null
  pastProjects: string | null
  notes: string | null
  password?: string
}

const emptyDeveloper: DeveloperFormData = {
  name: '',
  role: '',
  email: '',
  weeklyHours: 40,
  status: 'Active',
  primarySkills: '',
  secondarySkills: '',
  weakAreas: '',
  preferredWork: '',
  currentProjects: '',
  pastProjects: '',
  notes: '',
}

type Option = { id: string; name: string }

function splitList(value: string | null | undefined) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

type DeveloperFormProps = {
  developer?: DeveloperFormData
  skills: Option[]
  projects: Option[]
  onSuccess: () => void
  onCancel: () => void
}

export function DeveloperForm({ developer, skills, projects, onSuccess, onCancel }: DeveloperFormProps) {
  const isEdit = Boolean(developer?.id)
  const [pending, startTransition] = useTransition()
  const defaults = developer ?? emptyDeveloper

  const [primarySkills, setPrimarySkills] = useState(splitList(defaults.primarySkills))
  const [secondarySkills, setSecondarySkills] = useState(splitList(defaults.secondarySkills))
  const [currentProjects, setCurrentProjects] = useState(splitList(defaults.currentProjects))
  const [pastProjects, setPastProjects] = useState(splitList(defaults.pastProjects))

  const skillNames = skills.map((s) => s.name)
  const projectNames = projects.map((p) => p.name)

  const roleOptions = useMemo(() => {
    const roles = [...DEVELOPER_ROLES]
    if (defaults.role && !roles.includes(defaults.role as (typeof DEVELOPER_ROLES)[number])) {
      roles.unshift(defaults.role as (typeof DEVELOPER_ROLES)[number])
    }
    return roles
  }, [defaults.role])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)

    const role = String(fd.get('role') ?? '').trim()
    if (!role) {
      toast.error('Please select a role')
      return
    }
    if (primarySkills.length === 0) {
      toast.error('Please select at least one primary skill')
      return
    }

    const password = String(fd.get('password') ?? '')
    if (!isEdit && password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (isEdit && password && password.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    if (developer?.id) fd.set('id', developer.id)
    fd.set('primarySkills', primarySkills.join(', '))
    fd.set('secondarySkills', secondarySkills.join(', '))
    fd.set('currentProjects', currentProjects.join(', '))
    fd.set('pastProjects', pastProjects.join(', '))

    startTransition(async () => {
      let result: ActionResult | void
      if (isEdit) {
        result = await updateDeveloper(fd)
      } else {
        result = await addDeveloper(fd)
      }
      if (result && !result.success) {
        toast.error(result.error ?? 'Something went wrong')
        return
      }
      toast.success(result?.message ?? (isEdit ? 'Developer updated' : 'Developer added'))
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormSection title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" required>
            <Input id="name" name="name" required defaultValue={defaults.name} placeholder="John Doe" />
          </FormField>
          <FormField label="Role" htmlFor="role" required>
            <StyledSelect
              id="role"
              name="role"
              required
              defaultValue={defaults.role}
              options={roleOptions}
              placeholder="Select role"
              emptyOptionLabel="Select role"
            />
          </FormField>
          <FormField label="Weekly Hours" htmlFor="weeklyHours" required>
            <Input
              id="weeklyHours"
              name="weeklyHours"
              type="number"
              required
              defaultValue={defaults.weeklyHours}
              min={0}
              max={80}
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <StyledSelect
              id="status"
              name="status"
              defaultValue={defaults.status}
              options={[...DEVELOPER_STATUSES]}
            />
          </FormField>
          <FormField label="Preferred Work Type" htmlFor="preferredWork" className="sm:col-span-2">
            <Input
              id="preferredWork"
              name="preferredWork"
              defaultValue={defaults.preferredWork ?? ''}
              placeholder="Frontend, backend, mobile..."
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Account">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={defaults.email}
              placeholder="developer@company.com"
            />
          </FormField>
          <FormField
            label={isEdit ? 'New Password' : 'Password'}
            htmlFor="password"
            hint={isEdit ? 'Leave blank to keep the current password' : 'Minimum 8 characters'}
          >
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              defaultValue=""
              placeholder={isEdit ? 'Optional' : 'Temporary password'}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Skills">
        <FormField label="Primary Skills" htmlFor="primarySkills" required>
          <MultiSelect
            options={skillNames}
            value={primarySkills}
            onChange={setPrimarySkills}
            placeholder="Select primary skills"
          />
        </FormField>
        <FormField label="Secondary Skills" htmlFor="secondarySkills">
          <MultiSelect
            options={skillNames}
            value={secondarySkills}
            onChange={setSecondarySkills}
            placeholder="Select secondary skills"
          />
        </FormField>
        <FormField label="Weak / Learning Areas" htmlFor="weakAreas">
          <Textarea id="weakAreas" name="weakAreas" rows={2} defaultValue={defaults.weakAreas ?? ''} />
        </FormField>
      </FormSection>

      <FormSection title="Projects">
        <FormField label="Current Active Projects" htmlFor="currentProjects">
          <MultiSelect
            options={projectNames}
            value={currentProjects}
            onChange={setCurrentProjects}
            placeholder="Select current projects"
          />
        </FormField>
        <FormField label="Past Projects" htmlFor="pastProjects">
          <MultiSelect
            options={projectNames}
            value={pastProjects}
            onChange={setPastProjects}
            placeholder="Select past projects"
          />
        </FormField>
        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} defaultValue={defaults.notes ?? ''} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Add developer'}
        </Button>
      </div>
    </form>
  )
}
