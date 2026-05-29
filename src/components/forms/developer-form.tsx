'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FormField, FormSection } from '@/components/form-field'
import { addDeveloper, updateDeveloper } from '@/app/(protected)/developers/actions'
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

type DeveloperFormProps = {
  developer?: DeveloperFormData
  onSuccess: () => void
  onCancel: () => void
}

export function DeveloperForm({ developer, onSuccess, onCancel }: DeveloperFormProps) {
  const isEdit = Boolean(developer?.id)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)
    if (developer?.id) fd.set('id', developer.id)

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

  const defaults = developer ?? emptyDeveloper

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" required>
            <Input id="name" name="name" required defaultValue={defaults.name} placeholder="John Doe" />
          </FormField>
          <FormField label="Role" htmlFor="role" required>
            <Input id="role" name="role" required defaultValue={defaults.role} placeholder="Fullstack Engineer" />
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
            <select
              id="status"
              name="status"
              defaultValue={defaults.status}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
              minLength={8}
              defaultValue=""
              placeholder={isEdit ? 'Optional' : 'Temporary password'}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Skills">
        <FormField label="Primary Skills" htmlFor="primarySkills" hint="Comma-separated">
          <Textarea
            id="primarySkills"
            name="primarySkills"
            rows={2}
            defaultValue={defaults.primarySkills ?? ''}
            placeholder="React, Next.js, Node.js"
          />
        </FormField>
        <FormField label="Secondary Skills" htmlFor="secondarySkills">
          <Textarea
            id="secondarySkills"
            name="secondarySkills"
            rows={2}
            defaultValue={defaults.secondarySkills ?? ''}
            placeholder="QA, AWS, WordPress"
          />
        </FormField>
        <FormField label="Weak / Learning Areas" htmlFor="weakAreas">
          <Textarea id="weakAreas" name="weakAreas" rows={2} defaultValue={defaults.weakAreas ?? ''} />
        </FormField>
      </FormSection>

      <FormSection title="Projects">
        <FormField label="Current Active Projects" htmlFor="currentProjects">
          <Textarea id="currentProjects" name="currentProjects" rows={2} defaultValue={defaults.currentProjects ?? ''} />
        </FormField>
        <FormField label="Past Projects" htmlFor="pastProjects">
          <Textarea id="pastProjects" name="pastProjects" rows={2} defaultValue={defaults.pastProjects ?? ''} />
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
