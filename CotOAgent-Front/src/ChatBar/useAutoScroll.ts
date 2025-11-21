import { useRef } from 'react'

/**
 * Hook that returns a ref for auto-scrolling to messages end
 */
export const useAutoScrollRef = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  return messagesEndRef
}
