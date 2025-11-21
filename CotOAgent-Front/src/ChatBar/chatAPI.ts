import type { ConversationResponse, MessageResponse } from './types'

const API_BASE_URL = '/api/chat'

/**
 * Initialize a new chat conversation
 * @param userEmail - The email of the user
 * @returns Promise with conversation ID and initial AI response
 */
export const initializeConversation = async (
  userEmail: string
): Promise<ConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[ChatAPI] Error response:', errorData)
    throw new Error(
      `Failed to create chat conversation: ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

/**
 * Send a message to the conversation
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param message - The message to send
 * @returns Promise with user and AI responses
 */
export const sendMessage = async (
  conversationId: string,
  userEmail: string,
  message: string
): Promise<MessageResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ message }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`)
  }

  return response.json()
}
