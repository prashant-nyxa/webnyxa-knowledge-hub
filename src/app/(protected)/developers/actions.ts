'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionError, actionSuccess, type ActionResult } from '@/lib/action-result'
import {
  buildResetPasswordUrl,
  createLinkedUser,
  createPasswordResetToken,
  deleteLinkedUserByDeveloperId,
  findUserByDeveloperId,
  findUserByEmail,
  hashPassword,
  requireAdmin,
  updateLinkedUserByDeveloperId,
} from '@/lib/auth'
import { sendDeveloperAccountEmail } from '@/lib/mailer'

function randomFallbackPassword() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

function isEmailInUseError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('unique constraint') || message.includes('duplicate key')
}

export async function addDeveloper(formData: FormData): Promise<ActionResult> {
  await requireAdmin()

  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const weeklyHours = parseInt(formData.get('weeklyHours') as string)
  const status = formData.get('status') as string
  const primarySkills = formData.get('primarySkills') as string
  const secondarySkills = formData.get('secondarySkills') as string
  const weakAreas = formData.get('weakAreas') as string
  const preferredWork = formData.get('preferredWork') as string
  const currentProjects = formData.get('currentProjects') as string
  const pastProjects = formData.get('pastProjects') as string
  const notes = formData.get('notes') as string

  if (!name || !role || !email || !password) return actionError('Name, role, email, and password are required')
  if (password.length < 8) return actionError('Password must be at least 8 characters')

  try {
    const developer = await prisma.developer.create({
      data: {
        name,
        role,
        weeklyHours: isNaN(weeklyHours) ? 40 : weeklyHours,
        status: status || 'Active',
        primarySkills,
        secondarySkills,
        weakAreas,
        preferredWork,
        currentProjects,
        pastProjects,
        notes,
      },
    })
    const userId = await createLinkedUser({
      email,
      passwordHash: await hashPassword(password),
      role: 'developer',
      developerId: developer.id,
      mustResetPassword: true,
    })
    if (!userId) return actionError('Failed to create developer account')
    const resetToken = await createPasswordResetToken(userId)
    revalidatePath('/developers')
    revalidatePath('/')

    try {
      await sendDeveloperAccountEmail({
        to: email,
        name,
        resetUrl: buildResetPasswordUrl(resetToken),
      })
      return actionSuccess('Developer added and account email sent')
    } catch {
      return actionSuccess('Developer added, but account email could not be sent')
    }
  } catch (error) {
    if (isEmailInUseError(error)) {
      return actionError('That email is already in use')
    }
    return actionError('Failed to add developer')
  }
}

export async function updateDeveloper(formData: FormData): Promise<ActionResult> {
  await requireAdmin()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const weeklyHours = parseInt(formData.get('weeklyHours') as string)
  const status = formData.get('status') as string
  const primarySkills = formData.get('primarySkills') as string
  const secondarySkills = formData.get('secondarySkills') as string
  const weakAreas = formData.get('weakAreas') as string
  const preferredWork = formData.get('preferredWork') as string
  const currentProjects = formData.get('currentProjects') as string
  const pastProjects = formData.get('pastProjects') as string
  const notes = formData.get('notes') as string

  if (!id || !name || !role || !email) return actionError('Missing required fields')
  if (password && password.length < 8) return actionError('Password must be at least 8 characters')

  try {
    const existing = await prisma.developer.findUnique({ where: { id } })

    if (!existing) return actionError('Developer not found')

    const emailOwner = await findUserByEmail(email)
    if (emailOwner && emailOwner.developerId !== id) {
      return actionError('That email is already in use by another account')
    }

    const existingUser = await findUserByDeveloperId(id)

    await prisma.developer.update({
      where: { id },
      data: {
        name,
        role,
        weeklyHours: isNaN(weeklyHours) ? 40 : weeklyHours,
        status: status || 'Active',
        primarySkills,
        secondarySkills,
        weakAreas,
        preferredWork,
        currentProjects,
        pastProjects,
        notes,
      },
    })
    if (existingUser) {
      await updateLinkedUserByDeveloperId({
        developerId: id,
        email,
        ...(password ? { passwordHash: await hashPassword(password), mustResetPassword: true } : {}),
      })
    } else {
      const userId = await createLinkedUser({
        email,
        passwordHash: await hashPassword(password || randomFallbackPassword()),
        role: 'developer',
        developerId: id,
        mustResetPassword: true,
      })
      if (!userId) return actionError('Failed to create developer account')
    }

    if (password || !existingUser) {
      const user = await findUserByDeveloperId(id)
      if (user) {
        try {
          const resetToken = await createPasswordResetToken(user.id)
          await sendDeveloperAccountEmail({
            to: email,
            name,
            resetUrl: buildResetPasswordUrl(resetToken),
          })
        } catch {
          // Account updated; email delivery is optional
        }
      }
    }
    revalidatePath('/developers')
    revalidatePath(`/developers/${id}`)
    revalidatePath('/')
    return actionSuccess('Developer updated successfully')
  } catch (error) {
    if (isEmailInUseError(error)) {
      return actionError('That email is already in use by another account')
    }
    console.error('updateDeveloper failed:', error)
    return actionError('Failed to update developer')
  }
}

export async function deleteDeveloper(id: string): Promise<ActionResult> {
  await requireAdmin()

  if (!id) return actionError('Invalid developer')

  try {
    await deleteLinkedUserByDeveloperId(id)
    await prisma.developer.delete({ where: { id } })
    revalidatePath('/developers')
    revalidatePath('/')
    return actionSuccess('Developer deleted')
  } catch {
    return actionError('Failed to delete developer')
  }
}
