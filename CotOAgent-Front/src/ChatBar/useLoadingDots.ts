import { useEffect, useState } from 'react'

const DOTS = ['.', '..', '...', '....']

/**
 * Hook to manage loading animation dots
 * @param isLoading - Whether the loading animation should be active
 * @returns The current loading dots string
 */
export const useLoadingDots = (isLoading: boolean): string => {
  const [dotIndex, setDotIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % DOTS.length)
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  return DOTS[dotIndex]
}
