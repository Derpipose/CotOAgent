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

const createTemporaryUserMessage = (message: string): ChatMessage => ({
  id: -1,
  sender: 'user',
  message,
  createdAt: new Date().toISOString(),
})

const updateMessagesWithResponse = (
  previousMessages: ChatMessage[],
  responseData: Awaited<ReturnType<typeof sendAiMessageWithLoop>>
): ChatMessage[] => {
  const baseMessages = previousMessages.slice(0, -1)

  if (isValidMessage(responseData.userMessage.message)) {
    baseMessages.push(responseData.userMessage)
  } else {
    baseMessages.push(previousMessages[previousMessages.length - 1])
  }

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
  
  const [pendingTool, setPendingTool] = useState<Record<string, unknown> | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatState.messages])

  // Monitor for pending tool confirmations
  useEffect(() => {
    const handlePendingConfirmation = (event: CustomEvent) => {
      const pending = event.detail
      if (pending) {
        setPendingTool(pending)
        setShowConfirmation(true)
      }
    }

    window.addEventListener('pendingToolConfirmation', handlePendingConfirmation as EventListener)

    return () => {
      window.removeEventListener('pendingToolConfirmation', handlePendingConfirmation as EventListener)
    }
  }, [])

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

    chatState.addMessage(createTemporaryUserMessage(userMessage))

    chatState.setIsLoading(true)

    try {
      await saveUserMessage(chatState.conversationId, userEmail || '', userMessage)

      const data = await sendAiMessageWithLoop(chatState.conversationId, userEmail || '', userMessage)

      if (data.aiResponse.message === 'CONFIRMATION_DENIED') {
        setShowConfirmation(false)
        setPendingTool(null)
        return
      }

      chatState.setMessages((prev) => updateMessagesWithResponse(prev, data))
    } finally {
      chatState.setIsLoading(false)
    }
  }

  const handleConfirmToolCall = () => {
    setShowConfirmation(false)
    setPendingTool(null)
    ;(window as unknown as Record<string, unknown>).__pendingToolConfirmation = null
    ;((window as unknown as Record<string, (arg: boolean) => void>).__toolConfirmationResolver)?.(true)
  }

  const handleDenyToolCall = async () => {
    setShowConfirmation(false)
    
    const deniedToolName = pendingTool?.name as string || 'assignment'
    
    setPendingTool(null)
    ;(window as unknown as Record<string, unknown>).__pendingToolConfirmation = null
    ;((window as unknown as Record<string, (arg: boolean) => void>).__toolConfirmationResolver)?.(false)
    
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
        <h2 className="m-0 text-2xl font-semibold text-slate-100 border-b border-slate-400 pb-2.5 text-center flex-shrink-0">
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
