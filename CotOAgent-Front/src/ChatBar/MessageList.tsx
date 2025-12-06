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
    <div className="message-list-container">
      {messages.map((msg) => (
        <div
          key={`${msg.sender}-${msg.id}-${msg.createdAt}`}
          className={`message-item-container ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className="message-sender-label">
            {msg.sender === 'user'
              ? 'You'
              : msg.sender === 'system'
                ? 'System'
                : 'Chronicler'}
          </div>
          {msg.sender === 'user' ? (
            <div className="message-bubble-user">{msg.message}</div>
          ) : (
            <div
              className="message-bubble-ai"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(msg.message),
              }}
            />
          )}
        </div>
      ))}
      {isLoading && (
        <div className="message-item-container items-start">
          <div className="message-sender-label">Chronicler</div>
          <div className="message-bubble-loading">{loadingDots}</div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
