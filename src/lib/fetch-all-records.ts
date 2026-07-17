export async function fetchAllRecords<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<T[]> {
  const searchParams = new URLSearchParams()
  Object.entries({ ...params, page: 1, pageSize: 10000 }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      searchParams.set(key, String(value))
    }
  })

  const response = await fetch(`${endpoint}?${searchParams.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch export data')
  const result = await response.json()
  return result.data as T[]
}
