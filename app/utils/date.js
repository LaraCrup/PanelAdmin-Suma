export function formatDate(value) {
  if (!value) return '—'

  let date
  if (typeof value === 'string' && !value.includes('T')) {
    const [year, month, day] = value.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    date = new Date(value)
  }

  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
