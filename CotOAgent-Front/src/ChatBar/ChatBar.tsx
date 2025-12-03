import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import type { ChatMessage } from './types'
import { initializeConversation, handleAiResponseLoop, saveUserMessage, isValidMessage } from './chatAPI'
import { useLoadingDots } from './useLoadingDots'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface ChatBarProps {
  // onCollapsedChange removed - no longer needed
}

const ERROR_MESSAGE: ChatMessage = {
  id: 0,
  sender: 'assistant',
  message: 'Failed to initialize chat. Please refresh the page and try again.',
  createdAt: new Date().toISOString(),
}

// Helper function to create a temporary user message
const createTemporaryUserMessage = (message: string): ChatMessage => ({
  id: -1,
  sender: 'user',
  message,
  createdAt: new Date().toISOString(),
})

// Helper function to update messages after API response
const updateMessagesWithResponse = (
  previousMessages: ChatMessage[],
  responseData: Awaited<ReturnType<typeof handleAiResponseLoop>>
): ChatMessage[] => {
  // Start with all messages except the temporary user message
  const baseMessages = previousMessages.slice(0, -1)

  // Add the user message if it has content
  if (isValidMessage(responseData.userMessage.message)) {
    baseMessages.push(responseData.userMessage)
  } else {
    // Keep the temporary user message from earlier
    baseMessages.push(previousMessages[previousMessages.length - 1])
  }

  // Add the AI response if it has content
  if (isValidMessage(responseData.aiResponse.message)) {
    baseMessages.push(responseData.aiResponse)
  }

  return baseMessages
}

const ChatBar = ({}: ChatBarProps) => {
  const { userEmail } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const loadingDots = useLoadingDots(isLoading)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chat on component mount
  useEffect(() => {
    if (!userEmail) {
      console.log('[ChatBar] Waiting for userEmail...')
      return
    }

    let isMounted = true

    const initializeChat = async () => {
      setIsInitializing(true)
      try {
        const data = await initializeConversation(userEmail)
        if (isMounted) {
          setConversationId(data.conversationId)
          setMessages([data.initialAIResponse])
        }
      } catch (error) {
        console.error('[ChatBar] Error initializing chat:', error)
        if (isMounted) {
          setMessages([ERROR_MESSAGE])
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    initializeChat()

    return () => {
      isMounted = false
    }
  }, [userEmail])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Add temporary user message to the UI
    setMessages((prev) => [...prev, createTemporaryUserMessage(userMessage)])

    setIsLoading(true)

    try {
      // Save user message first
      await saveUserMessage(conversationId, userEmail || '', userMessage)
      
      // Get AI response (handles agentic loop with tool calls)
      const data = await handleAiResponseLoop(conversationId, userEmail || '', userMessage)

      // Update messages with AI response
      setMessages((prev) => updateMessagesWithResponse(prev, data))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!userEmail) {
    return (
      <aside className="h-full w-full bg-slate-800 text-gray-200 flex flex-col overflow-hidden border-l border-slate-700">
        <div className="flex flex-col h-full p-5 gap-4 min-h-0">
          <p className="text-gray-400">Please log in to use chat</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="h-full w-full bg-slate-800 text-gray-200 flex flex-col overflow-hidden border-l border-slate-700">
      <div className="flex flex-col h-full p-5 gap-4 min-h-0">
        <h2 className="m-0 text-2xl font-semibold text-gray-100 border-b-2 border-blue-500 pb-2.5 text-center flex-shrink-0">Chronicler</h2>

        {isInitializing ? (
          <div className="text-gray-400">Initializing chat...</div>
        ) : (
          <>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              loadingDots={loadingDots}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              inputValue={inputValue}
              isLoading={isLoading}
              onInputChange={setInputValue}
              onSend={handleSendMessage}
              onKeyDown={handleKeyDown}
            />
          </>
        )}
      </div>
    </aside>
  )
}

export default ChatBar
