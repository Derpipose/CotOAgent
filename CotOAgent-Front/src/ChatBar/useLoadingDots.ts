import { useEffect, useState } from 'react'

/**
 * Hook to manage loading animation dots
 * @param isLoading - Whether the loading animation should be active
 * @returns The current loading dots string
 */
export const useLoadingDots = (isLoading: boolean): string => {
  const [loadingDots, setLoadingDots] = useState('.')

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev === '.') return '..'
        if (prev === '..') return '...'
        if (prev === '...') return '....'
        return '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  return loadingDots
}
