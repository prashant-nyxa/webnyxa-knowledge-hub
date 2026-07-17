import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin, isApiError } from '@/lib/api-auth'
import {
  buildPaginatedResponse,
  parseFilterValues,
  parsePaginationParams,
} from '@/lib/api-pagination'

type PlanVsActualRow = {
  id: string
  developerId: string
  developerName: string
  date: string
  dateValue: string
  projectName: string
  plannedTasks: string
  completedTasks: string
  inProgressTasks: string
  blockedTasks: string
  carriedForwardTasks: string
  expectedEffort: number
  actualEffort: number
  difference: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireApiAdmin()
    if (isApiError(session)) return session

    const { searchParams } = request.nextUrl
    const { page, pageSize, search, skip, take } = parsePaginationParams(searchParams)
    const dateFilter = searchParams.get('date') ?? ''
    const developerFilters = parseFilterValues(searchParams, 'developer')
    const projectFilters = parseFilterValues(searchParams, 'project')
    const statusFilters = parseFilterValues(searchParams, 'status')

    const [plans, updates] = await Promise.all([
      prisma.dailyPlan.findMany({
        include: { developer: true, project: true, dailyUpdate: true },
        orderBy: { date: 'desc' },
      }),
      prisma.dailyUpdate.findMany({
        include: { developer: true, project: true },
        orderBy: { date: 'desc' },
      }),
    ])

    const groupMap = new Map<string, PlanVsActualRow>()

    for (const plan of plans) {
      const dateValue = plan.date.toISOString().slice(0, 10)
      const key = `${plan.developerId}|${dateValue}`
      const existing = groupMap.get(key)
      const projectLabel = plan.project?.name ?? 'Unknown project'
      const row: PlanVsActualRow = existing ?? {
        id: key,
        developerId: plan.developerId,
        developerName: plan.developer?.name ?? 'Unknown developer',
        date: plan.date.toLocaleDateString(),
        dateValue,
        projectName: projectLabel,
        plannedTasks: '',
        completedTasks: '',
        inProgressTasks: '',
        blockedTasks: '',
        carriedForwardTasks: '',
        expectedEffort: 0,
        actualEffort: 0,
        difference: 0,
      }
      row.plannedTasks = row.plannedTasks ? `${row.plannedTasks}; ${plan.taskTitle}` : plan.taskTitle
      row.expectedEffort += plan.expectedEffort ?? 0
      if (projectLabel && !row.projectName.includes(projectLabel)) {
        row.projectName = row.projectName ? `${row.projectName}, ${projectLabel}` : projectLabel
      }
      groupMap.set(key, row)
    }

    for (const update of updates) {
      const dateValue = update.date.toISOString().slice(0, 10)
      const key = `${update.developerId}|${dateValue}`
      const existing = groupMap.get(key)
      const projectLabel = update.project?.name ?? 'Unknown project'
      const row: PlanVsActualRow = existing ?? {
        id: key,
        developerId: update.developerId,
        developerName: update.developer?.name ?? 'Unknown developer',
        date: update.date.toLocaleDateString(),
        dateValue,
        projectName: projectLabel,
        plannedTasks: '',
        completedTasks: '',
        inProgressTasks: '',
        blockedTasks: '',
        carriedForwardTasks: '',
        expectedEffort: 0,
        actualEffort: 0,
        difference: 0,
      }

      row.actualEffort += update.actualEffort ?? 0
      if (projectLabel && !row.projectName.includes(projectLabel)) {
        row.projectName = row.projectName ? `${row.projectName}, ${projectLabel}` : projectLabel
      }

      switch (update.status) {
        case 'Done':
          row.completedTasks = row.completedTasks
            ? `${row.completedTasks}; ${update.taskTitle}`
            : update.taskTitle
          break
        case 'In Progress':
          row.inProgressTasks = row.inProgressTasks
            ? `${row.inProgressTasks}; ${update.taskTitle}`
            : update.taskTitle
          break
        case 'Blocked':
          row.blockedTasks = row.blockedTasks
            ? `${row.blockedTasks}; ${update.taskTitle}`
            : update.taskTitle
          break
        case 'Carried Forward':
          row.carriedForwardTasks = row.carriedForwardTasks
            ? `${row.carriedForwardTasks}; ${update.taskTitle}`
            : update.taskTitle
          break
      }

      groupMap.set(key, row)
    }

    let rows = Array.from(groupMap.values()).map((row) => ({
      ...row,
      difference: row.actualEffort - row.expectedEffort,
    }))

    if (dateFilter) {
      rows = rows.filter((r) => r.dateValue === dateFilter)
    }

    if (developerFilters.length > 0) {
      rows = rows.filter((r) => developerFilters.includes(r.developerName))
    }

    if (projectFilters.length > 0) {
      rows = rows.filter((r) =>
        projectFilters.some((p) => r.projectName.split(', ').includes(p))
      )
    }

    if (statusFilters.length > 0) {
      rows = rows.filter((r) => {
        const statuses = [
          r.completedTasks && 'Done',
          r.inProgressTasks && 'In Progress',
          r.blockedTasks && 'Blocked',
          r.carriedForwardTasks && 'Carried Forward',
        ].filter(Boolean) as string[]
        return statusFilters.some((s) => statuses.includes(s))
      })
    }

    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.developerName.toLowerCase().includes(q) ||
          r.projectName.toLowerCase().includes(q) ||
          r.plannedTasks.toLowerCase().includes(q) ||
          r.completedTasks.toLowerCase().includes(q) ||
          r.inProgressTasks.toLowerCase().includes(q) ||
          r.blockedTasks.toLowerCase().includes(q) ||
          r.carriedForwardTasks.toLowerCase().includes(q)
      )
    }

    rows.sort((a, b) => b.dateValue.localeCompare(a.dateValue))

    const total = rows.length
    const data = rows.slice(skip, skip + take)

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize))
  } catch (error) {
    console.error('Failed to load plan vs actual report', error)
    return NextResponse.json({ error: 'Failed to load plan vs actual report' }, { status: 500 })
  }
}
