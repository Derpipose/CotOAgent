import React from 'react'
import { CHAT_CONFIG } from './config/constants'

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
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input-textarea"
          placeholder={CHAT_CONFIG.PLACEHOLDER}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          rows={3}
        />
        <button
          className="chat-input-send-button"
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
          title="Send message (Enter + Shift for new line)"
        >
          {isLoading ? CHAT_CONFIG.SEND_BUTTON_LOADING : CHAT_CONFIG.SEND_BUTTON_IDLE}
        </button>
      </div>
    </div>
  )
}
