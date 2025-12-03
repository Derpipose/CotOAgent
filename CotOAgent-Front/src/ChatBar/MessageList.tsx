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
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 mb-2.5 min-h-0">
      {messages.map((msg) => (
        <div
          key={`${msg.sender}-${msg.id}-${msg.createdAt}`}
          className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {msg.sender === 'user'
              ? 'You'
              : msg.sender === 'system'
                ? 'System'
                : 'Chronicler'}
          </div>
          {msg.sender === 'user' ? (
            <div className="max-w-[90%] p-2.5 rounded-lg bg-blue-600 text-white text-sm break-words">{msg.message}</div>
          ) : (
            <div
              className="max-w-[90%] p-2.5 rounded-lg bg-slate-700 text-gray-100 text-sm prose prose-sm prose-invert"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(msg.message),
              }}
            />
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex flex-col gap-1 items-start">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Chronicler</div>
          <div className="max-w-[90%] p-2.5 rounded-lg bg-slate-700 text-gray-100 text-sm">{loadingDots}</div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
