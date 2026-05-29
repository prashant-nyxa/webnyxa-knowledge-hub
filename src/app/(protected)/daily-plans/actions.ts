'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { assertCanManageDeveloperData, requireUser } from '@/lib/auth'

function parsePlanDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== 'string') return new Date()
  return value ? new Date(value) : new Date()
}

export async function addDailyPlan(formData: FormData) {
  const session = await requireUser()
  const date = parsePlanDate(formData.get('date'))
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
  assertCanManageDeveloperData(session, developerId)

  await prisma.dailyPlan.create({
    data: {
      developerId,
      date,
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
  const session = await requireUser()
  const id = formData.get('id') as string
  const date = parsePlanDate(formData.get('date'))
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
  assertCanManageDeveloperData(session, developerId)

  if (session.role !== 'admin') {
    const existing = await prisma.dailyPlan.findUnique({
      where: { id },
      select: { developerId: true },
    })
    if (!existing) return
    assertCanManageDeveloperData(session, existing.developerId)
  }

  await prisma.dailyPlan.update({
    where: { id },
    data: {
      developerId,
      date,
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
  const session = await requireUser()
  const id = formData.get('id') as string

  if (!id) return

  if (session.role !== 'admin') {
    const existing = await prisma.dailyPlan.findUnique({
      where: { id },
      select: { developerId: true },
    })
    if (!existing) return
    assertCanManageDeveloperData(session, existing.developerId)
  }

  await prisma.dailyPlan.delete({ where: { id } })

  revalidatePath('/daily-plans')
  revalidatePath('/reports/plan-vs-actual')
}
