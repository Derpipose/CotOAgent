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
    <div className="flex flex-col gap-2 flex-shrink-0">
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 p-3 rounded-lg bg-white text-slate-700 placeholder-gray-400 border border-gray-300 focus:border-gray-400 focus:outline-none resize-none min-h-24"
          placeholder={CHAT_CONFIG.PLACEHOLDER}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          rows={3}
        />
        <button
          className="px-4 py-3 rounded-lg bg-indigo-200 hover:bg-indigo-300 text-slate-600 font-semibold border border-indigo-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
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
