import { createLogger } from './logger'

const logger = createLogger('APIError')

export const handleApiError = async (response: Response, context: string): Promise<never> => {
  let errorData: Record<string, unknown> = {}

  try {
    errorData = await response.json()
  } catch {
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

export const isResponseError = (error: unknown): error is Error => {
  return error instanceof Error
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}
