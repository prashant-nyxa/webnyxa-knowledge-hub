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

  const where: Prisma.DailyPlanWhereInput = {}

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
      { priority: { contains: search, mode: 'insensitive' } },
      { dependency: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
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

  const [total, plans] = await Promise.all([
    prisma.dailyPlan.count({ where }),
    prisma.dailyPlan.findMany({
      where,
      include: { developer: true, project: true },
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
  ])

  const data = plans.map((plan) => ({
    id: plan.id,
    date: plan.date.toLocaleDateString(),
    dateValue: plan.date.toISOString().slice(0, 10),
    developerId: plan.developerId,
    developerName: plan.developer.name,
    projectId: plan.projectId,
    projectName: plan.project.name,
    taskTitle: plan.taskTitle,
    workType: plan.workType,
    technologies: plan.technologies,
    expectedEffort: plan.expectedEffort,
    priority: plan.priority,
    dependency: plan.dependency,
    notes: plan.notes,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }))

  return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize))
}
