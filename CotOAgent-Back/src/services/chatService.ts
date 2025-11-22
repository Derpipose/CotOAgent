import type { SendMessageResponseDto, CreateConversationResponseDto, ChatMessageDto } from '../DTOS/ChatDto.js';
import * as chatDatabase from '../controllers/chat/chatDatabase.js';

// AI Service Configuration
const AI_CONFIG = {
  BASE_URL: process.env.AI_SERVER || 'https://ai-snow.reindeer-pinecone.ts.net/api/chat/completions',
  MODEL: 'gpt-oss-120b',
  TIMEOUT_MS: 90000, // 90 seconds
  TOKEN: process.env.AIToken || process.env.AI_TOKEN || '',
};

console.log('[ChatService] AI_CONFIG:', {
  BASE_URL: AI_CONFIG.BASE_URL,
  MODEL: AI_CONFIG.MODEL,
  TIMEOUT_MS: AI_CONFIG.TIMEOUT_MS,
  HAS_TOKEN: !!AI_CONFIG.TOKEN,
});

// System prompt for the AI
const SYSTEM_PROMPT = `You are a very friendly and helpful Chronicler, or game master, for the game Chronicles of the Omuns. You are here to help players build characters for the game using different documents around the site. Be mindful that this isn't dungeons and dragons, but it is a TTRPG.`;

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface AIRequestBody {
  model: string;
  messages: AIMessage[];
  tools?: Array<{
    type: string;
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}

/**
 * Call the local LLM AI service
 */
async function callAI(messages: AIMessage[], tools?: Tool[]): Promise<{ text: string; toolCall?: Tool[] }> {
  const requestBody: AIRequestBody = {
    model: AI_CONFIG.MODEL,
    messages,
  };

  // Include tools if provided - format them in OpenAI/API format
  if (tools && tools.length > 0) {
    requestBody.tools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  // Choose endpoint
  const endpoint = AI_CONFIG.BASE_URL;
  const isUsingToolsEndpoint = (tools && tools.length > 0);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

  try {
    console.log('[ChatService] Calling AI at:', endpoint);
    console.log('[ChatService] Using tools endpoint:', isUsingToolsEndpoint);
    console.log('[ChatService] Token available:', !!AI_CONFIG.TOKEN);
    console.log('[ChatService] Tools provided:', tools?.length ?? 0);
    console.log('[ChatService] Request body:', JSON.stringify(requestBody, null, 2));
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is available
    if (AI_CONFIG.TOKEN) {
      headers['Authorization'] = `Bearer ${AI_CONFIG.TOKEN}`;
      console.log('[ChatService] Authorization header added');
    } else {
      console.log('[ChatService] WARNING: No token available!');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error body');
      console.error('[ChatService] AI service error response status:', response.status);
      console.error('[ChatService] AI service error response body:', errorText);
      throw new Error(`AI service returned status ${response.status}`);
    }

    const responseText = await response.text();
    console.error('[ChatService] ===== AI RESPONSE START =====');
    console.error('[ChatService] Response length:', responseText.length);
    console.error('[ChatService] Response text:', responseText.substring(0, 1000));
    console.error('[ChatService] ===== AI RESPONSE END =====');
    
    if (!responseText || responseText.length === 0) {
      console.error('[ChatService] Empty response from AI service');
      throw new Error('AI service returned empty response');
    }
    
    let data: AIResponse;
    try {
      data = JSON.parse(responseText) as AIResponse;
    } catch (parseError) {
      console.error('[ChatService] Failed to parse AI response as JSON');
      console.error('[ChatService] Parse error:', parseError instanceof Error ? parseError.message : String(parseError));
      throw new Error(`AI service returned invalid JSON: ${response.status}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid response from AI service');
    }

    const choice = data.choices[0];
    if (!choice || !choice.message) {
      throw new Error('Invalid response from AI service');
    }

    const aiMessage = choice.message.content?.trim() || '';

    // Check if AI made a tool call
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall && toolCall.function) {
        console.log('[ChatService] Tool call detected:', toolCall.function.name);

        // Parse the arguments string into an object
        let parsedArguments: Record<string, unknown> = {};
        try {
          parsedArguments = JSON.parse(toolCall.function.arguments);
        } catch {
          console.error('[ChatService] Failed to parse tool arguments:', toolCall.function.arguments);
        }

        return {
          text: aiMessage || '', // Don't include a default message, let the frontend handle the tool call
          toolCall: [
            {
              name: toolCall.function.name,
              description: 'Tool call from AI',
              parameters: {
                type: 'object',
                properties: parsedArguments,
              },
            },
          ],
        };
      }
    }

    // Return even if message is empty (AI might not have anything to say after tool execution)
    return { text: aiMessage };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`AI service timeout after ${AI_CONFIG.TIMEOUT_MS}ms`);
    }
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to connect to AI service at ${endpoint}: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Send a message and get AI response
 * Handles the complete agentic loop on the backend - frontend gets final response only
 */
export async function sendMessageAndGetResponse(
  conversationId: string,
  userMessage: string,
  tools?: Tool[],
  toolResult?: unknown
): Promise<SendMessageResponseDto> {
  // Validate that either a user message or tool result is provided
  if ((!userMessage || userMessage.trim().length === 0) && !toolResult) {
    throw new Error('Either a message or toolResult must be provided');
  }

  // Get conversation history (includes system prompt from initialization)
  const history = await chatDatabase.getConversationHistory(conversationId);

  // Build message context for AI from history
  const messages: AIMessage[] = history.map((msg) => ({
    role: msg.sender as 'system' | 'user' | 'assistant',
    content: msg.message,
  }));

  // If this is a tool result response, add it as an assistant message
  if (toolResult) {
    messages.push({
      role: 'assistant',
      content: `Tool result: ${JSON.stringify(toolResult)}`,
    });
  }

  // Add the new user message only if there's actual message content (not a tool continuation)
  if (userMessage.trim()) {
    messages.push({
      role: 'user',
      content: userMessage.trim(),
    });
  }

  // Only save user message to database if it's not a tool result continuation
  let savedUserMessage: ChatMessageDto | null = null;
  if (!toolResult && userMessage.trim()) {
    savedUserMessage = await chatDatabase.addMessageToConversation(
      conversationId,
      'user',
      userMessage
    );
  }

  // Call AI and get response
  // Only pass tools on initial user messages, not on tool result continuations
  const aiResponse = await callAI(messages, toolResult ? undefined : tools);

  // Only save AI response to database if there's actual message content
  let savedAIResponse: ChatMessageDto | null = null;
  if (aiResponse.text) {
    savedAIResponse = await chatDatabase.addMessageToConversation(
      conversationId,
      'ai',
      aiResponse.text
    );
  }

  // Build response - during tool continuations, omit the user message from response
  const response: SendMessageResponseDto & { toolCall?: Tool[] } = {
    userMessage: toolResult
      ? {
          // During tool continuation, return empty user message (will be hidden by frontend)
          id: 0,
          sender: 'user',
          message: '',
          createdAt: new Date(),
        }
      : savedUserMessage || {
          id: 0,
          sender: 'user',
          message: userMessage,
          createdAt: new Date(),
        },
    aiResponse: savedAIResponse || {
      id: 0,
      sender: 'ai',
      message: aiResponse.text || '',
      createdAt: new Date(),
    },
    conversationId,
  };

  // Include tool call if present
  if (aiResponse.toolCall) {
    response.toolCall = aiResponse.toolCall;
  }

  return response;
}

/**
 * Initialize a new chat conversation with system prompt and prefab greeting
 */
export async function initializeChat(
  conversationId: string,
  conversationName: string
): Promise<CreateConversationResponseDto> {
  const initialGreeting = "Hello, I am the Chronicler AI Agent! How can I help you set up your new character?";

  // Save system prompt to database once on initialization
  await chatDatabase.addMessageToConversation(
    conversationId,
    'system',
    SYSTEM_PROMPT
  );

  // Add a 1 second delay to make it look like the AI is thinking
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    conversationId,
    conversationName,
    initialAIResponse: {
      id: 0,
      message: initialGreeting,
      sender: 'ai',
      createdAt: new Date(),
    },
  };
}
