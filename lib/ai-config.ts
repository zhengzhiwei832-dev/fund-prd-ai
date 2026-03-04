export interface AIProvider {
  id: string;
  name: string;
  logo: string;
  apiUrl: string;
  modelOptions: string[];
  defaultModel: string;
  docsUrl: string;
  keyPlaceholder: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    logo: '🌙',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    modelOptions: ['kimi-k2.5', 'kimi-k2.5-32k', 'kimi-k2.5-128k'],
    defaultModel: 'kimi-k2.5',
    docsUrl: 'https://platform.moonshot.cn/docs/guide/kimi-k2-5-quickstart',
    keyPlaceholder: 'sk-xxxxxxxx',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '🤖',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    modelOptions: ['gpt-5.2', 'gpt-5-mini', 'o3', 'o4-mini', 'gpt-4.1', 'gpt-4o'],
    defaultModel: 'gpt-5-mini',
    docsUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-xxxxxxxx',
  },
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    logo: '🧠',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    modelOptions: [
      'claude-opus-4-202505',
      'claude-sonnet-4-202505',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
    ],
    defaultModel: 'claude-sonnet-4-202505',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-api03-xxxxxxxx',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '🐋',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    modelOptions: ['deepseek-v3.1', 'deepseek-v3.2', 'deepseek-r1-0528', 'deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-v3.1',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    keyPlaceholder: 'sk-xxxxxxxx',
  },
  {
    id: 'qwen',
    name: '通义千问 (Aliyun)',
    logo: '🌟',
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    modelOptions: ['qwen3.5-plus', 'qwen3-max', 'qwen-plus', 'qwen-turbo', 'qwen-max'],
    defaultModel: 'qwen3.5-plus',
    docsUrl: 'https://dashscope.console.aliyun.com/apiKey',
    keyPlaceholder: 'sk-xxxxxxxx',
  },
  {
    id: 'baidu',
    name: '文心一言 (Baidu)',
    logo: '📝',
    apiUrl: 'https://qianfan.baidubce.com/v2/chat/completions',
    modelOptions: ['ernie-5.0', 'ernie-x1.1', 'ernie-4.5', 'ernie-speed', 'ernie-tiny'],
    defaultModel: 'ernie-5.0',
    docsUrl: 'https://console.bce.baidu.com/qianfan/modelcenter/model/buildIn/list',
    keyPlaceholder: 'Bearer xxxxxxxx',
  },
];

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callAIAPI(
  provider: AIProvider,
  apiKey: string,
  model: string,
  messages: AIMessage[]
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: Record<string, unknown>;

  switch (provider.id) {
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model,
        max_tokens: 4000,
        messages: messages.map(m => ({ role: m.role, content: m.content })).filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content || '',
      };
      break;

    case 'qwen':
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        input: {
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        },
        parameters: {
          result_format: 'message',
          max_tokens: 4000,
        },
      };
      break;

    case 'kimi':
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages,
        max_tokens: 4000,
      };
      break;

    default:
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      };
  }

  const response = await fetch(provider.apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const data = await response.json();

  // Parse different response formats
  switch (provider.id) {
    case 'anthropic':
      return data.content?.[0]?.text || '';
    case 'qwen':
      return data.output?.choices?.[0]?.message?.content || '';
    default:
      return data.choices?.[0]?.message?.content || '';
  }
}
