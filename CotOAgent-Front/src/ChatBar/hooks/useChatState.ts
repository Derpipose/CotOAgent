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

export const useChatState = (): ChatState & ChatStateActions => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const reset = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setInputValue('')
    setIsLoading(false)
    setIsInitializing(false)
  }, [])

  return {
    conversationId,
    messages,
    inputValue,
    isLoading,
    isInitializing,
    setConversationId,
    setMessages,
    setInputValue,
    setIsLoading,
    setIsInitializing,
    addMessage,
    reset,
  }
}
