'use server'

import { redirect } from 'next/navigation'
import { ensureSeedAdmin, loginUser } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=Email%20and%20password%20are%20required.')
  }

  await ensureSeedAdmin()
  const result = await loginUser(email, password)

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`)
  }

  redirect(result.role === 'admin' ? '/' : '/daily-plans')
}
