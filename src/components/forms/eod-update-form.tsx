'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addEodUpdate, updateEodUpdate } from '@/app/(protected)/eod-updates/actions'
import { FormField, FormSection } from '@/components/form-field'
import { MultiSelect } from '@/components/multi-select'
import { StyledSelect } from '@/components/styled-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EOD_STATUSES, WORK_TYPES } from '@/lib/constants'

type Option = { id: string; name: string }
type PlanOption = { id: string; label: string }

export type EodUpdateFormData = {
  id?: string
  date: string
  developerId: string
  developerName: string
  projectId: string
  dailyPlanId: string | null
  taskTitle: string
  workType: string
  technologies: string
  status: string
  actualEffort: number
  workCompleted: string | null
  workPending: string | null
  blocker: string | null
  summary: string | null
}

const workTypes = [...WORK_TYPES]
const statuses = [...EOD_STATUSES]

function splitList(value: string | null | undefined) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

type EodUpdateFormProps = {
  update?: EodUpdateFormData
  developers: Option[]
  projects: Option[]
  plans: PlanOption[]
  skills: Option[]
  canManageAll: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function EodUpdateForm({
  update,
  developers,
  projects,
  plans,
  skills,
  canManageAll,
  onSuccess,
  onCancel,
}: EodUpdateFormProps) {
  const isEdit = Boolean(update?.id)
  const [pending, startTransition] = useTransition()
  const currentDeveloper = update ?? {
    developerId: developers[0]?.id ?? '',
    developerName: developers[0]?.name ?? 'Unassigned developer',
  }

  const defaults = update ?? {
    date: new Date().toISOString().slice(0, 10),
    developerId: developers[0]?.id ?? '',
    developerName: developers[0]?.name ?? 'Unassigned developer',
    projectId: '',
    dailyPlanId: '',
    taskTitle: '',
    workType: 'Development',
    technologies: '',
    status: 'Done',
    actualEffort: 1,
    workCompleted: '',
    workPending: '',
    blocker: '',
    summary: '',
  }

  const [technologies, setTechnologies] = useState(splitList(defaults.technologies))

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    if (update?.id) fd.set('id', update.id)
    fd.set('technologies', technologies.join(', '))

    startTransition(async () => {
      if (isEdit) {
        await updateEodUpdate(fd)
      } else {
        await addEodUpdate(fd)
      }
      toast.success(isEdit ? 'EOD update saved' : 'EOD update added')
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Update Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" htmlFor="date" required>
            <Input id="date" name="date" type="date" required defaultValue={defaults.date} />
          </FormField>
          <FormField label="Daily Plan Link" htmlFor="dailyPlanId">
            <StyledSelect
              id="dailyPlanId"
              name="dailyPlanId"
              defaultValue={defaults.dailyPlanId ?? ''}
              options={plans.map((plan) => ({ value: plan.id, label: plan.label }))}
              emptyOptionLabel="No Plan (Unplanned Task)"
            />
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
          <FormField label="Project" htmlFor="projectId" required>
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
            <Input
              id="taskTitle"
              name="taskTitle"
              required
              defaultValue={defaults.taskTitle}
              placeholder="Fix API validation bug"
            />
          </FormField>
          <FormField label="Work Type" htmlFor="workType" required>
            <StyledSelect
              id="workType"
              name="workType"
              required
              defaultValue={defaults.workType}
              options={workTypes}
            />
          </FormField>
          <FormField label="Status" htmlFor="status" required>
            <StyledSelect
              id="status"
              name="status"
              required
              defaultValue={defaults.status}
              options={statuses}
            />
          </FormField>
          <FormField label="Technologies Used" htmlFor="technologies" required>
            <MultiSelect
              options={skills.map((s) => s.name)}
              value={technologies}
              onChange={setTechnologies}
              placeholder="Select technologies"
              required
            />
          </FormField>
          <FormField label="Actual Effort (hours)" htmlFor="actualEffort" required>
            <Input
              id="actualEffort"
              name="actualEffort"
              type="number"
              step="0.5"
              min={0}
              required
              defaultValue={defaults.actualEffort}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Outcome">
        <FormField label="Work Completed" htmlFor="workCompleted">
          <Textarea id="workCompleted" name="workCompleted" rows={3} defaultValue={defaults.workCompleted ?? ''} />
        </FormField>
        <FormField label="Work Pending" htmlFor="workPending">
          <Textarea id="workPending" name="workPending" rows={3} defaultValue={defaults.workPending ?? ''} />
        </FormField>
        <FormField label="Blocker" htmlFor="blocker">
          <Textarea id="blocker" name="blocker" rows={2} defaultValue={defaults.blocker ?? ''} />
        </FormField>
        <FormField label="Short Summary" htmlFor="summary">
          <Textarea id="summary" name="summary" rows={3} defaultValue={defaults.summary ?? ''} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Add EOD update'}
        </Button>
      </div>
    </form>
  )
}
