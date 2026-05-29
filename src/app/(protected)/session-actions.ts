'use server'

import { redirect } from 'next/navigation'
import { logoutUser } from '@/lib/auth'

export async function logoutUserAction() {
  await logoutUser()
  redirect('/login')
}

export { logoutUserAction as logoutUser }
