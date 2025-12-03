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
    <div className="flex flex-col gap-2 flex-shrink-0">
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 p-3 rounded-lg bg-slate-700 text-gray-100 placeholder-gray-400 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          rows={1}
        />
        <button
          className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
