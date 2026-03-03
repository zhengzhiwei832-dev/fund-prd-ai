export interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface KimiResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callKimi(messages: KimiMessage[]): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  const apiUrl = process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions';

  if (!apiKey) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const data: KimiResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}
