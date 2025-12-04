import { useState, useCallback } from 'react'
import type { ChatMessage } from '../types'

interface ChatState {
  conversationId: string | null
  messages: ChatMessage[]
  inputValue: string
  isLoading: boolean
  isInitializing: boolean
}

interface ChatStateActions {
  setConversationId: (id: string | null) => void
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void
  setInputValue: (value: string) => void
  setIsLoading: (loading: boolean) => void
  setIsInitializing: (initializing: boolean) => void
  addMessage: (message: ChatMessage) => void
  reset: () => void
}

/**
 * Custom hook to manage chat state and provide helper methods
 * Consolidates multiple related state variables and provides convenient actions
 */
export const useChatState = (): ChatState & ChatStateActions => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  /**
   * Add a single message to the message list
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setInputValue('')
    setIsLoading(false)
    setIsInitializing(false)
  }, [])

  return {
    // State
    conversationId,
    messages,
    inputValue,
    isLoading,
    isInitializing,
    // Setters
    setConversationId,
    setMessages,
    setInputValue,
    setIsLoading,
    setIsInitializing,
    // Helper methods
    addMessage,
    reset,
  }
}
