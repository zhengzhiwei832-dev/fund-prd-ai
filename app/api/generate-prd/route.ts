import { NextRequest, NextResponse } from 'next/server';
import { callKimi } from '@/lib/kimi-client';
import { getKnowledgeBaseText } from '@/lib/knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { requirement, context = '', docType = 'prd' } = await request.json();

    if (!requirement || requirement.trim().length === 0) {
      return NextResponse.json(
        { error: '需求描述不能为空' },
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

    const content = await callKimi([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        docType,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate PRD error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败' },
      { status: 500 }
    );
  }
}
