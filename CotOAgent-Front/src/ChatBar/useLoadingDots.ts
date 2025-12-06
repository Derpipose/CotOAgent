import { useEffect, useState } from 'react'
import { LOADING_CONFIG } from './config/constants'

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
