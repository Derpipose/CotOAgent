import { useEffect, useState } from 'react'
import { LOADING_CONFIG } from './config/constants'

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
      setDotIndex((prev) => (prev + 1) % LOADING_CONFIG.DOTS.length)
    }, LOADING_CONFIG.INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isLoading])

  return LOADING_CONFIG.DOTS[dotIndex]
}
