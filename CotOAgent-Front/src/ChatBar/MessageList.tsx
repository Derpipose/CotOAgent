import React from 'react'
import type { ChatMessage } from './types'
import { renderMarkdown } from '../utils/markdownUtils'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  loadingDots: string
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  loadingDots,
  messagesEndRef,
}) => {
  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <div
          key={`${msg.sender}-${msg.id}-${msg.createdAt}`}
          className={`message ${msg.sender}`}
        >
          <div className="message-sender">
            {msg.sender === 'user'
              ? 'You'
              : msg.sender === 'system'
                ? 'System'
                : 'Chronicler'}
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
          <div className="message-content loading-indicator">{loadingDots}</div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
