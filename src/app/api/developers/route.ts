import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin, isApiError } from '@/lib/api-auth'
import {
  buildPaginatedResponse,
  parseFilterValues,
  parsePaginationParams,
  splitCsv,
} from '@/lib/api-pagination'
import { listDeveloperUsers } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

function getAvailability(status: string, weeklyHours: number) {
  return status === 'Active' && weeklyHours >= 40 ? 'Available' : 'Busy'
}

export async function GET(request: NextRequest) {
  const session = await requireApiAdmin()
  if (isApiError(session)) return session

  const { searchParams } = request.nextUrl
  const { page, pageSize, search, skip, take } = parsePaginationParams(searchParams)
  const skillFilters = parseFilterValues(searchParams, 'skills')
  const roleFilters = parseFilterValues(searchParams, 'role')
  const statusFilters = parseFilterValues(searchParams, 'status')
  const availabilityFilters = parseFilterValues(searchParams, 'availability')

  const where: Prisma.DeveloperWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { role: { contains: search, mode: 'insensitive' } },
      { primarySkills: { contains: search, mode: 'insensitive' } },
      { secondarySkills: { contains: search, mode: 'insensitive' } },
      { weakAreas: { contains: search, mode: 'insensitive' } },
      { preferredWork: { contains: search, mode: 'insensitive' } },
      { currentProjects: { contains: search, mode: 'insensitive' } },
      { pastProjects: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (roleFilters.length > 0) where.role = { in: roleFilters }
  if (statusFilters.length > 0) where.status = { in: statusFilters }

  let developers = await prisma.developer.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  if (skillFilters.length > 0) {
    developers = developers.filter((dev) => {
      const skills = [...splitCsv(dev.primarySkills), ...splitCsv(dev.secondarySkills)]
      return skillFilters.some((s) => skills.includes(s))
    })
  }

  if (availabilityFilters.length > 0) {
    developers = developers.filter((dev) =>
      availabilityFilters.includes(getAvailability(dev.status, dev.weeklyHours))
    )
  }

  const total = developers.length
  const paginated = developers.slice(skip, skip + take)

  const users = await listDeveloperUsers()
  const emailByDeveloperId = new Map(users.map((user) => [user.developerId, user.email]))

  const data = paginated.map((developer) => ({
    ...developer,
    email: emailByDeveloperId.get(developer.id) ?? '',
    availability: getAvailability(developer.status, developer.weeklyHours),
    createdAt: developer.createdAt.toISOString(),
    updatedAt: developer.updatedAt.toISOString(),
  }))

  return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize))
}
