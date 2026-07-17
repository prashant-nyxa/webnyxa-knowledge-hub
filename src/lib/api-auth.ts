import { NextResponse } from 'next/server'
import { getSession, type SessionUser } from '@/lib/auth'

export async function requireApiUser(): Promise<SessionUser | NextResponse> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session
}

export async function requireApiAdmin(): Promise<SessionUser | NextResponse> {
  const session = await requireApiUser()
  if (session instanceof NextResponse) return session
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return session
}

export function isApiError(result: SessionUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
