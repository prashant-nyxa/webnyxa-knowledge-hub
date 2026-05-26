'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== 'string') return null
  return value ? new Date(value) : null
}

export async function addProject(formData: FormData) {
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

  if (!name || !type) return

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
      notes
    }
  })

  revalidatePath('/projects')
}

export async function updateProject(formData: FormData) {
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

  if (!id || !name || !type) return

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
      notes
    }
  })

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
}

export async function deleteProject(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return

  await prisma.project.delete({ where: { id } })

  revalidatePath('/projects')
}
