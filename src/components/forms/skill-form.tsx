'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form-field'
import { StyledSelect } from '@/components/styled-select'
import { addSkill, updateSkill } from '@/app/(protected)/skills/actions'
import type { ActionResult } from '@/lib/action-result'

export type SkillFormData = {
  id?: string
  name: string
  category: string
  status: string
}

const skillCategories = ['Frontend', 'Backend', 'Mobile', 'CMS', 'Cloud', 'Database', 'QA', 'Design', 'Other']

type SkillFormProps = {
  skill?: SkillFormData
  onSuccess: () => void
  onCancel: () => void
}

export function SkillForm({ skill, onSuccess, onCancel }: SkillFormProps) {
  const isEdit = Boolean(skill?.id)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    if (skill?.id) fd.set('id', skill.id)

    startTransition(async () => {
      const result: ActionResult | void = isEdit ? await updateSkill(fd) : await addSkill(fd)
      if (result && !result.success) {
        toast.error(result.error ?? 'Something went wrong')
        return
      }
      toast.success(result?.message ?? (isEdit ? 'Skill updated' : 'Skill added'))
      onSuccess()
    })
  }

  const defaults = skill ?? { name: '', category: '', status: 'Active' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Skill Name" htmlFor="name" required>
        <Input id="name" name="name" required defaultValue={defaults.name} placeholder="React Native" />
      </FormField>
      <FormField label="Category" htmlFor="category" required>
        <StyledSelect
          id="category"
          name="category"
          required
          defaultValue={defaults.category}
          options={skillCategories}
          placeholder="Select category"
          emptyOptionLabel="Select category"
        />
      </FormField>
      {isEdit && (
        <FormField label="Status" htmlFor="status">
          <StyledSelect
            id="status"
            name="status"
            defaultValue={defaults.status}
            options={['Active', 'Inactive']}
          />
        </FormField>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Add skill'}
        </Button>
      </div>
    </form>
  )
}
