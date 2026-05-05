export function getUrgency(item) {
  const now = new Date()

  if (item.deadline) {
    const deadline = new Date(item.deadline)
    if (!isNaN(deadline.getTime())) {
      const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
      if (daysLeft < 0) return null
      if (daysLeft === 0) return { label: 'Closes today', color: 'red', daysLeft }
      if (daysLeft <= 2) return { label: `Closes in ${daysLeft}d`, color: 'red', daysLeft }
      if (daysLeft <= 7) return { label: `Closes in ${daysLeft}d`, color: 'orange', daysLeft }
    }
  }

  if (item.datePosted) {
    const posted = new Date(item.datePosted)
    if (!isNaN(posted.getTime())) {
      const hoursAgo = (now - posted) / (1000 * 60 * 60)
      if (hoursAgo >= 0 && hoursAgo <= 24) {
        return { label: 'Just opened', color: 'green', daysLeft: null }
      }
    }
  }

  return null
}

export function urgencyClasses(color) {
  switch (color) {
    case 'red':
      return 'bg-red-50 text-red-700 ring-1 ring-red-100'
    case 'orange':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
    case 'green':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function urgencyRank(item) {
  const u = getUrgency(item)
  if (!u) return 999
  if (u.color === 'red') return 0 + (u.daysLeft ?? 0)
  if (u.color === 'orange') return 10 + (u.daysLeft ?? 0)
  if (u.color === 'green') return 20
  return 999
}
