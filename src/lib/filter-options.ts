import { prisma } from '@/lib/prisma'
import {
  AVAILABILITY_OPTIONS,
  DEVELOPER_ROLES,
  DEVELOPER_STATUSES,
  EOD_STATUSES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  SKILL_CATEGORIES,
  SKILL_STATUSES,
  WORK_TYPES,
} from '@/lib/constants'
import type { FilterConfig } from '@/components/records-table-tools'

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export async function getSkillNameOptions() {
  const skills = await prisma.skill.findMany({
    where: { status: 'Active' },
    orderBy: { name: 'asc' },
    select: { name: true },
  })
  return uniqueSorted(skills.map((s) => s.name))
}

export async function getDeveloperNameOptions() {
  const developers = await prisma.developer.findMany({
    orderBy: { name: 'asc' },
    select: { name: true },
  })
  return uniqueSorted(developers.map((d) => d.name))
}

export async function getProjectNameOptions() {
  const projects = await prisma.project.findMany({
    orderBy: { name: 'asc' },
    select: { name: true },
  })
  return uniqueSorted(projects.map((p) => p.name))
}

export async function getDeveloperFilters(): Promise<FilterConfig[]> {
  const skillOptions = await getSkillNameOptions()
  return [
    { key: 'skills', label: 'Skills', options: skillOptions },
    { key: 'role', label: 'Role', options: [...DEVELOPER_ROLES] },
    { key: 'status', label: 'Status', options: [...DEVELOPER_STATUSES] },
    { key: 'availability', label: 'Availability', options: [...AVAILABILITY_OPTIONS] },
  ]
}

export async function getProjectFilters(): Promise<FilterConfig[]> {
  const [skillOptions, developerOptions] = await Promise.all([
    getSkillNameOptions(),
    getDeveloperNameOptions(),
  ])
  return [
    { key: 'status', label: 'Project Status', options: [...PROJECT_STATUSES] },
    { key: 'technology', label: 'Technology', options: skillOptions },
    { key: 'developer', label: 'Developer', options: developerOptions },
    { key: 'type', label: 'Project Type', options: [...PROJECT_TYPES] },
  ]
}

export async function getSkillFilters(): Promise<FilterConfig[]> {
  return [
    { key: 'status', label: 'Status', options: [...SKILL_STATUSES] },
    { key: 'category', label: 'Category', options: [...SKILL_CATEGORIES] },
  ]
}

export async function getDailyPlanFilters(): Promise<FilterConfig[]> {
  const [developerOptions, projectOptions] = await Promise.all([
    getDeveloperNameOptions(),
    getProjectNameOptions(),
  ])
  return [
    { key: 'date', label: 'Date', options: [] },
    { key: 'developer', label: 'Developer', options: developerOptions },
    { key: 'project', label: 'Project', options: projectOptions },
  ]
}

export async function getEodUpdateFilters(): Promise<FilterConfig[]> {
  const [developerOptions, projectOptions] = await Promise.all([
    getDeveloperNameOptions(),
    getProjectNameOptions(),
  ])
  return [
    { key: 'date', label: 'Date', options: [] },
    { key: 'developer', label: 'Developer', options: developerOptions },
    { key: 'project', label: 'Project', options: projectOptions },
    { key: 'status', label: 'Status', options: [...EOD_STATUSES] },
  ]
}

export async function getPlanVsActualFilters(): Promise<FilterConfig[]> {
  const [developerOptions, projectOptions] = await Promise.all([
    getDeveloperNameOptions(),
    getProjectNameOptions(),
  ])
  return [
    { key: 'date', label: 'Date', options: [] },
    { key: 'developer', label: 'Developer', options: developerOptions },
    { key: 'project', label: 'Project', options: projectOptions },
    { key: 'status', label: 'Status', options: [...EOD_STATUSES] },
  ]
}

export async function getWorkHistoryFilters(): Promise<FilterConfig[]> {
  const [projectOptions, skillOptions] = await Promise.all([
    getProjectNameOptions(),
    getSkillNameOptions(),
  ])
  return [
    { key: 'date', label: 'Date Range', options: [] },
    { key: 'project', label: 'Project', options: projectOptions },
    { key: 'technology', label: 'Technology', options: skillOptions },
    { key: 'status', label: 'Status', options: [...EOD_STATUSES] },
    { key: 'workType', label: 'Type of Work', options: [...WORK_TYPES] },
  ]
}
