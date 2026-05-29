'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FormField, FormSection } from '@/components/form-field'
import { addProject, updateProject } from '@/app/(protected)/projects/actions'
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

const projectTypes = [
  'Website',
  'Mobile App',
  'Admin Panel',
  'Backend',
  'Shopify',
  'WordPress',
  'CMS',
  'Maintenance',
  'Other',
]

const selectClass =
  'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

type ProjectFormProps = {
  project?: ProjectFormData
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const isEdit = Boolean(project?.id)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    if (project?.id) fd.set('id', project.id)

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

  const defaults = project ?? {
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
            <select id="type" name="type" required defaultValue={defaults.type} className={selectClass}>
              <option value="">Select type</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={defaults.status} className={selectClass}>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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
        <FormField label="Tech Stack" htmlFor="techStack" hint="Comma-separated">
          <Textarea
            id="techStack"
            name="techStack"
            rows={2}
            defaultValue={defaults.techStack ?? ''}
            placeholder="Next.js, PostgreSQL"
          />
        </FormField>
        <FormField label="Developers Involved" htmlFor="developersInvolved">
          <Textarea id="developersInvolved" name="developersInvolved" rows={2} defaultValue={defaults.developersInvolved ?? ''} />
        </FormField>
        <FormField label="Developer Roles" htmlFor="developerRoles">
          <Textarea id="developerRoles" name="developerRoles" rows={2} defaultValue={defaults.developerRoles ?? ''} />
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Add project'}
        </Button>
      </div>
    </form>
  )
}
