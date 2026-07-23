import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin, isApiError } from '@/lib/api-auth'
import {
  buildPaginatedResponse,
  parseFilterValues,
  parsePaginationParams,
  splitCsv,
} from '@/lib/api-pagination'
import { serializeWorkHistoryUpdate } from '@/lib/work-history'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await requireApiAdmin()
  if (isApiError(session)) return session

  const { searchParams } = request.nextUrl
  const { page, pageSize, search, skip, take } = parsePaginationParams(searchParams)
  const developerId = searchParams.get('developerId') ?? ''
  const projectId = searchParams.get('projectId') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const projectFilters = parseFilterValues(searchParams, 'project')
  const developerFilters = parseFilterValues(searchParams, 'developer')
  const technologyFilters = parseFilterValues(searchParams, 'technology')
  const statusFilters = parseFilterValues(searchParams, 'status')
  const workTypeFilters = parseFilterValues(searchParams, 'workType')

  const where: Prisma.DailyUpdateWhereInput = {}
  const planWhere: Prisma.DailyPlanWhereInput = {}

  if (developerId) {
    where.developerId = developerId
    planWhere.developerId = developerId
  }
  if (projectId) {
    where.projectId = projectId
    planWhere.projectId = projectId
  }

  if (dateFrom || dateTo) {
    where.date = {}
    planWhere.date = {}
    if (dateFrom) {
      where.date.gte = new Date(dateFrom)
      planWhere.date.gte = new Date(dateFrom)
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setDate(end.getDate() + 1)
      where.date.lt = end
      planWhere.date.lt = end
    }
  }

  if (search) {
    where.OR = [
      { taskTitle: { contains: search, mode: 'insensitive' } },
      { workType: { contains: search, mode: 'insensitive' } },
      { technologies: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { blocker: { contains: search, mode: 'insensitive' } },
      { workCompleted: { contains: search, mode: 'insensitive' } },
      { workPending: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { developer: { name: { contains: search, mode: 'insensitive' } } },
      { project: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  if (developerFilters.length > 0) {
    where.developer = { name: { in: developerFilters } }
    planWhere.developer = { name: { in: developerFilters } }
  }

  if (projectFilters.length > 0) {
    where.project = { name: { in: projectFilters } }
    planWhere.project = { name: { in: projectFilters } }
  }

  if (statusFilters.length > 0) {
    where.status = { in: statusFilters }
  }

  if (workTypeFilters.length > 0) {
    where.workType = { in: workTypeFilters }
    planWhere.workType = { in: workTypeFilters }
  }

  const [updatesRaw, planAgg] = await Promise.all([
    prisma.dailyUpdate.findMany({
      where,
      include: { developer: true, project: true },
      orderBy: { date: 'desc' },
    }),
    prisma.dailyPlan.aggregate({
      where: planWhere,
      _sum: { expectedEffort: true },
    }),
  ])

  let updates = updatesRaw
  if (technologyFilters.length > 0) {
    updates = updates.filter((u) => {
      const techs = splitCsv(u.technologies)
      return technologyFilters.some((t) => techs.includes(t))
    })
  }

  const total = updates.length
  const paginated = updates.slice(skip, skip + take)
  const data = paginated.map(serializeWorkHistoryUpdate)
  const actualEffort = updates.reduce((sum, u) => sum + u.actualEffort, 0)
  const expectedEffort = planAgg._sum.expectedEffort ?? 0

  return NextResponse.json({
    ...buildPaginatedResponse(data, total, page, pageSize),
    summary: {
      expectedEffort,
      actualEffort,
      difference: actualEffort - expectedEffort,
    },
  })
}
