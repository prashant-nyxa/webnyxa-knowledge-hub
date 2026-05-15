'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addDailyPlan(formData: FormData) {
  const developerId = formData.get('developerId') as string
  const projectId = formData.get('projectId') as string
  const taskTitle = formData.get('taskTitle') as string
  const workType = formData.get('workType') as string
  const technologies = formData.get('technologies') as string
  const expectedEffort = parseFloat(formData.get('expectedEffort') as string)
  const priority = formData.get('priority') as string
  const dependency = formData.get('dependency') as string
  const notes = formData.get('notes') as string

  if (!developerId || !projectId || !taskTitle || !expectedEffort) return

  await prisma.dailyPlan.create({
    data: {
      developerId,
      projectId,
      taskTitle,
      workType,
      technologies,
      expectedEffort,
      priority,
      dependency,
      notes
    }
  })

  revalidatePath('/daily-plans')
}

export async function updateDailyPlan(formData: FormData) {
  const id = formData.get('id') as string
  const developerId = formData.get('developerId') as string
  const projectId = formData.get('projectId') as string
  const taskTitle = formData.get('taskTitle') as string
  const workType = formData.get('workType') as string
  const technologies = formData.get('technologies') as string
  const expectedEffort = parseFloat(formData.get('expectedEffort') as string)
  const priority = formData.get('priority') as string
  const dependency = formData.get('dependency') as string
  const notes = formData.get('notes') as string

  if (!id || !developerId || !projectId || !taskTitle || isNaN(expectedEffort)) return

  await prisma.dailyPlan.update({
    where: { id },
    data: {
      developerId,
      projectId,
      taskTitle,
      workType,
      technologies,
      expectedEffort,
      priority,
      dependency,
      notes
    }
  })

  revalidatePath('/daily-plans')
  revalidatePath('/reports/plan-vs-actual')
}

export async function deleteDailyPlan(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return

  await prisma.dailyPlan.delete({ where: { id } })

  revalidatePath('/daily-plans')
  revalidatePath('/reports/plan-vs-actual')
}
