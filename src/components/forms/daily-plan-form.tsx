'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addDailyPlan, updateDailyPlan } from '@/app/(protected)/daily-plans/actions'
import { FormField, FormSection } from '@/components/form-field'
import { MultiSelect } from '@/components/multi-select'
import { StyledSelect } from '@/components/styled-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { WORK_TYPES, PRIORITIES } from '@/lib/constants'

type Option = { id: string; name: string }

export type DailyPlanFormData = {
  id?: string
  date: string
  developerId: string
  developerName: string
  projectId: string
  taskTitle: string
  workType: string
  technologies: string
  expectedEffort: number
  priority: string
  dependency: string | null
  notes: string | null
}

type DailyPlanFormProps = {
  plan?: DailyPlanFormData
  developers: Option[]
  projects: Option[]
  skills: Option[]
  canManageAll: boolean
  onSuccess: () => void
  onCancel: () => void
}

function splitList(value: string | null | undefined) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

export function DailyPlanForm({
  plan,
  developers,
  projects,
  skills,
  canManageAll,
  onSuccess,
  onCancel,
}: DailyPlanFormProps) {
  const isEdit = Boolean(plan?.id)
  const [pending, startTransition] = useTransition()
  const currentDeveloper = plan ?? {
    developerId: developers[0]?.id ?? '',
    developerName: developers[0]?.name ?? 'Unassigned developer',
  }

  const defaults = plan ?? {
    date: new Date().toISOString().slice(0, 10),
    developerId: developers[0]?.id ?? '',
    developerName: developers[0]?.name ?? 'Unassigned developer',
    projectId: '',
    taskTitle: '',
    workType: 'Development',
    technologies: '',
    expectedEffort: 1,
    priority: 'Medium',
    dependency: '',
    notes: '',
  }

  const [technologies, setTechnologies] = useState(splitList(defaults.technologies))

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    if (plan?.id) fd.set('id', plan.id)
    fd.set('technologies', technologies.join(', '))

    startTransition(async () => {
      if (isEdit) {
        await updateDailyPlan(fd)
      } else {
        await addDailyPlan(fd)
      }
      toast.success(isEdit ? 'Daily plan updated' : 'Daily plan added')
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Plan Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" htmlFor="date" required>
            <Input id="date" name="date" type="date" required defaultValue={defaults.date} />
          </FormField>
          <FormField label="Developer" htmlFor="developerId" required>
            {canManageAll ? (
              <StyledSelect
                id="developerId"
                name="developerId"
                required
                defaultValue={defaults.developerId}
                options={developers.map((developer) => ({ value: developer.id, label: developer.name }))}
                placeholder="Select developer"
                emptyOptionLabel="Select developer"
              />
            ) : (
              <>
                <input type="hidden" name="developerId" value={currentDeveloper.developerId} />
                <Input value={currentDeveloper.developerName} disabled />
              </>
            )}
          </FormField>
          <FormField label="Project" htmlFor="projectId" required className="sm:col-span-2">
            <StyledSelect
              id="projectId"
              name="projectId"
              required
              defaultValue={defaults.projectId}
              options={projects.map((project) => ({ value: project.id, label: project.name }))}
              placeholder="Select project"
              emptyOptionLabel="Select project"
            />
          </FormField>
          <FormField label="Task Title" htmlFor="taskTitle" required className="sm:col-span-2">
            <Input id="taskTitle" name="taskTitle" required defaultValue={defaults.taskTitle} placeholder="Implement dashboard filters" />
          </FormField>
          <FormField label="Type of Work" htmlFor="workType" required>
            <StyledSelect
              id="workType"
              name="workType"
              required
              defaultValue={defaults.workType}
              options={[...WORK_TYPES]}
            />
          </FormField>
          <FormField label="Expected Effort (hours)" htmlFor="expectedEffort" required>
            <Input id="expectedEffort" name="expectedEffort" type="number" step="0.5" min={0} required defaultValue={defaults.expectedEffort} />
          </FormField>
          <FormField label="Priority" htmlFor="priority" required>
            <StyledSelect
              id="priority"
              name="priority"
              required
              defaultValue={defaults.priority}
              options={[...PRIORITIES]}
            />
          </FormField>
          <FormField label="Technologies" htmlFor="technologies" required>
            <MultiSelect
              options={skills.map((s) => s.name)}
              value={technologies}
              onChange={setTechnologies}
              placeholder="Select technologies"
              required
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Context">
        <FormField label="Dependency / Blocker" htmlFor="dependency">
          <Input id="dependency" name="dependency" defaultValue={defaults.dependency ?? ''} />
        </FormField>
        <FormField label="Short Note" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} defaultValue={defaults.notes ?? ''} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Add daily plan'}
        </Button>
      </div>
    </form>
  )
}
