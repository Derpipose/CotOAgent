import type { ConversationResponse, MessageResponse } from './types'

const API_BASE_URL = '/api/chat'

/**
 * Check if a message has valid content
 */
export const isValidMessage = (message: string | undefined): message is string => {
  return !!message?.trim()
}

/**
 * Define available tools that the AI can call
 */
export const tools = [
  {
    name: 'log_message',
    description: 'Logs a message to the console',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The message to log' }
      },
      required: ['message']
    }
  }
]

/**
 * Execute a tool call
 * @param toolName - The name of the tool to execute
 * @param args - The arguments for the tool
 * @returns The result of the tool execution
 */
export const executeTool = (toolName: string, args: Record<string, unknown>) => {
  if (toolName === 'log_message') {
    console.log(args.message)
    return { success: true, message: `Logged: ${args.message}` }
  }
  throw new Error(`Unknown tool: ${toolName}`)
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
 * @returns Promise with user and final AI responses
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
 */
async function sendMessageWithLoop(
  conversationId: string,
  userEmail: string,
  message: string,
  toolResult?: unknown
): Promise<MessageResponse> {
  const requestBody: Record<string, unknown> = {
    message,
  };

  // Only include tools on the initial user message (not on tool result continuations)
  if (!toolResult) {
    requestBody.tools = tools;
  }

  // If we're sending a tool result, include it and set message to empty
  // This tells the backend to continue the conversation without adding a new user message
  if (toolResult) {
    requestBody.toolResult = toolResult;
    requestBody.message = ''; // Empty message when continuing with tool result
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
    const toolResult = executeTool(firstToolCall.name, firstToolCall.parameters.properties)
    console.log('[ChatAPI] Tool executed:', firstToolCall.name, 'Result:', toolResult)

    // Continue the agentic loop by sending the tool result back
    // Pass empty string and toolResult to indicate this is a continuation
    return await sendMessageWithLoop(conversationId, userEmail, '', toolResult)
  }

  // No tool call, return the final response
  return data
}
