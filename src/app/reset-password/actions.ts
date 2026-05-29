'use server'

import { redirect } from 'next/navigation'
import { requestPasswordReset, resetPasswordWithToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/mailer'

export async function requestResetAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) {
    redirect('/reset-password?error=Email%20is%20required.')
  }

  const result = await requestPasswordReset(email)
  if (result) {
    await sendPasswordResetEmail({
      to: result.user.email,
      name: result.user.developerName ?? result.user.email,
      resetUrl: result.resetUrl,
    })
  }

  redirect('/reset-password?message=If%20that%20email%20exists,%20a%20reset%20link%20has%20been%20sent.')
}

export async function completeResetAction(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!token || !password || !confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=All%20fields%20are%20required.`)
  }

  if (password.length < 8) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=Password%20must%20be%20at%20least%208%20characters.`)
  }

  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=Passwords%20do%20not%20match.`)
  }

  const result = await resetPasswordWithToken(token, password)
  if (!result.ok) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error)}`)
  }

  redirect('/login?message=Password%20updated.%20You%20can%20sign%20in%20now.')
}
