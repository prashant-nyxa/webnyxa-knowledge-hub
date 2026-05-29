export type WorkHistoryRecord = {
  id: string
  dateValue: string
  dateLabel: string
  developerId: string
  developerName: string
  projectId: string
  projectName: string
  taskTitle: string
  workType: string
  technologies: string
  technologyList: string[]
  status: string
  actualEffort: number
  blocker: string | null
  workCompleted: string | null
  workPending: string | null
  summary: string | null
}

export function parseTechnologies(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export function filterWorkHistory(
  records: WorkHistoryRecord[],
  filters: {
    dateFrom: string
    dateTo: string
    projects: string[]
    developers: string[]
    technologies: string[]
    statuses: string[]
    workTypes: string[]
    search: string
  },
  mode: 'developer' | 'project'
) {
  return records.filter((record) => {
    if (filters.dateFrom && record.dateValue < filters.dateFrom) return false
    if (filters.dateTo && record.dateValue > filters.dateTo) return false
    if (filters.projects.length > 0 && !filters.projects.includes(record.projectName)) return false
    if (filters.developers.length > 0 && !filters.developers.includes(record.developerName)) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(record.status)) return false
    if (filters.workTypes.length > 0 && !filters.workTypes.includes(record.workType)) return false
    if (
      filters.technologies.length > 0 &&
      !record.technologyList.some((tech) => filters.technologies.includes(tech))
    ) {
      return false
    }
    const haystack =
      `${record.taskTitle} ${record.projectName} ${record.developerName} ${record.workType} ${record.technologies} ${record.status} ${record.blocker ?? ''}`.toLowerCase()
    if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false
    return true
  })
}

export function aggregateDeveloperHistory(records: WorkHistoryRecord[]) {
  const projects = uniqueSorted(records.map((r) => r.projectName))
  const technologies = uniqueSorted(records.flatMap((r) => r.technologyList))
  const workTypes = uniqueSorted(records.map((r) => r.workType))
  const totalEffort = records.reduce((sum, r) => sum + r.actualEffort, 0)
  const completed = records.filter((r) => r.status === 'Done')
  const active = records.filter((r) => r.status === 'In Progress')
  const carriedForward = records.filter((r) => r.status === 'Carried Forward')
  const blocked = records.filter((r) => r.status === 'Blocked' || Boolean(r.blocker?.trim()))
  const blockers = blocked
    .filter((r) => r.blocker?.trim())
    .map((r) => ({
      id: r.id,
      date: r.dateLabel,
      project: r.projectName,
      task: r.taskTitle,
      blocker: r.blocker!,
    }))

  const workTypeBreakdown = workTypes.map((type) => ({
    type,
    count: records.filter((r) => r.workType === type).length,
    effort: records.filter((r) => r.workType === type).reduce((s, r) => s + r.actualEffort, 0),
  }))

  const projectBreakdown = projects.map((project) => ({
    project,
    tasks: records.filter((r) => r.projectName === project).length,
    effort: records
      .filter((r) => r.projectName === project)
      .reduce((s, r) => s + r.actualEffort, 0),
  }))

  return {
    projects,
    technologies,
    workTypes,
    workTypeBreakdown,
    projectBreakdown,
    totalEffort,
    tasksCompleted: completed.length,
    activeTasks: active,
    completedTasks: completed,
    carriedForwardTasks: carriedForward,
    blockedTasks: blocked,
    blockers,
  }
}

export function aggregateProjectHistory(
  records: WorkHistoryRecord[],
  projectSummary: string | null
) {
  const developers = uniqueSorted(records.map((r) => r.developerName))
  const technologies = uniqueSorted(records.flatMap((r) => r.technologyList))
  const workTypes = uniqueSorted(records.map((r) => r.workType))
  const totalEffort = records.reduce((sum, r) => sum + r.actualEffort, 0)
  const completed = records.filter((r) => r.status === 'Done')
  const pending = records.filter((r) => r.status === 'In Progress' || Boolean(r.workPending?.trim()))
  const blocked = records.filter((r) => r.status === 'Blocked' || Boolean(r.blocker?.trim()))

  const workByDeveloper = developers.map((name) => {
    const devRecords = records.filter((r) => r.developerName === name)
    return {
      developer: name,
      tasks: devRecords.length,
      completed: devRecords.filter((r) => r.status === 'Done').length,
      effort: devRecords.reduce((s, r) => s + r.actualEffort, 0),
      technologies: uniqueSorted(devRecords.flatMap((r) => r.technologyList)),
    }
  })

  return {
    developers,
    technologies,
    workTypes,
    totalEffort,
    tasksCompleted: completed.length,
    completedTasks: completed,
    pendingTasks: pending,
    blockedTasks: blocked,
    workByDeveloper,
    projectSummary,
  }
}

export function serializeWorkHistoryUpdate(update: {
  id: string
  date: Date
  developerId: string
  developer: { name: string }
  projectId: string
  project: { name: string }
  taskTitle: string
  workType: string
  technologies: string
  status: string
  actualEffort: number
  blocker: string | null
  workCompleted: string | null
  workPending: string | null
  summary: string | null
}): WorkHistoryRecord {
  return {
    id: update.id,
    dateValue: update.date.toISOString().slice(0, 10),
    dateLabel: update.date.toLocaleDateString(),
    developerId: update.developerId,
    developerName: update.developer.name,
    projectId: update.projectId,
    projectName: update.project.name,
    taskTitle: update.taskTitle,
    workType: update.workType,
    technologies: update.technologies,
    technologyList: parseTechnologies(update.technologies),
    status: update.status,
    actualEffort: update.actualEffort,
    blocker: update.blocker,
    workCompleted: update.workCompleted,
    workPending: update.workPending,
    summary: update.summary,
  }
}
