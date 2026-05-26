'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function parseUpdateDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== 'string') return new Date()
  return value ? new Date(value) : new Date()
}

export async function addEodUpdate(formData: FormData) {
  const date = parseUpdateDate(formData.get('date'))
  const dailyPlanId = formData.get('dailyPlanId') as string
  const developerId = formData.get('developerId') as string
  const projectId = formData.get('projectId') as string
  const taskTitle = formData.get('taskTitle') as string
  const workType = formData.get('workType') as string
  const technologies = formData.get('technologies') as string
  const status = formData.get('status') as string
  const actualEffort = parseFloat(formData.get('actualEffort') as string)
  const workCompleted = formData.get('workCompleted') as string
  const workPending = formData.get('workPending') as string
  const blocker = formData.get('blocker') as string
  const summary = formData.get('summary') as string

  if (!developerId || !projectId || !taskTitle || isNaN(actualEffort) || !status) return

  await prisma.dailyUpdate.create({
    data: {
      dailyPlanId: dailyPlanId || null,
      date,
      developerId,
      projectId,
      taskTitle,
      workType,
      technologies,
      status,
      actualEffort,
      workCompleted,
      workPending,
      blocker,
      summary
    }
  })

  revalidatePath('/eod-updates')
  revalidatePath('/reports/plan-vs-actual')
}

export async function updateEodUpdate(formData: FormData) {
  const id = formData.get('id') as string
  const date = parseUpdateDate(formData.get('date'))
  const dailyPlanId = formData.get('dailyPlanId') as string
  const developerId = formData.get('developerId') as string
  const projectId = formData.get('projectId') as string
  const taskTitle = formData.get('taskTitle') as string
  const workType = formData.get('workType') as string
  const technologies = formData.get('technologies') as string
  const status = formData.get('status') as string
  const actualEffort = parseFloat(formData.get('actualEffort') as string)
  const workCompleted = formData.get('workCompleted') as string
  const workPending = formData.get('workPending') as string
  const blocker = formData.get('blocker') as string
  const summary = formData.get('summary') as string

  if (!id || !developerId || !projectId || !taskTitle || isNaN(actualEffort) || !status) return

  await prisma.dailyUpdate.update({
    where: { id },
    data: {
      dailyPlanId: dailyPlanId || null,
      date,
      developerId,
      projectId,
      taskTitle,
      workType,
      technologies,
      status,
      actualEffort,
      workCompleted,
      workPending,
      blocker,
      summary
    }
  })

  revalidatePath('/eod-updates')
  revalidatePath('/reports/plan-vs-actual')
}

export async function deleteEodUpdate(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return

  await prisma.dailyUpdate.delete({ where: { id } })

  revalidatePath('/eod-updates')
  revalidatePath('/reports/plan-vs-actual')
}
