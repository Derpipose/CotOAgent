import type { ConversationResponse, MessageResponse } from './types'
import { executeTool, tools } from './ToolCalls'
import { handleApiError } from './utils/apiErrorHandler'
import { API_CONFIG } from './config/constants'

const API_BASE_URL = API_CONFIG.BASE_URL

export const isValidMessage = (message: string | undefined): message is string => {
  return !!message?.trim()
}

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

  if (toolResults && toolResults.length > 0) {
    requestBody.toolResult = toolResults
    requestBody.message = ''
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

  if (data.toolCall && Array.isArray(data.toolCall) && data.toolCall.length > 0) {
    console.log('[ChatAPI] Processing tool calls:', data.toolCall.map((t: unknown) => {
      const tool = t as Record<string, unknown>
      return { name: tool.name, id: tool.id }
    }))
    
    const results: unknown[] = []
    const confirmationTools = ['assign_character_race', 'assign_character_class', 'assign_character_stats', 'submit_character_for_approval']
    
    for (const tool of data.toolCall) {
      const toolId = tool.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      await saveToolCall(conversationId, userEmail, toolId, tool)
      
      console.log('[ChatAPI] Checking tool:', tool.name, 'Needs confirmation?', confirmationTools.includes(tool.name))
      
      if (confirmationTools.includes(tool.name)) {
        console.log('[ChatAPI] Requesting confirmation for:', tool.name)
        const userConfirmed = await requestUserConfirmation(tool)
        console.log('[ChatAPI] Confirmation result:', userConfirmed)
        
        if (!userConfirmed) {
          return {
            userMessage: { id: 0, sender: 'user', message: '', createdAt: new Date().toISOString() },
            aiResponse: { id: 0, sender: 'system', message: 'CONFIRMATION_DENIED', createdAt: new Date().toISOString() }
          }
        }
      }

      const result = await executeTool(
        tool.name,
        tool.parameters.properties,
        userEmail,
        toolId
      )
      console.log('[ChatAPI] Tool executed:', tool.name, 'Result:', result)
      
      await saveToolResult(conversationId, userEmail, toolId, result)
      
      results.push(result)
    }

    return await sendAiMessageWithLoop(conversationId, userEmail, '', results)
  }

  return data
}

export const requestUserConfirmation = async (
  tool: Record<string, unknown>
): Promise<boolean> => {
  return new Promise((resolve) => {
    ;(window as unknown as Record<string, (val: boolean) => void>).__toolConfirmationResolver = resolve
    ;(window as unknown as Record<string, Record<string, unknown>>).__pendingToolConfirmation = tool
    ;(window as unknown as Record<string, null>).__deniedToolName = null
  })
}

export const resumeAfterDenial = async (
  conversationId: string,
  userEmail: string,
  deniedToolName: string = 'assignment'
): Promise<MessageResponse> => {
  const denialMessages: Record<string, string> = {
    'assign_character_race': 'User denied the race assignment. Ask what they would like to do instead.',
    'assign_character_class': 'User denied the class assignment. Ask what they would like to do instead.',
    'assign_character_stats': 'User denied the stats assignment. Ask what they would like to do instead.',
    'submit_character_for_approval': 'User denied submitting the character for approval. Ask what they would like to do instead.'
  }
  
  const message = denialMessages[deniedToolName] || `User denied the ${deniedToolName}. Ask what they would like to do instead.`
  
  return await sendAiMessageWithLoop(
    conversationId,
    userEmail,
    message,
    []
  )
}
