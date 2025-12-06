import type { ConversationResponse, MessageResponse } from './types'
import { executeTool, tools } from './ToolCalls'
import { handleApiError } from './utils/apiErrorHandler'
import { API_CONFIG } from './config/constants'

const API_BASE_URL = API_CONFIG.BASE_URL

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
    await handleApiError(response, 'Failed to create chat conversation')
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
    await handleApiError(response, 'Failed to save user message')
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
    await handleApiError(response, 'Failed to save tool call')
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
    await handleApiError(response, 'Failed to save tool result')
  }
}

/**
 * Internal function that handles the agentic loop
 * Continues automatically until there are no more tool calls
 */
export async function sendAiMessageWithLoop(
  conversationId: string,
  userEmail: string,
  message: string,
  toolResults?: unknown[]
): Promise<MessageResponse> {
  const requestBody: Record<string, unknown> = {
    message,
    tools,
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
    console.log('[ChatAPI] Processing tool calls:', data.toolCall.map((t: any) => ({ name: t.name, id: t.id })))
    
    // Collect all tool results from this batch
    const results: unknown[] = []
    const confirmationTools = ['assign_character_race', 'assign_character_class', 'assign_character_stats', 'submit_character_for_approval']
    
    // Save tool calls and execute them
    for (const tool of data.toolCall) {
      // Use the tool ID from the AI response, or generate one as fallback
      const toolId = tool.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Save tool call to database
      await saveToolCall(conversationId, userEmail, toolId, tool)
      
      // Check if this is a tool that requires user confirmation
      console.log('[ChatAPI] Checking tool:', tool.name, 'Needs confirmation?', confirmationTools.includes(tool.name))
      
      if (confirmationTools.includes(tool.name)) {
        // Request user confirmation and pause the agentic loop
        console.log('[ChatAPI] Requesting confirmation for:', tool.name)
        const userConfirmed = await requestUserConfirmation(tool)
        console.log('[ChatAPI] Confirmation result:', userConfirmed)
        
        if (!userConfirmed) {
          // User denied the assignment - save the denial and return immediately
          // Don't execute the tool, just return to trigger resumeAfterDenial in the component
          return {
            userMessage: { id: 0, sender: 'user', message: '', createdAt: new Date().toISOString() },
            aiResponse: { id: 0, sender: 'system', message: 'CONFIRMATION_DENIED', createdAt: new Date().toISOString() }
          }
        }
        // If confirmed, continue with execution below
      }

      // Execute the tool with the toolId
      const result = await executeTool(
        tool.name,
        tool.parameters.properties,
        userEmail,
        toolId
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

/**
 * Hold the conversation and request user confirmation for a tool call
 * @param tool - The tool call object containing name and parameters
 * @returns Promise with user's confirmation decision
 */
export const requestUserConfirmation = async (
  tool: Record<string, unknown>
): Promise<boolean> => {
  return new Promise((resolve) => {
    // This will be called by the component that uses chatAPI
    // The component will handle showing the UI and resolving this promise
    // Store the resolver and tool for later use
    ;(window as any).__toolConfirmationResolver = resolve
    ;(window as any).__pendingToolConfirmation = tool
    ;(window as any).__deniedToolName = null // Reset when requesting new confirmation
  })
}

/**
 * Resume the agentic loop after user denies a tool call
 * @param conversationId - The conversation ID
 * @param userEmail - The email of the user
 * @param deniedToolName - The name of the tool that was denied
 * @returns Promise with the AI's response
 */
export const resumeAfterDenial = async (
  conversationId: string,
  userEmail: string,
  deniedToolName: string = 'assignment'
): Promise<MessageResponse> => {
  // Create a dynamic message based on which tool was denied
  const denialMessages: Record<string, string> = {
    'assign_character_race': 'User denied the race assignment. Ask what they would like to do instead.',
    'assign_character_class': 'User denied the class assignment. Ask what they would like to do instead.',
    'assign_character_stats': 'User denied the stats assignment. Ask what they would like to do instead.',
    'submit_character_for_approval': 'User denied submitting the character for approval. Ask what they would like to do instead.'
  }
  
  const message = denialMessages[deniedToolName] || `User denied the ${deniedToolName}. Ask what they would like to do instead.`
  
  // Send a message back to the AI indicating the user denied the tool call
  return await sendAiMessageWithLoop(
    conversationId,
    userEmail,
    message,
    []
  )
}
