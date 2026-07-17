import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser, isApiError } from '@/lib/api-auth'
import {
  buildPaginatedResponse,
  parseFilterValues,
  parsePaginationParams,
} from '@/lib/api-pagination'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await requireApiUser()
  if (isApiError(session)) return session

  const { searchParams } = request.nextUrl
  const { page, pageSize, search, skip, take } = parsePaginationParams(searchParams)
  const dateFilter = searchParams.get('date') ?? ''
  const developerFilters = parseFilterValues(searchParams, 'developer')
  const projectFilters = parseFilterValues(searchParams, 'project')
  const statusFilters = parseFilterValues(searchParams, 'status')

  const where: Prisma.DailyUpdateWhereInput = {}

  if (session.role !== 'admin' && session.developerId) {
    where.developerId = session.developerId
  }

  if (dateFilter) {
    const start = new Date(dateFilter)
    const end = new Date(dateFilter)
    end.setDate(end.getDate() + 1)
    where.date = { gte: start, lt: end }
  }

  if (search) {
    where.OR = [
      { taskTitle: { contains: search, mode: 'insensitive' } },
      { workType: { contains: search, mode: 'insensitive' } },
      { technologies: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { workCompleted: { contains: search, mode: 'insensitive' } },
      { workPending: { contains: search, mode: 'insensitive' } },
      { blocker: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { developer: { name: { contains: search, mode: 'insensitive' } } },
      { project: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  if (developerFilters.length > 0) {
    where.developer = { name: { in: developerFilters } }
  }

  if (projectFilters.length > 0) {
    where.project = { name: { in: projectFilters } }
  }

  if (statusFilters.length > 0) {
    where.status = { in: statusFilters }
  }

  const [total, updates] = await Promise.all([
    prisma.dailyUpdate.count({ where }),
    prisma.dailyUpdate.findMany({
      where,
      include: { developer: true, project: true, dailyPlan: true },
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
  ])

  const data = updates.map((update) => ({
    id: update.id,
    date: update.date.toLocaleDateString(),
    dateValue: update.date.toISOString().slice(0, 10),
    developerId: update.developerId,
    developerName: update.developer.name,
    projectId: update.projectId,
    projectName: update.project.name,
    dailyPlanId: update.dailyPlanId,
    taskTitle: update.taskTitle,
    workType: update.workType,
    technologies: update.technologies,
    status: update.status,
    actualEffort: update.actualEffort,
    workCompleted: update.workCompleted,
    workPending: update.workPending,
    blocker: update.blocker,
    summary: update.summary,
    planType: update.dailyPlanId ? 'Planned' : 'Unplanned',
    createdAt: update.createdAt.toISOString(),
    updatedAt: update.updatedAt.toISOString(),
  }))

  return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize))
}
