'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addSkill(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string

  if (!name || !category) return

  await prisma.skill.create({
    data: {
      name,
      category,
      status: 'Active'
    }
  })

  revalidatePath('/skills')
}

export async function updateSkill(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const status = formData.get('status') as string

  if (!id || !name || !category) return

  await prisma.skill.update({
    where: { id },
    data: {
      name,
      category,
      status: status || 'Active'
    }
  })

  revalidatePath('/skills')
}

export async function deleteSkill(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return

  await prisma.skill.delete({ where: { id } })

  revalidatePath('/skills')
}
