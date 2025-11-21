import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAuth } from '../context/useAuth'
import '../css/chatbar.css'

interface ChatMessage {
  id: number
  sender: 'user' | 'ai' | 'system'
  message: string
  createdAt: string
}

// Function to render markdown with sanitized HTML
const renderMarkdown = (markdown: string): string => {
  const html = marked(markdown) as string
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'] })
}

const ChatBar = () => {
  const { userEmail } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [loadingDots, setLoadingDots] = useState('.')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Loading animation effect
  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev === '.') return '..'
        if (prev === '..') return '...'
        if (prev === '...') return '....'
        return '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail,
          },
          body: JSON.stringify({}),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('[ChatBar] Error response:', errorData)
          throw new Error(
            `Failed to create chat conversation: ${response.status} ${response.statusText}`
          )
        }

        const data = await response.json()
        if (isMounted) {
          setConversationId(data.conversationId)
          setMessages([data.initialAIResponse])
        }
      } catch (error) {
        console.error('[ChatBar] Error initializing chat:', error)
        if (isMounted) {
          setMessages([
            {
              id: 0,
              sender: 'ai',
              message:
                'Failed to initialize chat. Please refresh the page and try again.',
              createdAt: new Date().toISOString(),
            },
          ])
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
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail || '',
          },
          body: JSON.stringify({ message: userMessage }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={`${msg.sender}-${msg.id}-${msg.createdAt}`}
                  className={`message ${msg.sender}`}
                >
                  <div className="message-sender">
                    {msg.sender === 'user' ? 'You' : msg.sender === 'system' ? 'System' : 'Chronicler'}
                  </div>
                  {msg.sender === 'user' ? (
                    <div className="message-content">{msg.message}</div>
                  ) : (
                    <div
                      className="message-content"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.message),
                      }}
                    />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="message ai">
                  <div className="message-sender">Chronicler</div>
                  <div className="message-content loading-indicator">
                    {loadingDots}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  title="Send message (Enter)"
                >
                  {isLoading ? '...' : '→'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

export default ChatBar
