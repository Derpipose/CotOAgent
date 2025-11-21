/**
 * Character utility functions for formatting and stat evaluation
 */

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getStatColor = (statValue: number): string => {
  if (statValue >= 16) return 'stat-excellent'
  if (statValue >= 13) return 'stat-good'
  if (statValue >= 10) return 'stat-average'
  return 'stat-poor'
}
