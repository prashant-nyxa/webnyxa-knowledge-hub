export type DatePreset = 'today' | 'week' | '30' | 'custom' | ''

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getDatePresetRange(preset: Exclude<DatePreset, 'custom' | ''>): {
  dateFrom: string
  dateTo: string
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateTo = toDateInput(today)

  if (preset === 'today') {
    return { dateFrom: dateTo, dateTo }
  }

  if (preset === 'week') {
    const from = new Date(today)
    const day = from.getDay()
    const diff = day === 0 ? 6 : day - 1
    from.setDate(from.getDate() - diff)
    return { dateFrom: toDateInput(from), dateTo }
  }

  const from = new Date(today)
  from.setDate(from.getDate() - 29)
  return { dateFrom: toDateInput(from), dateTo }
}

export function detectDatePreset(dateFrom: string, dateTo: string): DatePreset {
  if (!dateFrom && !dateTo) return ''
  for (const preset of ['today', 'week', '30'] as const) {
    const range = getDatePresetRange(preset)
    if (range.dateFrom === dateFrom && range.dateTo === dateTo) return preset
  }
  return 'custom'
}
