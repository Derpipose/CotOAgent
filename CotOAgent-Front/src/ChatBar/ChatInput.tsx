import React from 'react'

interface ChatInputProps {
  inputValue: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  isLoading,
  onInputChange,
  onSend,
  onKeyDown,
}) => {
  return (
    <div className="chat-input-area">
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
          title="Send message (Enter)"
        >
          {isLoading ? '...' : '→'}
        </button>
      </div>
    </div>
  )
}
