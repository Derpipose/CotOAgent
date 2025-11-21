export interface ChatMessage {
  id: number
  sender: 'user' | 'ai' | 'system'
  message: string
  createdAt: string
}

export interface ConversationResponse {
  conversationId: string
  initialAIResponse: ChatMessage
}

export interface MessageResponse {
  userMessage: ChatMessage
  aiResponse: ChatMessage
}
