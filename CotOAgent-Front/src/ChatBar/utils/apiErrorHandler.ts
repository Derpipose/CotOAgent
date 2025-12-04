import { createLogger } from './logger'

const logger = createLogger('APIError')

/**
 * Handle API error responses consistently across the chat API
 * @param response - The fetch Response object
 * @param context - Descriptive context (e.g., "Saving user message", "Fetching conversations")
 * @throws Error with formatted error message
 */
export const handleApiError = async (response: Response, context: string): Promise<never> => {
  let errorData: Record<string, unknown> = {}

  try {
    errorData = await response.json()
  } catch {
    // If JSON parsing fails, continue with empty object
  }

  const errorMessage =
    (typeof errorData.error === 'string' ? errorData.error : null) ||
    (typeof errorData.message === 'string' ? errorData.message : null) ||
    null

  logger.error(`${context} failed`, { status: response.status, errorData })

  const finalMessage = errorMessage
    ? `${context}: ${errorMessage}`
    : `${context}: ${response.status} ${response.statusText}`

  throw new Error(finalMessage)
}

/**
 * Type guard to check if an error is a Response error
 */
export const isResponseError = (error: unknown): error is Error => {
  return error instanceof Error
}

/**
 * Extract user-friendly error message from various error sources
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}
