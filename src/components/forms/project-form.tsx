'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FormField, FormSection } from '@/components/form-field'
import { DeveloperRoleSelector, MultiSelect, parseDeveloperRoles } from '@/components/multi-select'
import { StyledSelect } from '@/components/styled-select'
import { addProject, updateProject } from '@/app/(protected)/projects/actions'
import { PROJECT_STATUSES, PROJECT_TYPES } from '@/lib/constants'
import type { ActionResult } from '@/lib/action-result'

export type ProjectFormData = {
  id?: string
  name: string
  client: string | null
  type: string
  status: string
  techStack: string | null
  developersInvolved: string | null
  developerRoles: string | null
  mainFeatures: string | null
  challenges: string | null
  startDate: string | null
  endDate: string | null
  summary: string | null
  notes: string | null
}

const emptyProject: ProjectFormData = {
  name: '',
  client: '',
  type: '',
  status: 'Active',
  techStack: '',
  developersInvolved: '',
  developerRoles: '',
  mainFeatures: '',
  challenges: '',
  startDate: '',
  endDate: '',
  summary: '',
  notes: '',
}

type Option = { id: string; name: string }

function splitList(value: string | null | undefined) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

type ProjectFormProps = {
  project?: ProjectFormData
  skills: Option[]
  developers: Option[]
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectForm({ project, skills, developers, onSuccess, onCancel }: ProjectFormProps) {
  const isEdit = Boolean(project?.id)
  const [pending, startTransition] = useTransition()
  const defaults = project ?? emptyProject

  const [techStack, setTechStack] = useState(splitList(defaults.techStack))
  const [developerEntries, setDeveloperEntries] = useState(() =>
    parseDeveloperRoles(defaults.developersInvolved, defaults.developerRoles, developers)
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    if (project?.id) fd.set('id', project.id)
    fd.set('techStack', techStack.join(', '))
    fd.set('developersInvolved', developerEntries.map((d) => d.developerName).join(', '))
    fd.set(
      'developerRoles',
      JSON.stringify(developerEntries.map((d) => ({ name: d.developerName, role: d.role })))
    )

    startTransition(async () => {
      const result: ActionResult | void = isEdit ? await updateProject(fd) : await addProject(fd)
      if (result && !result.success) {
        toast.error(result.error ?? 'Something went wrong')
        return
      }
      toast.success(result?.message ?? (isEdit ? 'Project updated' : 'Project added'))
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Overview">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Project Name" htmlFor="name" required className="sm:col-span-2">
            <Input id="name" name="name" required defaultValue={defaults.name} placeholder="Acme Website" />
          </FormField>
          <FormField label="Client" htmlFor="client">
            <Input id="client" name="client" defaultValue={defaults.client ?? ''} placeholder="Acme Corp" />
          </FormField>
          <FormField label="Type" htmlFor="type" required>
            <StyledSelect
              id="type"
              name="type"
              required
              defaultValue={defaults.type}
              options={[...PROJECT_TYPES]}
              placeholder="Select type"
              emptyOptionLabel="Select type"
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <StyledSelect
              id="status"
              name="status"
              defaultValue={defaults.status}
              options={[...PROJECT_STATUSES]}
            />
          </FormField>
          <FormField label="Start Date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={defaults.startDate ?? ''} />
          </FormField>
          <FormField label="End Date" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="date" defaultValue={defaults.endDate ?? ''} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Team & Tech">
        <FormField label="Tech Stack" htmlFor="techStack">
          <MultiSelect
            options={skills.map((s) => s.name)}
            value={techStack}
            onChange={setTechStack}
            placeholder="Select technologies"
          />
        </FormField>
        <FormField label="Developers Involved & Roles" htmlFor="developersInvolved">
          <DeveloperRoleSelector
            developers={developers}
            value={developerEntries}
            onChange={setDeveloperEntries}
          />
        </FormField>
      </FormSection>

      <FormSection title="Details">
        <FormField label="Main Features" htmlFor="mainFeatures">
          <Textarea id="mainFeatures" name="mainFeatures" rows={3} defaultValue={defaults.mainFeatures ?? ''} />
        </FormField>
        <FormField label="Challenges" htmlFor="challenges">
          <Textarea id="challenges" name="challenges" rows={3} defaultValue={defaults.challenges ?? ''} />
        </FormField>
        <FormField label="Summary" htmlFor="summary">
          <Textarea id="summary" name="summary" rows={3} defaultValue={defaults.summary ?? ''} />
        </FormField>
        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} defaultValue={defaults.notes ?? ''} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Add project'}
        </Button>
      </div>
    </form>
  )
}
