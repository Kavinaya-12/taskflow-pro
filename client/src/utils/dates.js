

export function getTodayKey(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


export function shiftDayKey(dayKey, days) {
  const [year, month, day] = dayKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return getTodayKey(date)
}


export function classifyDueDate(dueDate, todayKey = getTodayKey()) {
  if (!dueDate) return 'none'
  if (dueDate < todayKey) return 'overdue'
  if (dueDate === todayKey) return 'today'
  return 'upcoming'
}


export function formatDueLabel(dueDate, todayKey = getTodayKey()) {
  if (!dueDate) return ''

  const diff = dayKeyDifference(dueDate, todayKey)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff <= 6) return `In ${diff} days`
  if (diff < -1 && diff >= -6) return `${Math.abs(diff)} days ago`

  const [year, month, day] = dueDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })
}


export function dayKeyDifference(a, b) {
  const toUtcMidnight = (key) => {
    const [year, month, day] = key.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toUtcMidnight(a) - toUtcMidnight(b)) / 86400000)
}
