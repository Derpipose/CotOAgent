import type { ConversationResponse, MessageResponse } from './types'
import { executeTool, tools } from './ToolCalls'

const API_BASE_URL = '/api/chat'

/**
 * Check if a message has valid content
 */
export const isValidMessage = (message: string | undefined): message is string => {
  return !!message?.trim()
}

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
 * Send a message to the conversation (handles agentic loop)
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param message - The message to send
 * @returns Promise with user and final AI responses (after all tool calls are handled)
 */
export const sendMessage = async (
  conversationId: string,
  userEmail: string,
  message: string
): Promise<MessageResponse> => {
  return await sendMessageWithLoop(conversationId, userEmail, message)
}

/**
 * Internal function that handles the agentic loop
 * Continues automatically until there are no more tool calls
 */
async function sendMessageWithLoop(
  conversationId: string,
  userEmail: string,
  message: string,
  toolResult?: unknown
): Promise<MessageResponse> {
  const requestBody: Record<string, unknown> = {
    message,
    tools, // Always include tools so the backend has context for all requests
  }

  // If we're sending a tool result, include it and set message to empty
  // This tells the backend to continue the conversation without adding a new user message
  if (toolResult) {
    requestBody.toolResult = toolResult
    requestBody.message = '' // Empty message when continuing with tool result
  }

  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify(requestBody),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`)
  }

  const data = await response.json()
  console.log('[ChatAPI] Message response data:', data)

  // Handle tool calls if present in the response
  if (data.toolCall && Array.isArray(data.toolCall) && data.toolCall.length > 0) {
    const firstToolCall = data.toolCall[0]
    const toolResultValue = await executeTool(
      firstToolCall.name,
      firstToolCall.parameters.properties,
      userEmail
    )
    console.log('[ChatAPI] Tool executed:', firstToolCall.name, 'Result:', toolResultValue)

    // Continue the agentic loop by sending the tool result back
    // This will recursively handle any further tool calls until we get a final response
    return await sendMessageWithLoop(conversationId, userEmail, '', toolResultValue)
  }

  // No tool call, return the final response
  return data
}
