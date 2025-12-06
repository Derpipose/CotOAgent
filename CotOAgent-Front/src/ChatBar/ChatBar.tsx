import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import type { ChatMessage } from './types'
import { initializeConversation, sendAiMessageWithLoop, saveUserMessage, isValidMessage, resumeAfterDenial } from './chatAPI'
import { useLoadingDots } from './useLoadingDots'
import { useChatState } from './hooks/useChatState'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ToolConfirmationDialog } from './ToolConfirmationDialog'
import { MESSAGES_CONFIG, UI_CONFIG } from './config/constants'
import { createLogger } from './utils/logger'

const logger = createLogger('ChatBar')

const ERROR_MESSAGE: ChatMessage = {
  id: 0,
  sender: 'assistant',
  message: MESSAGES_CONFIG.ERROR_INITIALIZATION,
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
  responseData: Awaited<ReturnType<typeof sendAiMessageWithLoop>>
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

const ChatBar = () => {
  const { userEmail } = useAuth()
  const chatState = useChatState()
  const loadingDots = useLoadingDots(chatState.isLoading)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // State for confirmation dialog
  const [pendingTool, setPendingTool] = useState<Record<string, unknown> | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatState.messages])

  // Monitor for pending tool confirmations
  useEffect(() => {
    const checkForPendingConfirmation = () => {
      const pending = (window as any).__pendingToolConfirmation
      if (pending && !showConfirmation) {
        setPendingTool(pending)
        setShowConfirmation(true)
        // Clear the window variable after we've captured it
        ;(window as any).__pendingToolConfirmation = null
      }
    }

    const interval = setInterval(checkForPendingConfirmation, 100)

    return () => clearInterval(interval)
  }, [])

  // Initialize chat on component mount
  // We intentionally only depend on userEmail and not chatState
  // because chatState is recreated on every render and would cause infinite loops
  useEffect(() => {
    if (!userEmail) {
      logger.log('Waiting for userEmail...')
      return
    }

    let isMounted = true

    const initializeChat = async () => {
      chatState.setIsInitializing(true)
      try {
        const data = await initializeConversation(userEmail)
        if (isMounted) {
          chatState.setConversationId(data.conversationId)
          chatState.setMessages([data.initialAIResponse])
        }
      } catch (error) {
        logger.error('Error initializing chat', error)
        if (isMounted) {
          chatState.setMessages([ERROR_MESSAGE])
        }
      } finally {
        if (isMounted) {
          chatState.setIsInitializing(false)
        }
      }
    }

    initializeChat()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  const handleSendMessage = async () => {
    if (!chatState.inputValue.trim() || !chatState.conversationId || chatState.isLoading) return

    const userMessage = chatState.inputValue.trim()
    chatState.setInputValue('')

    // Add temporary user message to the UI
    chatState.addMessage(createTemporaryUserMessage(userMessage))

    chatState.setIsLoading(true)

    try {
      // Save user message first
      await saveUserMessage(chatState.conversationId, userEmail || '', userMessage)

      // Get AI response (handles agentic loop with tool calls)
      const data = await sendAiMessageWithLoop(chatState.conversationId, userEmail || '', userMessage)

      // Check if confirmation was denied
      if (data.aiResponse.message === 'CONFIRMATION_DENIED') {
        // Don't add the denial message to chat, just handle the dialog close
        setShowConfirmation(false)
        setPendingTool(null)
        return
      }

      // Update messages with AI response
      chatState.setMessages((prev) => updateMessagesWithResponse(prev, data))
    } finally {
      chatState.setIsLoading(false)
    }
  }

  const handleConfirmToolCall = () => {
    // User approved the tool call
    setShowConfirmation(false)
    setPendingTool(null)
    // Clean up window state
    ;(window as any).__pendingToolConfirmation = null
    ;(window as any).__toolConfirmationResolver?.(true)
  }

  const handleDenyToolCall = async () => {
    // User denied the tool call
    setShowConfirmation(false)
    
    // Get the tool name before clearing
    const deniedToolName = pendingTool?.name as string || 'assignment'
    
    setPendingTool(null)
    // Clean up window state
    ;(window as any).__pendingToolConfirmation = null
    ;(window as any).__toolConfirmationResolver?.(false)
    
    // Resume the conversation after denial
    try {
      chatState.setIsLoading(true)
      const data = await resumeAfterDenial(chatState.conversationId || '', userEmail || '', deniedToolName)
      chatState.setMessages((prev) => updateMessagesWithResponse(prev, data))
    } finally {
      chatState.setIsLoading(false)
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
      <aside className={`h-full w-full ${UI_CONFIG.BG_COLOR} ${UI_CONFIG.TEXT_COLOR} flex flex-col overflow-hidden border-l ${UI_CONFIG.BORDER_COLOR}`}>
        <div className={`flex flex-col h-full ${UI_CONFIG.PADDING} gap-4 min-h-0`}>
          <p className="text-gray-400">{MESSAGES_CONFIG.PLEASE_LOGIN}</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className={`h-full w-full ${UI_CONFIG.BG_COLOR} ${UI_CONFIG.TEXT_COLOR} flex flex-col overflow-hidden border-l ${UI_CONFIG.BORDER_COLOR}`}>
      <div className={`flex flex-col h-full ${UI_CONFIG.PADDING} gap-4 min-h-0`}>
        <h2 className="m-0 text-2xl font-semibold text-gray-100 border-b-2 border-blue-200 pb-2.5 text-center flex-shrink-0">
          {MESSAGES_CONFIG.HEADER_TITLE}
        </h2>

        {chatState.isInitializing ? (
          <div className="text-gray-400">{MESSAGES_CONFIG.LOADING_INITIALIZATION}</div>
        ) : (
          <>
            <MessageList
              messages={chatState.messages}
              isLoading={chatState.isLoading}
              loadingDots={loadingDots}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              inputValue={chatState.inputValue}
              isLoading={chatState.isLoading}
              onInputChange={chatState.setInputValue}
              onSend={handleSendMessage}
              onKeyDown={handleKeyDown}
            />
          </>
        )}
      </div>

      <ToolConfirmationDialog
        isOpen={showConfirmation}
        pendingTool={pendingTool}
        onConfirm={handleConfirmToolCall}
        onDeny={handleDenyToolCall}
      />
    </aside>
  )
}

export default ChatBar
