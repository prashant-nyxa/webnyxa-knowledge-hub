import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin, isApiError } from '@/lib/api-auth'
import {
  buildPaginatedResponse,
  parseFilterValues,
  parsePaginationParams,
} from '@/lib/api-pagination'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await requireApiAdmin()
  if (isApiError(session)) return session

  const { searchParams } = request.nextUrl
  const { page, pageSize, search, skip, take } = parsePaginationParams(searchParams)
  const statusFilters = parseFilterValues(searchParams, 'status')
  const categoryFilters = parseFilterValues(searchParams, 'category')

  const where: Prisma.SkillWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (statusFilters.length > 0) where.status = { in: statusFilters }
  if (categoryFilters.length > 0) where.category = { in: categoryFilters }

  const [total, skills] = await Promise.all([
    prisma.skill.count({ where }),
    prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take,
    }),
  ])

  const data = skills.map((skill) => ({
    ...skill,
    createdAt: skill.createdAt.toISOString(),
    updatedAt: skill.updatedAt.toISOString(),
  }))

  return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize))
}
