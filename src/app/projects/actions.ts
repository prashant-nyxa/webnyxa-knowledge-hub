'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addProject(formData: FormData) {
  const name = formData.get('name') as string
  const client = formData.get('client') as string
  const type = formData.get('type') as string
  const status = formData.get('status') as string
  const summary = formData.get('summary') as string

  if (!name || !type) return

  await prisma.project.create({
    data: {
      name,
      client,
      type,
      status: status || 'Active',
      summary
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
  const summary = formData.get('summary') as string

  if (!id || !name || !type) return

  await prisma.project.update({
    where: { id },
    data: {
      name,
      client,
      type,
      status: status || 'Active',
      summary
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
