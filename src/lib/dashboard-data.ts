import { prisma } from '@/lib/prisma'
import { parseTechnologies } from '@/lib/work-history'

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getManagementDashboardData() {
  const today = startOfToday()

  const [
    activeDevelopers,
    allActiveDevs,
    activeProjects,
    completedProjects,
    todayPlans,
    todayUpdates,
    allUpdates,
    activeDevsFull,
  ] = await Promise.all([
    prisma.developer.count({ where: { status: 'Active' } }),
    prisma.developer.findMany({ where: { status: 'Active' } }),
    prisma.project.count({ where: { status: 'Active' } }),
    prisma.project.count({ where: { status: 'Completed' } }),
    prisma.dailyPlan.findMany({
      where: { date: { gte: today } },
      include: { developer: true, project: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dailyUpdate.findMany({
      where: { date: { gte: today } },
      include: { developer: true, project: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.dailyUpdate.findMany({
      select: {
        developerId: true,
        projectId: true,
        technologies: true,
        status: true,
        blocker: true,
        developer: { select: { name: true, primarySkills: true, secondarySkills: true } },
      },
    }),
    prisma.developer.findMany({
      where: { status: 'Active' },
      select: { id: true, name: true, role: true, weeklyHours: true, primarySkills: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const availableDevelopers = allActiveDevs.filter((d) => d.weeklyHours >= 40).length
  const busyDevelopers = allActiveDevs.filter((d) => d.weeklyHours < 40).length

  const devsWithBlockers = new Set(
    allUpdates
      .filter((u) => u.status === 'Blocked' || Boolean(u.blocker?.trim()))
      .map((u) => u.developerId)
  ).size

  const projectsWithBlockers = new Set(
    allUpdates
      .filter((u) => u.status === 'Blocked' || Boolean(u.blocker?.trim()))
      .map((u) => u.projectId)
  ).size

  const projectsWithPending = new Set(
    allUpdates.filter((u) => u.status === 'In Progress').map((u) => u.projectId)
  ).size

  const todayCompleted = todayUpdates.filter((u) => u.status === 'Done')
  const todayInProgress = todayUpdates.filter((u) => u.status === 'In Progress')
  const todayBlocked = todayUpdates.filter((u) => u.status === 'Blocked')
  const todayCarriedForward = todayUpdates.filter((u) => u.status === 'Carried Forward')

  const techMap = new Map<string, Set<string>>()

  for (const update of allUpdates) {
    const techs = parseTechnologies(update.technologies)
    for (const tech of techs) {
      if (!techMap.has(tech)) techMap.set(tech, new Set())
      techMap.get(tech)!.add(update.developer.name)
    }
  }

  for (const dev of activeDevsFull) {
    const profileTechs = [
      ...parseTechnologies(dev.primarySkills),
    ]
    for (const tech of profileTechs) {
      if (!techMap.has(tech)) techMap.set(tech, new Set())
      techMap.get(tech)!.add(dev.name)
    }
  }

  const skillEntries = Array.from(techMap.entries())
    .map(([technology, devSet]) => ({
      technology,
      developers: Array.from(devSet).sort((a, b) => a.localeCompare(b)),
      count: devSet.size,
    }))
    .sort((a, b) => b.count - a.count || a.technology.localeCompare(b.technology))

  const strongSkills = skillEntries.filter((s) => s.count >= 2)
  const limitedSkills = skillEntries.filter((s) => s.count === 1)

  const developersWithBlockersList = Array.from(
    new Map(
      allUpdates
        .filter((u) => u.status === 'Blocked' || Boolean(u.blocker?.trim()))
        .map((u) => [u.developerId, u.developer.name])
    ).values()
  ).slice(0, 8)

  return {
    developerSummary: {
      totalActive: activeDevelopers,
      available: availableDevelopers,
      busy: busyDevelopers,
      withBlockers: devsWithBlockers,
      developersWithBlockersList,
    },
    projectSummary: {
      totalActive: activeProjects,
      completed: completedProjects,
      withBlockers: projectsWithBlockers,
      withPending: projectsWithPending,
    },
    dailyWorkSummary: {
      planned: todayPlans.length,
      plannedTasks: todayPlans.slice(0, 6),
      completed: todayCompleted.length,
      inProgress: todayInProgress.length,
      blocked: todayBlocked.length,
      carriedForward: todayCarriedForward.length,
      completedTasks: todayCompleted.slice(0, 5),
      blockedTasks: todayBlocked.slice(0, 5),
    },
    skillSummary: {
      technologies: skillEntries.slice(0, 12),
      strongSkills: strongSkills.slice(0, 8),
      limitedSkills: limitedSkills.slice(0, 8),
      totalTechnologies: skillEntries.length,
    },
    // Keep existing dashboard bits
    recentUpdates: await prisma.dailyUpdate.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 6,
      include: { developer: true, project: true },
    }),
    projectsByStatus: await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    pendingUpdates: await prisma.dailyUpdate.findMany({
      where: { status: { in: ['In Progress', 'Blocked'] } },
      include: { developer: true, project: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    developersAvailability: activeDevsFull,
  }
}
