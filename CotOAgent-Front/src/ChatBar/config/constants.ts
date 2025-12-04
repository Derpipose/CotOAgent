/**
 * Chat Bar Configuration Constants
 * Centralized configuration for easy adjustment and maintenance
 */

export const LOADING_CONFIG = {
  DOTS: ['.', '..', '...', '....'] as const,
  INTERVAL_MS: 500,
} as const

export const API_CONFIG = {
  BASE_URL: '/api/chat',
  TIMEOUT_MS: 30000,
} as const

export const UI_CONFIG = {
  MESSAGE_MAX_WIDTH: 'max-w-[90%]',
  SIDEBAR_WIDTH: '400px',
  HEADER_HEIGHT: 'auto',
  PADDING: 'p-5',
  BORDER_COLOR: 'border-slate-700',
  BG_COLOR: 'bg-slate-800',
  TEXT_COLOR: 'text-gray-200',
} as const

export const MESSAGES_CONFIG = {
  ERROR_INITIALIZATION: 'Failed to initialize chat. Please refresh the page and try again.',
  LOADING_INITIALIZATION: 'Initializing chat...',
  PLEASE_LOGIN: 'Please log in to use chat',
  HEADER_TITLE: 'Chronicler',
} as const

export const CHAT_CONFIG = {
  SEND_BUTTON_IDLE: '→',
  SEND_BUTTON_LOADING: '...',
  PLACEHOLDER: 'Type your message...',
} as const
