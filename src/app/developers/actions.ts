'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addDeveloper(formData: FormData) {
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const weeklyHours = parseInt(formData.get('weeklyHours') as string)
  const status = formData.get('status') as string

  if (!name || !role) return

  await prisma.developer.create({
    data: {
      name,
      role,
      weeklyHours: isNaN(weeklyHours) ? 40 : weeklyHours,
      status: status || 'Active'
    }
  })

  revalidatePath('/developers')
}

export async function updateDeveloper(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const weeklyHours = parseInt(formData.get('weeklyHours') as string)
  const status = formData.get('status') as string

  if (!id || !name || !role) return

  await prisma.developer.update({
    where: { id },
    data: {
      name,
      role,
      weeklyHours: isNaN(weeklyHours) ? 40 : weeklyHours,
      status: status || 'Active'
    }
  })

  revalidatePath('/developers')
  revalidatePath(`/developers/${id}`)
}

export async function deleteDeveloper(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return

  await prisma.developer.delete({ where: { id } })

  revalidatePath('/developers')
}
