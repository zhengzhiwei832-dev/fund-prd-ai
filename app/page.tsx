'use client';

import { useState, useCallback } from 'react';
import { RequirementForm } from '@/components/RequirementForm';
import { PRDViewer } from '@/components/PRDViewer';
import { AIProvider, callAIAPI } from '@/lib/ai-config';
import { getKnowledgeBaseText } from '@/lib/knowledge-base';
import { saveGeneration, updateGeneration } from '@/lib/supabase';

export default function Home() {
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [wasExported, setWasExported] = useState(false);

  const handleGenerate = async (
    requirement: string,
    context: string,
    provider: AIProvider,
    apiKey: string,
    model: string
  ) => {
    setIsLoading(true);
    setError('');
    setGeneratedPRD('');
    setCurrentRecordId(null);
    setWasExported(false);

    try {
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

      // Call AI API from frontend
      const content = await callAIAPI(provider, apiKey, model, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      setGeneratedPRD(content);

      // Save to database
      const recordId = await saveGeneration({
        provider: provider.id,
        model,
        requirement,
        context,
        generated_content: content,
        was_edited: false,
        was_exported: false,
      });

      if (recordId) {
        setCurrentRecordId(recordId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback(async (editedContent: string, diff: string) => {
    if (currentRecordId) {
      await updateGeneration(currentRecordId, {
        edited_content: editedContent,
        edit_diff: diff,
        was_edited: true,
      });
    }
  }, [currentRecordId]);

  const handleDownload = useCallback(async () => {
    if (currentRecordId && !wasExported) {
      await updateGeneration(currentRecordId, {
        was_exported: true,
        export_format: 'markdown',
      });
      setWasExported(true);
    }
  }, [currentRecordId, wasExported]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            FundPRD AI
          </h1>
          <p className="text-lg text-gray-600">
            公募基金产品经理的智能 PRD 生成助手
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                输入需求
              </h2>
              <RequirementForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Right: PRD Output */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                生成的 PRD
              </h2>
              <div onClick={handleDownload}>
                <PRDViewer
                  content={generatedPRD}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by Multiple AI Models • 专为公募基金行业打造</p>
          <a
            href="/admin"
            className="text-gray-400 hover:text-gray-600 mt-2 inline-block"
          >
            管理员入口
          </a>
        </footer>
      </div>
    </main>
  );
}
