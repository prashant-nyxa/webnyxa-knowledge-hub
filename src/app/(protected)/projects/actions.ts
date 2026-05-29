'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionError, actionSuccess, type ActionResult } from '@/lib/action-result'
import { requireAdmin } from '@/lib/auth'

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== 'string') return null
  return value ? new Date(value) : null
}

export async function addProject(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const name = formData.get('name') as string
  const client = formData.get('client') as string
  const type = formData.get('type') as string
  const status = formData.get('status') as string
  const techStack = formData.get('techStack') as string
  const developersInvolved = formData.get('developersInvolved') as string
  const developerRoles = formData.get('developerRoles') as string
  const mainFeatures = formData.get('mainFeatures') as string
  const challenges = formData.get('challenges') as string
  const startDate = parseOptionalDate(formData.get('startDate'))
  const endDate = parseOptionalDate(formData.get('endDate'))
  const summary = formData.get('summary') as string
  const notes = formData.get('notes') as string

  if (!name || !type) return actionError('Name and type are required')

  try {
    await prisma.project.create({
      data: {
        name,
        client,
        type,
        status: status || 'Active',
        techStack,
        developersInvolved,
        developerRoles,
        mainFeatures,
        challenges,
        startDate,
        endDate,
        summary,
        notes,
      },
    })
    revalidatePath('/projects')
    revalidatePath('/')
    return actionSuccess('Project added successfully')
  } catch {
    return actionError('Failed to add project')
  }
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const client = formData.get('client') as string
  const type = formData.get('type') as string
  const status = formData.get('status') as string
  const techStack = formData.get('techStack') as string
  const developersInvolved = formData.get('developersInvolved') as string
  const developerRoles = formData.get('developerRoles') as string
  const mainFeatures = formData.get('mainFeatures') as string
  const challenges = formData.get('challenges') as string
  const startDate = parseOptionalDate(formData.get('startDate'))
  const endDate = parseOptionalDate(formData.get('endDate'))
  const summary = formData.get('summary') as string
  const notes = formData.get('notes') as string

  if (!id || !name || !type) return actionError('Missing required fields')

  try {
    await prisma.project.update({
      where: { id },
      data: {
        name,
        client,
        type,
        status: status || 'Active',
        techStack,
        developersInvolved,
        developerRoles,
        mainFeatures,
        challenges,
        startDate,
        endDate,
        summary,
        notes,
      },
    })
    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    revalidatePath('/')
    return actionSuccess('Project updated successfully')
  } catch {
    return actionError('Failed to update project')
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin()
  if (!id) return actionError('Invalid project')

  try {
    await prisma.project.delete({ where: { id } })
    revalidatePath('/projects')
    revalidatePath('/')
    return actionSuccess('Project deleted')
  } catch {
    return actionError('Failed to delete project')
  }
}
