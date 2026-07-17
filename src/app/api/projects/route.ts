import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin, isApiError } from '@/lib/api-auth'
import {
  buildPaginatedResponse,
  parseFilterValues,
  parsePaginationParams,
  splitCsv,
  containsAny,
} from '@/lib/api-pagination'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await requireApiAdmin()
  if (isApiError(session)) return session

  const { searchParams } = request.nextUrl
  const { page, pageSize, search, skip, take } = parsePaginationParams(searchParams)
  const statusFilters = parseFilterValues(searchParams, 'status')
  const technologyFilters = parseFilterValues(searchParams, 'technology')
  const developerFilters = parseFilterValues(searchParams, 'developer')
  const typeFilters = parseFilterValues(searchParams, 'type')

  const where: Prisma.ProjectWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { client: { contains: search, mode: 'insensitive' } },
      { type: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { techStack: { contains: search, mode: 'insensitive' } },
      { developersInvolved: { contains: search, mode: 'insensitive' } },
      { developerRoles: { contains: search, mode: 'insensitive' } },
      { mainFeatures: { contains: search, mode: 'insensitive' } },
      { challenges: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (statusFilters.length > 0) where.status = { in: statusFilters }
  if (typeFilters.length > 0) where.type = { in: typeFilters }

  let projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  if (technologyFilters.length > 0) {
    projects = projects.filter((p) => containsAny(p.techStack, technologyFilters))
  }

  if (developerFilters.length > 0) {
    projects = projects.filter((p) => {
      const devs = splitCsv(p.developersInvolved)
      return developerFilters.some((d) => devs.includes(d))
    })
  }

  const total = projects.length
  const paginated = projects.slice(skip, skip + take)

  const data = paginated.map((project) => ({
    ...project,
    startDate: project.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: project.endDate?.toISOString().slice(0, 10) ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }))

  return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize))
}
