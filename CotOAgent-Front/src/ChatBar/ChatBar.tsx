import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import type { ChatMessage } from './types'
import { initializeConversation, sendMessage } from './chatAPI'
import { useLoadingDots } from './useLoadingDots'
import { useAutoScrollRef } from './useAutoScroll'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import '../css/chatbar.css'

const ERROR_MESSAGE: ChatMessage = {
  id: 0,
  sender: 'ai',
  message: 'Failed to initialize chat. Please refresh the page and try again.',
  createdAt: new Date().toISOString(),
}

const ChatBar = () => {
  const { userEmail } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const loadingDots = useLoadingDots(isLoading)
  const messagesEndRef = useAutoScrollRef()

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
    setMessages((prev) => [
      ...prev,
      {
        id: -1,
        sender: 'user',
        message: userMessage,
        createdAt: new Date().toISOString(),
      },
    ])

    setIsLoading(true)
    try {
      const data = await sendMessage(conversationId, userEmail || '', userMessage)
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove the temporary user message
        data.userMessage,
        data.aiResponse,
      ])
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove the failed message
      setMessages((prev) => prev.slice(0, -1))
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
    <aside className="chatbar">
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
