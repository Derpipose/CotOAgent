import { AI_CONFIG } from '../config.js';
import type { AIMessage, Tool, AIRequestBody, AIResponse } from '../types.js';

export async function callAI(
  messages: AIMessage[],
  tools?: Tool[]
): Promise<{ text: string; toolCall?: Tool[] }> {
  const requestBody: AIRequestBody = {
    model: AI_CONFIG.MODEL,
    messages,
  };

  if (tools && tools.length > 0) {
    requestBody.tools = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  const endpoint = AI_CONFIG.BASE_URL;
  const isUsingToolsEndpoint = tools && tools.length > 0;

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
      console.error(
        '[ChatService] Parse error:',
        parseError instanceof Error ? parseError.message : String(parseError)
      );
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

    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall && toolCall.function) {
        console.log('[ChatService] Tool call detected:', toolCall.function.name);

        let parsedArguments: Record<string, unknown> = {};
        try {
          parsedArguments = JSON.parse(toolCall.function.arguments);
        } catch {
          console.error('[ChatService] Failed to parse tool arguments:', toolCall.function.arguments);
        }

        return {
          text: aiMessage || '',
          toolCall: [
            {
              name: toolCall.function.name,
              description: 'Tool call from AI',
              parameters: {
                type: 'object',
                properties: parsedArguments,
              },
              id: toolCall.id,
            },
          ],
        };
      }
    }

    if (aiMessage) {
      const toolCallPattern =
        /\{\s*"tool"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*({[^}]*})\s*\}/g;
      const matches = Array.from(aiMessage.matchAll(toolCallPattern));

      if (matches.length > 0) {
        console.log('[ChatService] Detected tool call in message content:', matches.length);
        const match = matches[0];
        const toolName = match?.[1];
        const argumentsStr = match?.[2];

        if (toolName && argumentsStr) {
          const parsedArguments: Record<string, unknown> = JSON.parse(argumentsStr);

          const generatedToolId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          return {
            text: aiMessage,
            toolCall: [
              {
                name: toolName,
                description: 'Tool call from AI',
                parameters: {
                  type: 'object',
                  properties: parsedArguments,
                },
                id: generatedToolId,
              },
            ],
          };
        }
      }
    }

    return { text: aiMessage };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`AI service timeout after ${AI_CONFIG.TIMEOUT_MS}ms`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Failed to connect to AI service at ${endpoint}: ${error.message}`);
    }
    throw error;
  }
}
