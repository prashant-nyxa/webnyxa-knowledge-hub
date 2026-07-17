import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  )
  const search = (searchParams.get('search') ?? '').trim()
  return { page, pageSize, search, skip: (page - 1) * pageSize, take: pageSize }
}

export function parseFilterValues(searchParams: URLSearchParams, key: string): string[] {
  const raw = searchParams.get(key)
  if (!raw) return []
  return raw.split(',').map((v) => v.trim()).filter(Boolean)
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export function splitCsv(value: string | null | undefined): string[] {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

export function containsAny(haystack: string | null | undefined, needles: string[]): boolean {
  if (needles.length === 0) return true
  const items = splitCsv(haystack)
  return needles.some((needle) => items.includes(needle))
}
