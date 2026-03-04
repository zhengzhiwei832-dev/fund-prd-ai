import { NextRequest, NextResponse } from 'next/server';
import { AI_PROVIDERS } from '@/lib/ai-config';
import { getKnowledgeBaseText } from '@/lib/knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { requirement, context, providerId, apiKey, model } = await request.json();

    if (!requirement || !providerId || !apiKey || !model) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      return NextResponse.json(
        { error: '未知的 AI 提供商' },
        { status: 400 }
      );
    }

    const knowledgeBase = getKnowledgeBaseText();

    const systemPrompt = `你是一位资深的公募基金科技部产品经理，擅长撰写专业的产品需求文档(PRD)。

以下是你的专业知识库，请在生成 PRD 时严格参考：

${knowledgeBase}

请根据用户的需求，生成一份专业的公募基金 PRD 文档，要求：
1. 使用标准的 PRD 结构
2. 融入公募基金行业的专业术语和业务规则
3. 明确标注需要特别注意的业务细节（如精度、时效、合规等）
4. 包含功能需求和非功能需求
5. 如果有涉及系统对接，说明与 TA、FA、投资交易等系统的集成点`;

    const userPrompt = `原始需求：
${requirement}

${context ? `补充上下文信息：\n${context}\n` : ''}

请生成一份完整的 PRD 文档。`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Call AI API from server side
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
      return NextResponse.json(
        { error: `API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    let content = '';
    switch (provider.id) {
      case 'anthropic':
        content = data.content?.[0]?.text || '';
        break;
      case 'qwen':
        content = data.output?.choices?.[0]?.message?.content || '';
        break;
      default:
        content = data.choices?.[0]?.message?.content || '';
    }

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        provider: providerId,
        model,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (_error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败' },
      { status: 500 }
    );
  }
}
