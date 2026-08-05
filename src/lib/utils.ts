export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const statusColors = {
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
  interview: 'bg-purple-50 text-purple-700 border-purple-200',
  attended: 'bg-teal-50 text-teal-700 border-teal-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export const statusLabels = {
  applied: 'Applied',
  reviewing: 'Under Review',
  interview: 'Interview',
  attended: 'Interview Done',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

export const typeColors = {
  'full-time': 'bg-indigo-50 text-indigo-700',
  'internship': 'bg-cyan-50 text-cyan-700',
  'part-time': 'bg-purple-50 text-purple-700',
  'contract': 'bg-orange-50 text-orange-700',
}
