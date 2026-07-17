import 'server-only'

import { randomBytes, randomUUID, createHash, createHmac, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const scrypt = promisify(scryptCallback)

const SESSION_COOKIE_NAME = 'wnxa_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60 * 24

export type AppRole = 'admin' | 'developer'

export type SessionUser = {
  userId: string
  email: string
  role: AppRole
  developerId: string | null
  name: string | null
}

type SessionPayload = {
  sub: string
  email: string
  role: AppRole
  developerId: string | null
  name: string | null
  exp: number
}

type UserRow = {
  id: string
  email: string
  passwordHash: string
  role: string
  developerId: string | null
  mustResetPassword: boolean
  resetTokenHash: string | null
  resetTokenExpiresAt: Date | null
  developerName: string | null
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET must be set.')
  }
  return secret
}

function getAppUrl() {
  return process.env.APP_URL || 'http://localhost:3000'
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function parseRole(role: string): AppRole {
  return role === 'admin' ? 'admin' : 'developer'
}

export async function findUserByEmail(email: string) {
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u.id,
      u.email,
      u."passwordHash",
      u.role,
      u."developerId",
      u."mustResetPassword",
      u."resetTokenHash",
      u."resetTokenExpiresAt",
      d.name AS "developerName"
    FROM "User" u
    LEFT JOIN "Developer" d ON d.id = u."developerId"
    WHERE u.email = ${email}
    LIMIT 1
  `

  return rows[0] ?? null
}

export async function findUserByDeveloperId(developerId: string) {
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u.id,
      u.email,
      u."passwordHash",
      u.role,
      u."developerId",
      u."mustResetPassword",
      u."resetTokenHash",
      u."resetTokenExpiresAt",
      d.name AS "developerName"
    FROM "User" u
    LEFT JOIN "Developer" d ON d.id = u."developerId"
    WHERE u."developerId" = ${developerId}
    LIMIT 1
  `

  return rows[0] ?? null
}

export async function listDeveloperUsers() {
  return prisma.$queryRaw<Array<{ developerId: string | null; email: string }>>`
    SELECT "developerId", email
    FROM "User"
    WHERE role = 'developer'
  `
}

export async function createLinkedUser({
  email,
  passwordHash,
  role,
  developerId,
  mustResetPassword,
}: {
  email: string
  passwordHash: string
  role: string
  developerId: string | null
  mustResetPassword: boolean
}) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "User" ("id", "email", "passwordHash", "role", "developerId", "mustResetPassword", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${email}, ${passwordHash}, ${role}, ${developerId}, ${mustResetPassword}, NOW(), NOW())
    RETURNING id
  `

  return rows[0]?.id ?? null
}

export async function updateLinkedUserByDeveloperId({
  developerId,
  email,
  passwordHash,
  mustResetPassword,
}: {
  developerId: string
  email: string
  passwordHash?: string
  mustResetPassword?: boolean
}) {
  if (passwordHash) {
    await prisma.$executeRaw`
      UPDATE "User"
      SET
        email = ${email},
        "passwordHash" = ${passwordHash},
        "mustResetPassword" = ${mustResetPassword ?? true},
        "updatedAt" = NOW()
      WHERE "developerId" = ${developerId}
    `
    return
  }

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      email = ${email},
      "updatedAt" = NOW()
    WHERE "developerId" = ${developerId}
  `
}

export async function deleteLinkedUserByDeveloperId(developerId: string) {
  await prisma.$executeRaw`
    DELETE FROM "User"
    WHERE "developerId" = ${developerId}
  `
}

async function setSessionCookie(user: {
  id: string
  email: string
  role: string
  developerId: string | null
  developerName?: string | null
}) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    role: parseRole(user.role),
    developerId: user.developerId,
    name: user.developerName ?? null,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const token = `${encodedPayload}.${sign(encodedPayload)}`
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

function parseSessionToken(token: string): SessionPayload | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (signatureBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null

  const parsed = JSON.parse(base64UrlDecode(payload)) as SessionPayload
  if (parsed.exp * 1000 <= Date.now()) return null
  return parsed
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt:${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, hash] = passwordHash.split(':')
  if (algorithm !== 'scrypt' || !salt || !hash) return false

  const derived = (await scrypt(password, salt, 64)) as Buffer
  const storedHash = Buffer.from(hash, 'hex')
  if (derived.length !== storedHash.length) return false
  return timingSafeEqual(derived, storedHash)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const payload = parseSessionToken(token)
  if (!payload) {
    await clearSession()
    return null
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    developerId: payload.developerId,
    name: payload.name,
  }
}

export async function requireUser() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireAdmin() {
  const session = await requireUser()
  if (session.role !== 'admin') redirect('/daily-plans')
  return session
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await findUserByEmail(normalizedEmail)

  if (!user) return { ok: false as const, error: 'Invalid email or password.' }

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) return { ok: false as const, error: 'Invalid email or password.' }

  await setSessionCookie(user)
  return { ok: true as const, role: parseRole(user.role) }
}

export async function logoutUser() {
  await clearSession()
}

export function canManageDeveloperData(session: SessionUser, developerId: string) {
  return session.role === 'admin' || session.developerId === developerId
}

export function assertCanManageDeveloperData(session: SessionUser, developerId: string) {
  if (!canManageDeveloperData(session, developerId)) {
    throw new Error('Unauthorized')
  }
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = randomBytes(32).toString('hex')
  const resetTokenHash = hashToken(rawToken)
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "resetTokenHash" = ${resetTokenHash},
      "resetTokenExpiresAt" = ${resetTokenExpiresAt},
      "updatedAt" = NOW()
    WHERE id = ${userId}
  `

  return rawToken
}

export function buildResetPasswordUrl(token: string) {
  return `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`
}

export async function findUserByValidResetToken(token: string) {
  const resetTokenHash = hashToken(token)
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u.id,
      u.email,
      u."passwordHash",
      u.role,
      u."developerId",
      u."mustResetPassword",
      u."resetTokenHash",
      u."resetTokenExpiresAt",
      d.name AS "developerName"
    FROM "User" u
    LEFT JOIN "Developer" d ON d.id = u."developerId"
    WHERE u."resetTokenHash" = ${resetTokenHash}
      AND u."resetTokenExpiresAt" > NOW()
    LIMIT 1
  `

  return rows[0] ?? null
}

export async function resetPasswordWithToken(token: string, password: string) {
  const user = await findUserByValidResetToken(token)
  if (!user) return { ok: false as const, error: 'This reset link is invalid or has expired.' }

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "passwordHash" = ${await hashPassword(password)},
      "mustResetPassword" = false,
      "resetTokenHash" = NULL,
      "resetTokenExpiresAt" = NULL,
      "updatedAt" = NOW()
    WHERE id = ${user.id}
  `

  return { ok: true as const }
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await findUserByEmail(normalizedEmail)

  if (!user) return null

  const token = await createPasswordResetToken(user.id)
  return {
    user,
    resetUrl: buildResetPasswordUrl(token),
  }
}

export async function ensureSeedAdmin() {
  const existingAdmin = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "User"
    WHERE role = 'admin'
    LIMIT 1
  `

  if (existingAdmin[0]) return

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!email || !password) return

  await createLinkedUser({
    email,
    passwordHash: await hashPassword(password),
    role: 'admin',
    developerId: null,
    mustResetPassword: false,
  })
}
