import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import type { ChatMessage } from './types'
import { initializeConversation, sendUserMessage, saveUserMessage, isValidMessage } from './chatAPI'
import { useLoadingDots } from './useLoadingDots'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import '../css/chatbar.css'

interface ChatBarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void
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
  responseData: Awaited<ReturnType<typeof sendUserMessage>>
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

const ChatBar = ({ onCollapsedChange }: ChatBarProps) => {
  const { userEmail } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const loadingDots = useLoadingDots(isLoading)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Notify parent when collapsed state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

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

    // Save User Message First
    await saveUserMessage(conversationId, userEmail || '', userMessage)

    try {
      // Get The AI Response Next
      // const aiResponseData = await getAIResponse(conversationId, userEmail || '', userMessage)
      // console.log('AI Response Data:', aiResponseData)

      // Old Method: Send and Save in One Call and loop in a dirty backend way
      const data = await sendUserMessage(conversationId, userEmail || '', userMessage)

      // updateMessagesWithResponse handles the agentic loop internally (tool calls are hidden)
      // Only the final response is returned and displayed
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
      <aside className="chatbar">
        <div className="chatbar-content">
          <p className="chat-login-message">Please log in to use chat</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className={`chatbar ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className={`chatbar-toggle ${isCollapsed ? 'active' : ''}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle chat"
      >
        {isCollapsed ? '↑' : '↓'}
      </button>
      {isCollapsed && <div className="chatbar-collapsed-label">AI Agent</div>}
      <div className="chatbar-content">
        <h2 className="chatbar-title">Chronicler</h2>

        {isInitializing ? (
          <div className="chat-loading">Initializing chat...</div>
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
