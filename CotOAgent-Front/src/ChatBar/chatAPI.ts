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
 * Save a user message to the conversation
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param message - The message to save
 * @returns Promise with the saved message
 */
export const saveUserMessage = async (
  conversationId: string,
  userEmail: string,
  message: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages/save-user-message`,
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
    const errorData = await response.json().catch(() => ({}))
    console.error('[ChatAPI] Error saving user message:', errorData)
    throw new Error(
      `Failed to save user message: ${response.status} ${response.statusText}`
    )
  }
}

/**
 * Save a tool call to the conversation
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param toolId - Unique ID for this tool call
 * @param toolCall - The tool call data
 * @returns Promise with the saved tool call
 */
export const saveToolCall = async (
  conversationId: string,
  userEmail: string,
  toolId: string,
  toolCall: unknown
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages/save-tool-call`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ toolId, toolCall }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[ChatAPI] Error saving tool call:', errorData)
    throw new Error(
      `Failed to save tool call: ${response.status} ${response.statusText}`
    )
  }
}

/**
 * Save a tool result to the conversation
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param toolId - ID of the tool call this result is for
 * @param toolResult - The tool result data
 * @returns Promise with the saved tool result
 */
export const saveToolResult = async (
  conversationId: string,
  userEmail: string,
  toolId: string,
  toolResult: unknown
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages/save-tool-result`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ toolId, toolResult }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[ChatAPI] Error saving tool result:', errorData)
    throw new Error(
      `Failed to save tool result: ${response.status} ${response.statusText}`
    )
  }
}

/**
 * Send a message to the conversation (handles agentic loop)
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param message - The message to send
 * @returns Promise with user and final AI responses (after all tool calls are handled)
 */
export const handleAiResponseLoop = async (
  conversationId: string,
  userEmail: string,
  message: string
): Promise<MessageResponse> => {
  return await sendAiMessageWithLoop(conversationId, userEmail, message)
}

/**
 * Internal function that handles the agentic loop
 * Continues automatically until there are no more tool calls
 */
async function sendAiMessageWithLoop(
  conversationId: string,
  userEmail: string,
  message: string,
  toolResults?: unknown[]
): Promise<MessageResponse> {
  const requestBody: Record<string, unknown> = {
    message,
    tools, // Always include tools so the backend has context for all requests
  }

  // If we're sending tool results, include them and set message to empty
  // This tells the backend to continue the conversation without adding a new user message
  if (toolResults && toolResults.length > 0) {
    requestBody.toolResult = toolResults
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
    // Collect all tool results from this batch
    const results: unknown[] = []
    
    // Save tool calls and execute them
    for (const tool of data.toolCall) {
      // Use the tool ID from the AI response, or generate one as fallback
      const toolId = tool.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Save tool call to database
      await saveToolCall(conversationId, userEmail, toolId, tool)
      
      // Execute the tool with the toolId and conversationId
      const result = await executeTool(
        tool.name,
        tool.parameters.properties,
        userEmail,
        toolId,
        conversationId
      )
      console.log('[ChatAPI] Tool executed:', tool.name, 'Result:', result)
      
      // Save tool result to database
      await saveToolResult(conversationId, userEmail, toolId, result)
      
      // Collect the result
      results.push(result)
    }

    // Continue the agentic loop by sending the tool results back
    // This will recursively handle any further tool calls until we get a final response
    return await sendAiMessageWithLoop(conversationId, userEmail, '', results)
  }

  // No tool call, return the final response
  return data
}
