/**
 * Create a logger instance with a specific context
 * Provides consistent logging format across the chat bar
 * @param context - The context name (e.g., 'ChatBar', 'ToolCalls', 'ChatAPI')
 */
export const createLogger = (context: string) => ({
  log: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.log(`[${context}] ${message}`, data)
    } else {
      console.log(`[${context}] ${message}`)
    }
  },

  error: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.error(`[${context}] ${message}`, data)
    } else {
      console.error(`[${context}] ${message}`)
    }
  },

  warn: (message: string, data?: unknown): void => {
    if (data !== undefined) {
      console.warn(`[${context}] ${message}`, data)
    } else {
      console.warn(`[${context}] ${message}`)
    }
  },

  debug: (message: string, data?: unknown): void => {
    if (import.meta.env.DEV) {
      if (data !== undefined) {
        console.debug(`[${context}] ${message}`, data)
      } else {
        console.debug(`[${context}] ${message}`)
      }
    }
  },
})

export type Logger = ReturnType<typeof createLogger>
