'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionError, actionSuccess, type ActionResult } from '@/lib/action-result'
import { requireAdmin } from '@/lib/auth'

export async function addSkill(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const name = formData.get('name') as string
  const category = formData.get('category') as string

  if (!name || !category) return actionError('Name and category are required')

  try {
    await prisma.skill.create({
      data: { name, category, status: 'Active' },
    })
    revalidatePath('/skills')
    return actionSuccess('Skill added successfully')
  } catch {
    return actionError('Failed to add skill. It may already exist.')
  }
}

export async function updateSkill(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const status = formData.get('status') as string

  if (!id || !name || !category) return actionError('Missing required fields')

  try {
    await prisma.skill.update({
      where: { id },
      data: { name, category, status: status || 'Active' },
    })
    revalidatePath('/skills')
    return actionSuccess('Skill updated successfully')
  } catch {
    return actionError('Failed to update skill')
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin()
  if (!id) return actionError('Invalid skill')

  try {
    await prisma.skill.delete({ where: { id } })
    revalidatePath('/skills')
    return actionSuccess('Skill deleted')
  } catch {
    return actionError('Failed to delete skill')
  }
}
