import type { SendMessageResponseDto, ChatMessageDto } from '../../../DTOS/ChatDto.js';
import * as chatDatabase from '../../../controllers/database/chatDatabase.js';
import { callAI } from '../api/aiClient.js';
import type { AIMessage, Tool } from '../types.js';

export async function sendMessageAndGetResponse(
  conversationId: string,
  userMessage: string,
  tools?: Tool[],
  toolResult?: unknown
): Promise<SendMessageResponseDto> {
  if ((!userMessage || userMessage.trim().length === 0) && !toolResult) {
    throw new Error('Either a message or toolResult must be provided');
  }

  const history = await chatDatabase.getConversationHistory(conversationId);

  const messages: AIMessage[] = history.map((msg) => ({
    role: msg.sender as 'system' | 'user' | 'assistant',
    content: msg.message,
  }));

  if (toolResult) {
    const resultContent = Array.isArray(toolResult)
      ? toolResult.map((r) => `Tool result: ${JSON.stringify(r)}`).join('\n')
      : `Tool result: ${JSON.stringify(toolResult)}`;

    messages.push({
      role: 'user',
      content: resultContent,
    });
  }

  if (userMessage.trim()) {
    messages.push({
      role: 'user',
      content: userMessage.trim(),
    });
  }

  const aiResponse = await callAI(messages, tools);

  let savedAIResponse: ChatMessageDto | null = null;
  let aiResponseContent = aiResponse.text;

  if (aiResponse.toolCall && aiResponse.toolCall.length > 0) {
    const toolCallData = aiResponse.toolCall
      .map((tc) => JSON.stringify({ tool: tc.name, arguments: tc.parameters.properties }))
      .join('\n');
    aiResponseContent = aiResponse.text ? `${aiResponse.text}\n${toolCallData}` : toolCallData;
  }

  if (aiResponseContent) {
    savedAIResponse = await chatDatabase.addMessageToConversation(
      conversationId,
      'assistant',
      aiResponseContent
    );
  }

  const response: SendMessageResponseDto & { toolCall?: Tool[] } = {
    userMessage: toolResult
      ? {
          id: 0,
          sender: 'user',
          message: '',
          createdAt: new Date(),
        }
      : {
          id: 0,
          sender: 'user',
          message: userMessage,
          createdAt: new Date(),
        },
    aiResponse: savedAIResponse || {
      id: 0,
      sender: 'assistant',
      message: aiResponse.text || '',
      createdAt: new Date(),
    },
    conversationId,
  };

  if (aiResponse.toolCall) {
    response.toolCall = aiResponse.toolCall;
  }

  return response;
}
